import React from 'react';
import { Bell, Search, User, ChevronDown } from 'lucide-react';
import { useBatteryStore } from '../../store/batteryStore';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const { user, unreadNotificationCount, simulationActive, startSimulation, stopSimulation } = useBatteryStore();

  return (
    <header className="bg-gray-800 border-b border-gray-700 h-16 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3 lg:w-1/3">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="search"
            className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg block w-full pl-10 p-2.5 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search..."
          />
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div>
          {simulationActive ? (
            <button
              onClick={stopSimulation}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Stop Simulation
            </button>
          ) : (
            <button
              onClick={startSimulation}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Start Simulation
            </button>
          )}
        </div>
        
        <Link to="/notifications" className="relative text-gray-400 hover:text-white transition-colors">
          <Bell size={22} />
          {unreadNotificationCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
              {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
            </span>
          )}
        </Link>
        
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full overflow-hidden">
            <img src={user.profilePicture} alt={user.name} className="h-full w-full object-cover" />
          </div>
          <div className="hidden md:block">
            <div className="text-sm font-medium text-white">{user.name}</div>
            <div className="text-xs text-gray-400">{user.role}</div>
          </div>
          <ChevronDown size={16} className="text-gray-400" />
        </div>
      </div>
    </header>
  );
};

export default Header;