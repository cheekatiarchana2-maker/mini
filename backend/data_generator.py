import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

def generate_synthetic_data(file_path="electricity_data.csv", days=365):
    np.random.seed(42)
    start_date = datetime.now() - timedelta(days=days)
    dates = [start_date + timedelta(hours=i) for i in range(days * 24)]
    
    # Base load
    base_load = 0.5 + np.random.uniform(0, 0.2, len(dates))
    
    # Hourly patterns
    hour = np.array([d.hour for d in dates])
    daily_pattern = np.where((hour >= 7) & (hour <= 9), 1.5, 0) # Morning peak
    daily_pattern += np.where((hour >= 18) & (hour <= 22), 2.5, 0) # Evening peak
    daily_pattern += np.where((hour >= 1) & (hour <= 5), -0.3, 0) # Night drop
    
    # Appliances Rules (for Apriori)
    # AC: Indian summer — March through October, afternoon/evening hours
    month = np.array([d.month for d in dates])
    ac_usage = np.where(
        np.isin(month, [3, 4, 5, 6, 7, 8, 9, 10]) & (hour >= 13) & (hour <= 23), 2.0, 0
    )
    # Heater/Geyser: morning in winter (Nov–Feb), and also morning all year (water heater)
    heater_usage = np.where(
        (hour >= 6) & (hour <= 9), 1.5, 0  # morning geyser every day
    )
    heater_usage += np.where(
        np.isin(month, [11, 12, 1, 2]) & (hour >= 19) & (hour <= 23), 1.0, 0  # room heater in winter evenings
    )

    # Fan: active most of the day outside deep night
    fan_usage = np.where((hour >= 6) & (hour <= 23), 0.07, 0)  # ~70W fan

    # Fridge: constant ~150W background load
    fridge_usage = np.full(len(dates), 0.15)

    # TV: evening usage randomly on
    tv_usage = np.where(
        (hour >= 18) & (hour <= 23) & (np.random.random(len(dates)) > 0.4), 0.15, 0
    )

    # Washing Machine: weekends, mid-morning
    weekday = np.array([d.weekday() for d in dates])
    wm_usage = np.where(
        np.isin(weekday, [5, 6]) & (hour >= 9) & (hour <= 13), 0.8, 0
    ) * (np.random.random(len(dates)) > 0.5).astype(float)

    # Weekly patterns
    weekend_bump = np.where(np.isin(weekday, [5, 6]) & (hour >= 12) & (hour <= 18), 0.8, 0)

    # Anomalies
    anomalies = np.zeros(len(dates))
    anomaly_indices = np.random.choice(len(dates), size=int(len(dates)*0.01), replace=False)
    anomalies[anomaly_indices] += np.random.uniform(5.0, 10.0, len(anomaly_indices))

    # Total consumption
    consumption = base_load + daily_pattern + ac_usage + heater_usage + fan_usage + fridge_usage + tv_usage + wm_usage + weekend_bump + anomalies

    # Add noise
    consumption += np.random.normal(0, 0.2, len(dates))

    # Ensure positive
    consumption = np.maximum(consumption, 0.1)

    # Some missing values
    missing_indices = np.random.choice(len(dates), size=int(len(dates)*0.005), replace=False)

    df = pd.DataFrame({
        "timestamp": dates,
        "consumption_kwh": consumption,
        "ac_active": (ac_usage > 0).astype(int),
        "heater_active": (heater_usage > 0).astype(int),
        "tv_active": (tv_usage > 0).astype(int),
        "washing_machine_active": (wm_usage > 0).astype(int),
        "fan_active": (fan_usage > 0).astype(int),
        "fridge_active": np.ones(len(dates), dtype=int),
    })
    
    # Mask missing
    df.loc[missing_indices, "consumption_kwh"] = np.nan
    
    # Save
    df.to_csv(file_path, index=False)
    print(f"Generated {len(df)} rows of synthetic data at {file_path}")

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    generate_synthetic_data(os.path.join(current_dir, "electricity_data.csv"))
