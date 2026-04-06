import pandas as pd
import numpy as np

def load_and_preprocess_data(file_path):
    if str(file_path).endswith('.xlsm') or str(file_path).endswith('.xlsx'):
        df = pd.read_excel(file_path, engine='openpyxl')
    else:
        df = pd.read_csv(file_path)
    
    # Custom Dataset Adapter
    if 'Date' in df.columns and 'TimeRange' in df.columns:
        df['start_time'] = df['TimeRange'].astype(str).str.split('-').str[0].str.strip()
        df['timestamp'] = pd.to_datetime(df['Date'].astype(str) + ' ' + df['start_time'], errors='coerce', format='mixed')
    elif 'timestamp' in df.columns:
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        
    if 'Total' in df.columns:
        df['consumption_kwh'] = pd.to_numeric(df['Total'], errors='coerce')
        
    df['ac_active'] = (pd.to_numeric(df['AC'], errors='coerce').fillna(0) > 0).astype(int) if 'AC' in df.columns else 0
    df['heater_active'] = (pd.to_numeric(df['Heater'], errors='coerce').fillna(0) > 0).astype(int) if 'Heater' in df.columns else 0
    df['tv_active'] = (pd.to_numeric(df['TV'], errors='coerce').fillna(0) > 0).astype(int) if 'TV' in df.columns else 0
    df['washing_machine_active'] = (pd.to_numeric(df['WashingMachine'], errors='coerce').fillna(0) > 0).astype(int) if 'WashingMachine' in df.columns else 0
    

    if 'consumption_kwh' in df.columns:
        df['consumption_kwh'] = df['consumption_kwh'].interpolate(method='linear').bfill()
        
    if 'timestamp' in df.columns and 'consumption_kwh' in df.columns:
        df = df.dropna(subset=['timestamp', 'consumption_kwh'])
        df = df.sort_values('timestamp')
    
    return df
