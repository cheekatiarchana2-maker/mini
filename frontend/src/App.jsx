import React, { useEffect, useState } from 'react';
import { fetchData, fetchForecast, fetchPatterns, fetchAnomalies, fetchResults } from './api';
import Sidebar from './components/Sidebar';
import KPICards from './components/KPICards';
import ForecastingView from './components/ForecastingView';
import AnomalyChart from './components/AnomalyChart';
import PatternAnalysisView from './components/PatternAnalysisView';
import CostOptimization from './components/CostOptimization';
import AlertsView from './components/AlertsView';
import BillEstimate from './components/BillEstimate';
import HomeNavigationCards from './components/HomeNavigationCards';
import AlertsCarousel from './components/AlertsCarousel';

function App() {
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('Home');
  const [data, setData] = useState({ historical: [], forecast: [], patterns: [], anomalies: [], insights: null });

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

  return (
    <div className="flex min-h-screen bg-[#f3f4f6]">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />

      <main className="flex-1 px-8 py-6 w-full">
        {loading ? (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <>
            {/* Content Switcher */}
            <div className="w-full animation-fade-in transition-all">
              {currentView === 'Home' && (
                <div className="w-full space-y-2">
                  <div className="py-12 flex flex-col items-center justify-center animate-in fade-in slide-in-from-top-8 duration-1000 ease-out">
                    <h1 className="text-6xl font-black text-slate-900 tracking-tighter mb-4">Welcome to ElectraHome</h1>
                    <p className="text-slate-500 text-xl font-medium">Your household's intelligent energy companion</p>
                  </div>
                  <KPICards />
                  <HomeNavigationCards setCurrentView={setCurrentView} />
                </div>
              )}
              {currentView === 'Forecasting' && (
                <ForecastingView />
              )}
              {currentView === 'Anomaly Detection' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start mt-8">
                  <div className="lg:col-span-2 flex flex-col h-full"><AnomalyChart anomalies={data.anomalies} /></div>
                  <div className="lg:col-span-1"><AlertsCarousel /></div>
                </div>
              )}
              {currentView === 'Pattern Analysis' && (
                <PatternAnalysisView />
              )}
              {(currentView === 'Cost Optimization' || currentView === 'Finances') && (
                <CostOptimization />
              )}
              {currentView === 'Alerts' && (
                <AlertsView />
              )}
              {currentView === 'Settings' && (
                <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm mt-8 max-w-2xl">
                  <h2 className="text-2xl font-medium text-slate-800 mb-6">Application Settings</h2>
                  <div className="space-y-6">
                    <div className="p-4 border border-slate-200 rounded-xl flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-800">Email Notifications</h4>
                        <p className="text-sm text-slate-500">Receive weekly summaries of appliance usage.</p>
                      </div>
                      <div className="w-12 h-6 bg-purple-600 rounded-full flex items-center p-1 cursor-pointer">
                        <div className="w-4 h-4 bg-white rounded-full translate-x-6 transition-transform"></div>
                      </div>
                    </div>
                    <div className="p-4 border border-slate-200 rounded-xl flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-800">Dark Mode</h4>
                        <p className="text-sm text-slate-500">Switch between light and dark themes.</p>
                      </div>
                      <div className="w-12 h-6 bg-slate-300 rounded-full flex items-center p-1 cursor-pointer">
                        <div className="w-4 h-4 bg-white rounded-full transition-transform"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
