import pandas as pd
import numpy as np
from datetime import timedelta

def forecast_consumption(df, periods=168):
    """
    Lightweight simulated forecast based on historical averages and trends.
    No C++ compiler required.
    """
    if df.empty:
        return []

    # Ensure timestamp is datetime
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    # Calculate historical hourly averages to capture daily patterns
    df['hour'] = df['timestamp'].dt.hour
    hourly_avg = df.groupby('hour')['consumption_kwh'].mean().to_dict()
    
    # Calculate a simple trend (difference between last week and week before)
    last_ts = df['timestamp'].max()
    week_ago = last_ts - timedelta(days=7)
    two_weeks_ago = last_ts - timedelta(days=14)
    
    recent_avg = df[df['timestamp'] > week_ago]['consumption_kwh'].mean()
    previous_avg = df[(df['timestamp'] > two_weeks_ago) & (df['timestamp'] <= week_ago)]['consumption_kwh'].mean()
    
    trend_factor = (recent_avg / previous_avg) if previous_avg > 0 else 1.0
    # Cap trend factor to avoid wild swings
    trend_factor = max(0.8, min(1.2, trend_factor))

    results = []
    current_ts = last_ts
    
    for i in range(1, periods + 1):
        next_ts = last_ts + timedelta(hours=i)
        hour = next_ts.hour
        
        # Base value from historical average for that hour
        base_val = hourly_avg.get(hour, recent_avg)
        
        # Apply trend and some slight random noise for realism
        forecast_val = base_val * trend_factor * np.random.uniform(0.95, 1.05)
        
        # Simple confidence bounds
        std_val = df['consumption_kwh'].std() or (base_val * 0.1)
        lower = max(0, forecast_val - 1.96 * std_val * 0.2)
        upper = forecast_val + 1.96 * std_val * 0.2
        
        results.append({
            'timestamp': next_ts.strftime('%Y-%m-%dT%H:%M:%S'),
            'forecast_kwh': round(float(forecast_val), 3),
            'yhat_lower': round(float(lower), 3),
            'yhat_upper': round(float(upper), 3)
        })
        
    return results
