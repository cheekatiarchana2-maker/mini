from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import pandas as pd
import uvicorn
import logging
from ml_engine.preprocessing import load_and_preprocess_data
from ml_engine.forecasting import forecast_consumption
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
        # forecast requires converting timestamp back to string
        res = forecast_consumption(df, periods=168)
        for r in res:
            if isinstance(r['timestamp'], (pd.Timestamp, str)):
                ts = pd.to_datetime(r['timestamp'])
                r['timestamp'] = ts.strftime('%Y-%m-%dT%H:%M:%S')
        return res
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
