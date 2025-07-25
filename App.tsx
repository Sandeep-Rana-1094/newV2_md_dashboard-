
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import { LatamReserveDashboard } from './components/LatamReserveDashboard';
import { GPDashboard } from './components/GPDashboard';
import AnimatedBackground from './components/AnimatedBackground';
import { OrderAnalysisDashboard } from './components/OrderAnalysisDashboard';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('latam_reserve');

  return (
    <div className="relative min-h-screen bg-background font-sans text-text-primary">
      <AnimatedBackground />
      <div className="relative z-10 flex h-full min-h-screen">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeView === 'latam_reserve' && <LatamReserveDashboard />}
          {activeView === 'country_gp' && <GPDashboard />}
          {activeView === 'order_analysis' && <OrderAnalysisDashboard />}
        </main>
      </div>
    </div>
  );
};

export default App;