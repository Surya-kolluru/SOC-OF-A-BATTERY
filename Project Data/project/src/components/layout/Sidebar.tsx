import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Battery, BarChart2, MessageCircle, Bell, Settings, Activity } from 'lucide-react';
import classNames from 'classnames';

const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/batteries', label: 'Batteries', icon: Battery },
    { path: '/analytics', label: 'Analytics', icon: BarChart2 },
    { path: '/soc-estimation', label: 'SOC Estimation', icon: Activity },
    { path: '/chatbot', label: 'Chatbot', icon: MessageCircle },
    { path: '/notifications', label: 'Notifications', icon: Bell },
    { path: '/settings', label: 'Settings', icon: Settings }
];

const Sidebar: React.FC = () => {
    const location = useLocation();

  return (
        <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <div className="p-4">
                <h1 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    BatteryAI
                </h1>
      </div>
      
            <nav className="mt-4">
                {navItems.map(({ path, label, icon: Icon }) => (
                    <Link
                        key={path}
                        to={path}
                        className={classNames(
                            'flex items-center px-4 py-3 text-gray-600 dark:text-gray-300 transition-colors',
                    {
                                'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400':
                                    location.pathname === path,
                                'hover:bg-gray-50 dark:hover:bg-gray-700/50':
                                    location.pathname !== path
                            }
                        )}
                    >
                        <Icon className="w-5 h-5 mr-3" />
                        <span>{label}</span>
                    </Link>
                ))}
      </nav>
        </aside>
  );
};

export default Sidebar;