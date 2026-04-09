import pandas as pd
from sklearn.ensemble import IsolationForest

def detect_anomalies(df):
    if df.empty:
        return []
        
    # Ensure timestamp is datetime
    if not pd.api.types.is_datetime64_any_dtype(df['timestamp']):
        df['timestamp'] = pd.to_datetime(df['timestamp'])

    # Use consumption and hour of day as features
    X = pd.DataFrame({
        'consumption_kwh': df['consumption_kwh'],
        'hour': df['timestamp'].dt.hour
    })
    
    # Isolation Forest for finding outliers
    model = IsolationForest(contamination=0.015, random_state=42)
    preds = model.fit_predict(X)
    
    # Calculate "normal" baseline (mean per hour)
    hourly_means = df[preds == 1].groupby(df['timestamp'].dt.hour)['consumption_kwh'].mean().to_dict()
    
    # Identify anomalies (-1)
    anomaly_df = df[preds == -1].copy()
    results = []
    
    for _, row in anomaly_df.iterrows():
        hour = row['timestamp'].hour
        baseline = hourly_means.get(hour, 1.0) # Default to 1.0 if no baseline
        pct_increase = ((row['consumption_kwh'] - baseline) / baseline) * 100
        
        # Determine likely appliance based on hour and magnitude
        appliance = "General Usage Spike"
        icon = "Zap"
        explanation = f"Consumption is {int(pct_increase)}% higher than your usual pattern."
        tip = "Check if any extra lights or gadgets are left on."
        savings = "₹10/day"

        if 6 <= hour <= 9:
            appliance = "Water Heater"
            icon = "Thermometer"
            explanation = "Usually high consumption during morning routine"
            tip = "Reducing geyser temperature to 50°C can save ₹80/month."
            savings = "₹80/month"
        elif 10 <= hour <= 15:
            if row['consumption_kwh'] > 4.5:
                appliance = "Washing Machine"
                icon = "WashingMachine" 
                explanation = "Heavy load detected during the day"
                tip = "Consider running full loads only to save water and ₹45/month."
                savings = "₹45/month"
            else:
                appliance = "Kitchen Appliances"
                icon = "UtensilsCrossed"
                explanation = "A mix of kitchen gadgets drawn power"
                tip = "Unplug small appliances when not in use."
                savings = "₹20/month"
        elif 18 <= hour <= 21:
            if row['consumption_kwh'] > 5.0:
                appliance = "Microwave / Oven"
                icon = "Microwave"
                explanation = "High intensity usage during dinner prep"
                tip = "Defrost food naturally to reduce microwave usage."
                savings = "₹60/month"
            else:
                appliance = "Home Entertainment"
                icon = "Tv"
                explanation = "Multiple devices active during peak hours"
                tip = "Use a smart power strip to avoid standby power loss."
                savings = "₹35/month"
        elif 22 <= hour or hour <= 5:
            if row['consumption_kwh'] > 3.5:
                appliance = "Air Conditioner"
                icon = "Wind"
                explanation = "AC running at high cooling during sleep"
                tip = "Set the temperature to 24°C for optimal saving of ₹120/month."
                savings = "₹120/month"
            else:
                appliance = "Unusual Night Activity"
                icon = "Moon"
                explanation = "Unexpected power draw during rest hours"
                tip = "Check for background appliances like PC or decorative lights."
                savings = "₹25/month"

        results.append({
            "timestamp": row['timestamp'].strftime('%Y-%m-%dT%H:%M:%S'),
            "consumption_kwh": float(row['consumption_kwh']),
            "baseline_kwh": float(baseline),
            "percentage_increase": int(pct_increase),
            "appliance": appliance,
            "icon": icon,
            "explanation": explanation,
            "tip": tip,
            "savings": savings
        })
    
    return results
