import React, { useEffect } from 'react';
import { useBatteryStore } from '../store/batteryStore';
import StatCard from '../components/dashboard/StatCard';
import AiBatteryAssistant from '../components/dashboard/AiBatteryAssistant';
import BatteryDetailPanel from '../components/batteries/BatteryDetailPanel';
import { LineChart } from '../components/charts/Chart';
import { Battery, Zap, Thermometer, ActivitySquare, BatteryCharging, BatteryMedium } from 'lucide-react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';

const Dashboard: React.FC = () => {
  const {
    batteries,
    selectedBatteryId,
    selectBattery,
    toggleBatteryCharging,
    simulationActive,
    startSimulation
  } = useBatteryStore();
  
  // Start simulation if not already running
  useEffect(() => {
    if (!simulationActive) {
      startSimulation();
    }
  }, [simulationActive, startSimulation]);
  
  // Select first battery if none selected
  useEffect(() => {
    if (batteries.length > 0 && !selectedBatteryId) {
      selectBattery(batteries[0].id);
    }
  }, [batteries, selectedBatteryId, selectBattery]);
  
  // Get selected battery
  const selectedBattery = selectedBatteryId 
    ? batteries.find(b => b.id === selectedBatteryId)
    : batteries[0];
  
  // Calculate aggregate stats
  const calculateAggregateStats = () => {
    if (batteries.length === 0) return null;
    
    const activeBatteries = batteries.filter(b => b.isActive);
    if (activeBatteries.length === 0) return null;
    
    const totalBatteries = activeBatteries.length;
    const chargingBatteries = activeBatteries.filter(b => b.isCharging).length;
    const avgSoc = activeBatteries.reduce((sum, b) => sum + b.stats.stateOfCharge, 0) / totalBatteries;
    const avgHealth = activeBatteries.reduce((sum, b) => sum + b.stats.health, 0) / totalBatteries;
    const avgTemp = activeBatteries.reduce((sum, b) => sum + b.stats.temperature, 0) / totalBatteries;
    const totalPower = activeBatteries.reduce((sum, b) => sum + b.stats.power, 0);
    
    return {
      totalBatteries,
      chargingBatteries,
      avgSoc,
      avgHealth,
      avgTemp,
      totalPower
    };
  };
  
  const stats = calculateAggregateStats();
  
  // Prepare chart data for all batteries
  const prepareChartData = () => {
    if (batteries.length === 0) return null;
    
    // Get the last 24 data points from each battery's history
    const datasets = batteries.slice(0, 5).map(battery => {
      const history = battery.history.slice(-24);
      return {
        label: battery.name,
        data: history.map(h => h.stateOfCharge),
        borderColor: getBatteryColor(battery.id),
        backgroundColor: `${getBatteryColor(battery.id)}20`,
        fill: false,
      };
    });
    
    return {
      labels: batteries[0].history.slice(-24).map(h => 
        dayjs(h.timestamp).format('HH:mm')
      ),
      datasets
    };
  };
  
  // Get a color based on battery ID for chart differentiation
  const getBatteryColor = (id: string) => {
    const colors = [
      'rgb(59, 130, 246)', // blue
      'rgb(16, 185, 129)', // green
      'rgb(245, 158, 11)', // amber
      'rgb(239, 68, 68)',  // red
      'rgb(139, 92, 246)', // purple
      'rgb(14, 165, 233)', // sky
    ];
    
    // Use battery ID to deterministically pick a color
    const index = parseInt(id.split('-')[1]) % colors.length;
    return colors[index];
  };
  
  const chartData = prepareChartData();
  
  if (!stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <BatteryMedium size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
            No Active Batteries
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Add or activate batteries to view the dashboard
          </p>
          <Link
            to="/batteries"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Manage Batteries
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {dayjs().format('MMM D, YYYY HH:mm:ss')}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Average Battery Level"
          value={`${stats.avgSoc.toFixed(1)}%`}
          icon={<Battery size={20} />}
          iconColor="text-blue-600 dark:text-blue-500"
          iconBgColor="bg-blue-100 dark:bg-blue-900/20"
          change={2.5}
          changeType="increase"
        />
        
        <StatCard 
          title="Average Health"
          value={`${stats.avgHealth.toFixed(1)}%`}
          icon={<ActivitySquare size={20} />}
          iconColor="text-green-600 dark:text-green-500"
          iconBgColor="bg-green-100 dark:bg-green-900/20"
          change={-0.8}
          changeType="decrease"
        />
        
        <StatCard 
          title="Average Temperature"
          value={`${stats.avgTemp.toFixed(1)}°C`}
          icon={<Thermometer size={20} />}
          iconColor="text-orange-600 dark:text-orange-500"
          iconBgColor="bg-orange-100 dark:bg-orange-900/20"
          change={1.2}
          changeType="increase"
        />
        
        <StatCard 
          title="Total Power"
          value={`${stats.totalPower.toFixed(1)}W`}
          icon={<Zap size={20} />}
          iconColor="text-purple-600 dark:text-purple-500"
          iconBgColor="bg-purple-100 dark:bg-purple-900/20"
          change={4.7}
          changeType="increase"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Battery Levels</h2>
              
              <div className="flex gap-2">
                <div className="flex items-center gap-1 text-sm">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  <span>Active</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <BatteryCharging size={16} className="text-yellow-500" />
                  <span>Charging ({stats.chargingBatteries})</span>
                </div>
              </div>
            </div>
            
            {chartData && (
              <div className="h-64">
                <LineChart data={chartData} />
              </div>
            )}
          </div>
        </div>
        
        <div>
          <AiBatteryAssistant batteries={batteries} />
        </div>
      </div>
      
      {selectedBattery && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Selected Battery</h2>
          <BatteryDetailPanel 
            battery={selectedBattery} 
            onToggleCharging={toggleBatteryCharging} 
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;