import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useBatteryStore } from '../../store/batteryStore';

const Layout: React.FC = () => {
  const initializeBatteries = useBatteryStore(state => state.initializeBatteries);
  
  useEffect(() => {
    // Initialize the store with mock data
    initializeBatteries();
    
    // Set page title
    document.title = 'BatteryAI - Smart Battery Management Dashboard';
    
    // Update favicon to be more battery-themed
    const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (link) {
      link.href = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%2310b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect rx="2" ry="2" width="18" height="12" x="3" y="6"></rect><line x1="7" y1="10" x2="7" y2="14"></line></svg>';
    }
  }, [initializeBatteries]);
  
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;