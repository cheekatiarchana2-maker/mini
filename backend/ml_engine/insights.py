import pandas as pd

def get_insights(df, anomalies, rules):
    insights = []
    
    # 1. Total electricity used in last 30 days vs previous 30
    if df.empty or 'timestamp' not in df.columns or 'consumption_kwh' not in df.columns:
        return {"energy_score": 100, "recommendations": ["No usage data available yet. Start using appliances to see insights!"]}

    try:
        max_date = df['timestamp'].max()
        recent = df[df['timestamp'] >= max_date - pd.Timedelta(days=30)]['consumption_kwh'].sum()
        prev = df[(df['timestamp'] >= max_date - pd.Timedelta(days=60)) & 
                  (df['timestamp'] < max_date - pd.Timedelta(days=30))]['consumption_kwh'].sum()
                  
        insights.append(f"Recent 30-day consumption: {recent:.2f} kWh (Previous: {prev:.2f} kWh).")
    except Exception:
        return {"energy_score": 100, "recommendations": ["Calculation error. Please ensure your timestamps are valid."]}
    
    # 2. Check rules for optimizations
    for rule in rules:
        cons = rule.get('consequents', [])
        conf = rule.get('confidence', 0)
        if 'washing_machine_active' in cons and conf > 0.5:
            insights.append("Consider running washing machines during off-peak hours (e.g. night or early morning) to reduce cost.")
            break
        if 'heater_active' in cons and conf > 0.7:
             insights.append("High correlation with heater active. Optimize home insulation to minimize heater usage.")
             break
            
    # Energy score calculation
    base_score = 100
    if len(anomalies) > 5:
        base_score -= 15
        insights.append("Multiple anomalies detected. Investigate high usage spikes to prevent energy waste.")
    
    if recent > prev * 1.1:
        base_score -= 20
        insights.append("Usage map shows a 10%+ increase from last month. Monitor your AC or heating closely.")
    elif recent < prev * 0.9:
        base_score += 10
        insights.append("Great job! You've reduced your electricity consumption by over 10% this month.")
        
    energy_score = max(0, min(100, base_score))
    
    return {
        "energy_score": energy_score,
        "recommendations": insights
    }
