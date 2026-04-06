import traceback
from main import get_data, read_data, get_forecast, get_patterns, get_anomalies, get_results

try:
    print('Testing read...')
    read_data()
    print('Testing forecast...')
    get_forecast()
    print('Testing patterns...')
    get_patterns()
    print('Testing anomalies...')
    get_anomalies()
    print('Testing results...')
    get_results()
    print('ALL GOOD')
except Exception as e:
    traceback.print_exc()
