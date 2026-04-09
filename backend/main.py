from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
import os
from datetime import datetime
import pandas as pd
import uvicorn
import logging
from ml_engine.preprocessing import load_and_preprocess_data
from ml_engine.forecasting_v2 import forecast_consumption  # Use v2 for compiler-free run
from ml_engine.patterns import analyze_patterns
from ml_engine.anomalies import detect_anomalies
from ml_engine.insights import get_insights

from database import engine, get_db, SessionLocal
import models
import schemas
from auth import hash_password, verify_password, create_access_token, get_current_user

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create all database tables on startup
models.Base.metadata.create_all(bind=engine)

def apply_migrations():
    """Manually apply migrations for SQLite since create_all doesn't update existing tables."""
    from sqlalchemy import inspect, text
    inspector = inspect(engine)
    columns = [col['name'] for col in inspector.get_columns("user_settings")]
    
    if "monthly_budget" not in columns:
        logger.info("Migrating database: adding 'monthly_budget' column to 'user_settings'")
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE user_settings ADD COLUMN monthly_budget FLOAT DEFAULT 3500.0"))
            conn.commit()

apply_migrations()

def migrate_csv_to_db():
    db = SessionLocal()
    try:
        if db.query(models.ConsumptionData).count() == 0:
            logger.info("Database is empty, migrating CSV data...")
            local_data = "electricity_data.csv"
            desktop_data = r"C:\Users\cheek\OneDrive\Desktop\electricity_data.csv"
            data_path = local_data if os.path.exists(local_data) else desktop_data
            
            if not os.path.exists(data_path):
                logger.info(f"Data not found at {data_path}, generating synthetic data...")
                import data_generator
                data_generator.generate_synthetic_data(data_path)
            
            df = pd.read_csv(data_path)
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            
            records = []
            for _, row in df.iterrows():
                records.append(models.ConsumptionData(
                    timestamp=row['timestamp'],
                    consumption_kwh=row['consumption_kwh'],
                    ac_active=int(row.get('ac_active', 0)),
                    heater_active=int(row.get('heater_active', 0)),
                    tv_active=int(row.get('tv_active', 0)),
                    washing_machine_active=int(row.get('washing_machine_active', 0)),
                    fan_active=int(row.get('fan_active', 0)),
                    fridge_active=int(row.get('fridge_active', 1)),
                ))
            db.bulk_save_objects(records)
            db.commit()
            logger.info(f"Successfully migrated {len(records)} records to database.")
    except Exception as e:
        logger.error(f"Migration failed: {e}")
    finally:
        db.close()

migrate_csv_to_db()

app = FastAPI(title="Electricity Consumption API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_data(db: Session):
    try:
        # Fetch data from SQLite instead of CSV
        results = db.query(models.ConsumptionData).order_by(models.ConsumptionData.timestamp.desc()).limit(2000).all()
        # Convert SQLAlchemy objects to DataFrame for ML engines
        data = []
        for r in results:
            data.append({
                "timestamp": r.timestamp,
                "consumption_kwh": r.consumption_kwh,
                "ac_active": r.ac_active,
                "heater_active": r.heater_active,
                "tv_active": r.tv_active,
                "washing_machine_active": r.washing_machine_active,
                "fan_active": r.fan_active,
                "fridge_active": r.fridge_active,
            })
        df = pd.DataFrame(data)
        if not df.empty:
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            df = df.sort_values('timestamp')
        return df
    except Exception as e:
        logger.error(f"Error loading data from DB: {e}")
        return pd.DataFrame(columns=['timestamp', 'consumption_kwh'])

@app.get("/data")
def read_data(db: Session = Depends(get_db)):
    df = get_data(db)
    if df.empty or 'timestamp' not in df.columns:
        return []
    
    try:
        # Return recent data for charts
        max_ts = df['timestamp'].max()
        recent = df[df['timestamp'] >= max_ts - pd.Timedelta(days=7)].copy()
        recent['timestamp'] = recent['timestamp'].dt.strftime('%Y-%m-%dT%H:%M:%S')
        return recent[['timestamp', 'consumption_kwh']].to_dict('records')
    except Exception as e:
        logger.error(f"Data endpoint error: {e}")
        return []

@app.get("/forecast")
def get_forecast(db: Session = Depends(get_db)):
    df = get_data(db)
    if df.empty:
        return []
        
    try:
        # Forecast results from v2 are already formatted with strings
        return forecast_consumption(df, periods=168)
    except Exception as e:
        logger.error(f"Forecasting error: {e}")
        return []

@app.get("/patterns")
def get_patterns(db: Session = Depends(get_db)):
    df = get_data(db)
    if df.empty:
        return []
    try:
        return analyze_patterns(df)
    except Exception as e:
        logger.error(f"Pattern Analysis error: {e}")
        return []

@app.get("/anomalies")
def get_anomalies(db: Session = Depends(get_db)):
    df = get_data(db)
    if df.empty:
        return []
    try:
        anomalies = detect_anomalies(df)
        for a in anomalies:
            a['timestamp'] = pd.to_datetime(a['timestamp']).strftime('%Y-%m-%dT%H:%M:%S')
        return anomalies
    except Exception as e:
        logger.error(f"Anomaly Detection error: {e}")
        return []

@app.get("/daily-data")
def get_daily_data(db: Session = Depends(get_db)):
    df = get_data(db)
    if df.empty or 'timestamp' not in df.columns:
        return []
    try:
        df = df.copy()
        df['date'] = df['timestamp'].dt.date

        # Realistic per-hour kWh consumed when appliance is active
        POWER = {
            'ac':              1.5,   # AC ~1.5 kWh/hr (split AC, 1.5-ton)
            'heater':          1.2,   # Geyser/heater ~1.2 kWh/hr
            'washing_machine': 0.8,   # WM ~800W
            'tv':              0.15,  # TV ~150W
            'fan':             0.07,  # Fan ~70W
            'fridge':          0.15,  # Fridge ~150W constant
        }

        df['ac_kwh']      = df.get('ac_active', 0)               * POWER['ac']
        df['heater_kwh']  = df.get('heater_active', 0)            * POWER['heater']
        df['wm_kwh']      = df.get('washing_machine_active', 0)   * POWER['washing_machine']
        df['tv_kwh']      = df.get('tv_active', 0)                * POWER['tv']
        df['fan_kwh']     = df.get('fan_active', 0)               * POWER['fan']
        df['fridge_kwh']  = df.get('fridge_active', 0)            * POWER['fridge']

        # Lights & Others = total minus all estimated appliance loads (clipped at 0)
        df['appliance_sum'] = df['ac_kwh'] + df['heater_kwh'] + df['wm_kwh'] + df['tv_kwh'] + df['fan_kwh'] + df['fridge_kwh']
        df['lights_kwh'] = (df['consumption_kwh'] - df['appliance_sum']).clip(lower=0)

        daily = df.groupby('date').agg(
            total_kwh=('consumption_kwh',         'sum'),
            ac_kwh=   ('ac_kwh',                  'sum'),
            heater_kwh=('heater_kwh',             'sum'),
            wm_kwh=   ('wm_kwh',                  'sum'),
            tv_kwh=   ('tv_kwh',                  'sum'),
            fan_kwh=  ('fan_kwh',                 'sum'),
            fridge_kwh=('fridge_kwh',             'sum'),
            lights_kwh=('lights_kwh',             'sum'),
        ).reset_index()

        # Determine anomaly: days where total > mean + 1.5*std
        mean_kwh = daily['total_kwh'].mean()
        std_kwh  = daily['total_kwh'].std()
        daily['is_anomaly'] = daily['total_kwh'] > (mean_kwh + 1.5 * std_kwh)

        # Return last 30 days
        result = []
        for _, row in daily.tail(30).iterrows():
            total  = float(row['total_kwh'])
            ac     = float(row['ac_kwh'])
            heat   = float(row['heater_kwh'])
            wm     = float(row['wm_kwh'])
            tv     = float(row['tv_kwh'])
            fan    = float(row['fan_kwh'])
            fridge = float(row['fridge_kwh'])
            lights = float(row['lights_kwh'])

            # Build insight from dominant appliance
            breakdown = {
                'AC': ac, 'Geyser': heat, 'Washing Machine': wm,
                'TV': tv, 'Fan': fan, 'Fridge': fridge, 'Lights & Others': lights
            }
            dominant = max(breakdown.items(), key=lambda x: x[1])
            pct = round((dominant[1] / total * 100) if total > 0 else 0, 1)

            if row['is_anomaly']:
                insight = f"Unusually high day — {dominant[0]} drove {pct}% of total consumption, well above your average."
            elif dominant[0] == 'AC':
                insight = f"AC dominated usage today, likely due to warm weather — {pct}% of the day's load."
            elif dominant[0] == 'Geyser':
                insight = f"Geyser ran longer than usual — contributed {pct}% of daily consumption."
            elif dominant[0] == 'Lights & Others':
                insight = f"Lights contributed nearly {pct}% of total. Consider switching to LEDs for easy savings."
            elif dominant[0] == 'Washing Machine':
                insight = f"Washing machine usage is notable today at {pct}%. Try full loads to reduce cycles."
            else:
                insight = f"{dominant[0]} was the top consumer at {pct}% of daily usage."

            result.append({
                "date": str(row['date']),
                "total_kwh": round(total, 2),
                "appliances": {
                    "AC":              round(ac, 2),
                    "Geyser":          round(heat, 2),
                    "Washing Machine": round(wm, 2),
                    "TV":              round(tv, 2),
                    "Fan":             round(fan, 2),
                    "Fridge":          round(fridge, 2),
                    "Lights & Others": round(lights, 2),
                },
                "is_anomaly": bool(row['is_anomaly']),
                "insight": insight
            })
        return result
    except Exception as e:
        logger.error(f"Daily data endpoint error: {e}")
        return []

@app.get("/results")
def get_results(db: Session = Depends(get_db)):
    df = get_data(db)
    if df.empty:
        return get_insights(df, [], [])
        
    try:
        anomalies = detect_anomalies(df)
        rules = analyze_patterns(df)
        return get_insights(df, anomalies, rules)
    except Exception as e:
        logger.error(f"Results Insight error: {e}")
        return get_insights(df, [], [])

# ══════════════════════════════════════════════════════════════
# AUTH & SETTINGS ENDPOINTS
# ══════════════════════════════════════════════════════════════

@app.post("/register", response_model=schemas.Token)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Register a new user and initialize default settings."""
    existing = db.query(models.User).filter(models.User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Account already exists.")

    username = user.email.split("@")[0]
    base_username = username
    counter = 1
    while db.query(models.User).filter(models.User.username == username).first():
        username = f"{base_username}{counter}"
        counter += 1

    db_user = models.User(
        username=username,
        email=user.email,
        hashed_password=hash_password(user.password),
        phone=user.phone,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Initialize default settings for the new user
    user_settings = models.UserSettings(user_id=db_user.id)
    db.add(user_settings)
    db.commit()

    access_token = create_access_token(data={"sub": db_user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": db_user,
    }


@app.post("/login", response_model=schemas.Token)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    """Authenticate and return JWT."""
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials.")

    # Ensure user has settings (migration safety)
    if not user.settings:
        user_settings = models.UserSettings(user_id=user.id)
        db.add(user_settings)
        db.commit()
        db.refresh(user)

    access_token = create_access_token(data={"sub": user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@app.get("/me", response_model=schemas.UserOut)
def get_profile(current_user: models.User = Depends(get_current_user)):
    return current_user


@app.get("/settings", response_model=schemas.UserSettingsOut)
def get_user_settings(current_user: models.User = Depends(get_current_user)):
    """Fetch preferences for the current user."""
    return current_user.settings


@app.put("/settings", response_model=schemas.UserSettingsOut)
def update_user_settings(
    updates: schemas.UserSettingsUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update user preferences."""
    settings = current_user.settings
    for field, value in updates.model_dump(exclude_unset=True).items():
        setattr(settings, field, value)
    
    db.commit()
    db.refresh(settings)
    return settings


@app.get("/alerts")
def get_active_alerts(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Dynamically generate alerts based on current data and user settings."""
    df = get_data(db)
    if df.empty:
        return []

    settings = current_user.settings
    alerts = []

    # 1. Critical Anomaly Alerts (Fire Risk/Spikes)
    if settings.dangerous_spikes:
        anomalies = detect_anomalies(df)
        for a in anomalies:
            if a.get('type') == 'spike' and float(a.get('value', 0)) > 6.0:
                alerts.append({
                    "id": f"c-{a['timestamp']}",
                    "type": "ANOMALY",
                    "title": "Dangerous Power Spike",
                    "appliance": "Unknown Device",
                    "time": "RECENT",
                    "impact": "CRITICAL: FIRE RISK",
                    "severity": "CRITICAL"
                })

    # 2. General Anomaly Alerts
    if settings.anomaly_alerts:
        # Simplified idle load detection
        recent_avg = df.tail(24)['consumption_kwh'].mean()
        if recent_avg > 1.0: # Arbitrary high idle threshold
             alerts.append({
                "id": "idle-1",
                "type": "ANOMALY",
                "title": "Unusual Idle Load",
                "appliance": "General",
                "time": "LAST 24H",
                "impact": "IN EFFICIENCY DETECTED",
                "severity": "HIGH"
            })

    # 3. Forecasting Alerts
    if settings.forecasting_alerts:
        forecast = forecast_consumption(df, periods=24)
        peak = max([f['consumption_kwh'] for f in forecast]) if forecast else 0
        if peak > 4.0:
             alerts.append({
                "id": "f-1",
                "type": "FORECAST",
                "title": "Evening Peak Predicted",
                "desc": "Predicted usage exceeds meter safety cap.",
                "time": "TONIGHT",
                "impact": "HIGH LOAD RISK",
                "severity": "URGENT"
            })

    return alerts


@app.get("/bill-status")
def get_bill_status(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Calculate current spend, projected spend, and compare with budget."""
    now = datetime.now()
    month_start = datetime(now.year, now.month, 1)
    
    # Calculate current usage in kWh
    usage = db.query(func.sum(models.ConsumptionData.consumption_kwh))\
              .filter(models.ConsumptionData.timestamp >= month_start)\
              .scalar() or 0.0
              
    tariff = 7.0 # ₹7 per kWh
    current_spend = usage * tariff
    
    # Simple linear projection
    days_in_month = pd.Period(now.strftime("%Y-%m")).days_in_month
    days_passed = now.day if now.day > 0 else 1
    projected_spend = (current_spend / days_passed) * days_in_month
    
    return {
        "current_spend": round(current_spend, 2),
        "projected_spend": round(projected_spend, 2),
        "budget_limit": current_user.settings.monthly_budget,
        "usage_kwh": round(usage, 2),
        "month_name": now.strftime("%B")
    }


@app.put("/me", response_model=schemas.UserOut)
def update_profile(
    updates: schemas.UserUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update the authenticated user's profile fields."""
    if updates.email is not None:
        # Check uniqueness
        existing = db.query(models.User).filter(
            models.User.email == updates.email,
            models.User.id != current_user.id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use.")
        current_user.email = updates.email
        current_user.username = updates.email.split("@")[0]

    if updates.phone is not None:
        current_user.phone = updates.phone

    if updates.password is not None:
        current_user.hashed_password = hash_password(updates.password)

    db.commit()
    db.refresh(current_user)
    logger.info(f"Profile updated for user id={current_user.id}")
    return current_user


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
