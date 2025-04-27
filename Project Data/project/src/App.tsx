import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Batteries from './pages/Batteries';
import Analytics from './pages/Analytics';
import Chatbot from './pages/Chatbot';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import { BatterySOCEstimation } from './components/BatterySOCEstimation';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="batteries" element={<Batteries />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="chatbot" element={<Chatbot />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
          <Route path="soc-estimation" element={<BatterySOCEstimation />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;