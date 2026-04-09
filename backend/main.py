from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import pandas as pd
import uvicorn
import logging
from ml_engine.preprocessing import load_and_preprocess_data
from ml_engine.forecasting_v2 import forecast_consumption  # Use v2 for compiler-free run
from ml_engine.patterns import analyze_patterns
from ml_engine.anomalies import detect_anomalies
from ml_engine.insights import get_insights

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Electricity Consumption API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Robust Pathing: Check local project then fallback to desktop
LOCAL_DATA = "electricity_data.csv"
DESKTOP_DATA = r"C:\Users\cheek\OneDrive\Desktop\electricity_data.csv"
DATA_PATH = LOCAL_DATA if os.path.exists(LOCAL_DATA) else DESKTOP_DATA

def get_data():
    try:
        if not os.path.exists(DATA_PATH):
            logger.info(f"Data not found at {DATA_PATH}, generating synthetic data...")
            import data_generator
            data_generator.generate_synthetic_data(DATA_PATH)
        return load_and_preprocess_data(DATA_PATH)
    except Exception as e:
        logger.error(f"Error loading data: {e}")
        return pd.DataFrame(columns=['timestamp', 'consumption_kwh'])

@app.get("/data")
def read_data():
    df = get_data()
    if df.empty or 'timestamp' not in df.columns:
        return []
    
    try:
        max_ts = df['timestamp'].max()
        recent = df[df['timestamp'] >= max_ts - pd.Timedelta(days=7)].copy()
        recent['timestamp'] = recent['timestamp'].dt.strftime('%Y-%m-%dT%H:%M:%S')
        return recent[['timestamp', 'consumption_kwh']].to_dict('records')
    except Exception as e:
        logger.error(f"Data endpoint error: {e}")
        return []

@app.get("/forecast")
def get_forecast():
    df = get_data()
    if df.empty:
        return []
        
    try:
        # Forecast results from v2 are already formatted with strings
        return forecast_consumption(df, periods=168)
    except Exception as e:
        logger.error(f"Forecasting error: {e}")
        return []

@app.get("/patterns")
def get_patterns():
    df = get_data()
    if df.empty:
        return []
    try:
        return analyze_patterns(df)
    except Exception as e:
        logger.error(f"Pattern Analysis error: {e}")
        return []

@app.get("/anomalies")
def get_anomalies():
    df = get_data()
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
def get_daily_data():
    df = get_data()
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
def get_results():
    df = get_data()
    if df.empty:
        return get_insights(df, [], [])
        
    try:
        anomalies = detect_anomalies(df)
        rules = analyze_patterns(df)
        return get_insights(df, anomalies, rules)
    except Exception as e:
        logger.error(f"Results Insight error: {e}")
        return get_insights(df, [], [])

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
