import pandas as pd
from prophet import Prophet

def forecast_consumption(df, periods=168): # forecast next 7 days hourly
    # Prophet requires 'ds' and 'y' columns
    prophet_df = df[['timestamp', 'consumption_kwh']].rename(columns={'timestamp': 'ds', 'consumption_kwh': 'y'})
    
    model = Prophet(yearly_seasonality=False, weekly_seasonality=True, daily_seasonality=True)
    model.fit(prophet_df)
    
    future = model.make_future_dataframe(periods=periods, freq='h')
    forecast = model.predict(future)
    
    # Return dates and yhat
    results = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(periods)
    
    return results.rename(columns={'ds': 'timestamp', 'yhat': 'forecast_kwh'}).to_dict('records')
