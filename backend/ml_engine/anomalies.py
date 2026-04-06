import pandas as pd
from sklearn.ensemble import IsolationForest

def detect_anomalies(df):
    model = IsolationForest(contamination=0.01, random_state=42)
    # Use consumption and hour of day as features
    X = pd.DataFrame({
        'consumption_kwh': df['consumption_kwh'],
        'hour': df['timestamp'].dt.hour
    })
    
    preds = model.fit_predict(X)
    
    # preds is -1 for anomalies, 1 for normal
    anomaly_df = df[preds == -1].copy()
    
    # Return list of anomalies
    return anomaly_df[['timestamp', 'consumption_kwh']].to_dict('records')
