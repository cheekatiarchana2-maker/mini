import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { fetchData, fetchForecast, fetchPatterns, fetchAnomalies, fetchResults, fetchProfile, fetchSettings } from './api';
import Sidebar from './components/Sidebar';
import KPICards from './components/KPICards';
import ForecastingView from './components/ForecastingView';
import AnomalyChart from './components/AnomalyChart';
import PatternAnalysisView from './components/PatternAnalysisView';
import CostOptimization from './components/CostOptimization';
import AlertsView from './components/AlertsView';
import HomeNavigationCards from './components/HomeNavigationCards';
import Settings from './components/Settings';
import EnergyBackground from './components/EnergyBackground';
import EnergyFlowAnimation from './components/EnergyFlowAnimation';
import AuthPage from './components/AuthPage';
import ProfileView from './components/ProfileView';
import { translations } from './translations';

function App() {
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('Home');
  const [data, setData] = useState({ historical: [], forecast: [], patterns: [], anomalies: [], insights: null });
  const [language, setLanguage] = useState('English');
  const [darkMode, setDarkMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [settings, setSettings] = useState({
    dangerous_spikes: true,
    anomaly_alerts: true,
    forecasting_alerts: true,
    pattern_alerts: true,
    cost_optimization_alerts: true,
    monthly_budget: 3500.0
  });

  const t = translations[language] || translations.English;

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Check for existing JWT token on mount — auto-authenticate if valid
  useEffect(() => {
    const token = localStorage.getItem('electra_token');
    if (token) {
      Promise.all([fetchProfile(), fetchSettings()])
        .then(([user, userSettings]) => {
          setCurrentUser(user);
          setSettings(userSettings);
          setLanguage(userSettings.language || 'English');
          setDarkMode(userSettings.dark_mode || false);
          setIsAuthenticated(true);
        })
        .catch(() => {
          localStorage.removeItem('electra_token');
        });
    }
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [historical, forecast, patterns, anomalies, insights] = await Promise.all([
        fetchData(), fetchForecast(), fetchPatterns(), fetchAnomalies(), fetchResults()
      ]);
      setData({ historical, forecast, patterns, anomalies, insights });
    } catch (error) { console.error("Failed to fetch data:", error); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadAllData(); }, []);

  if (!isAuthenticated) {
    return (
      <AuthPage 
        onAuthSuccess={(userData) => { 
          setCurrentUser(userData); 
          if (userData.settings) {
            setSettings(userData.settings);
            setLanguage(userData.settings.language || 'English');
            setDarkMode(userData.settings.dark_mode || false);
          }
          setIsAuthenticated(true); 
        }} 
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-transparent transition-colors duration-500 relative">
      <EnergyBackground />
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        language={language} 
      />

      <main className="flex-1 px-8 py-6 w-full relative z-10">
        {loading ? (
          <div className="flex items-center justify-center h-[60vh] flex-col gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="text-slate-400 font-bold animate-pulse">{t.loading}</p>
          </div>
        ) : (
          <div className="w-full animation-fade-in transition-all">
            {currentView === 'Home' && (
              <div className="w-full relative">
                {/* Diagonal energy animation — absolutely positioned behind everything */}
                <EnergyFlowAnimation />

                {/* Header */}
                <div className="py-14 flex flex-col items-center justify-center animate-in fade-in slide-in-from-top-8 duration-1000 ease-out relative z-10">
                  <h1 className="text-6xl font-black text-white tracking-tighter mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] text-center">{t.welcome}</h1>
                </div>

                {/* KPIs + Nav Cards */}
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-10">
                    <KPICards language={language} />
                    <HomeNavigationCards setCurrentView={setCurrentView} language={language} />
                </div>
              </div>
            )}
            {currentView === 'Forecasting' && <ForecastingView language={language} setCurrentView={setCurrentView} />}
            {currentView === 'Anomaly Detection' && (
              <div className="w-full mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <AnomalyChart anomalies={data.anomalies} language={language} />
              </div>
            )}
            {currentView === 'Pattern Analysis' && (
              <PatternAnalysisView 
                patterns={data.patterns} 
                historicalData={data.historical} 
                language={language} 
              />
            )}

            {(currentView === 'Cost Optimization' || currentView === 'Finances') && <CostOptimization language={language} />}
            {currentView === 'Alerts' && <AlertsView language={language} settings={settings} />}
            {currentView === 'Profile' && (
              <ProfileView onSignOut={() => { setIsAuthenticated(false); setCurrentUser(null); }} />
            )}
            {currentView === 'Settings' && (
              <Settings 
                language={language} setLanguage={setLanguage} 
                darkMode={darkMode} setDarkMode={setDarkMode} 
                settings={settings} setSettings={setSettings}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
