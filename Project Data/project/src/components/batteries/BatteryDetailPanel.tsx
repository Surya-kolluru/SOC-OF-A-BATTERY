import React from 'react';
import { Battery as BatteryType } from '../../types';
import { 
  Battery, 
  Thermometer, 
  Zap, 
  Clock, 
  Percent, 
  Activity, 
  Calendar, 
  BatteryCharging,
  BarChart, 
  ArrowUpRight, 
  ArrowDownRight,
  Check, 
  AlertTriangle,
  BadgeAlert
} from 'lucide-react';
import { Chart, LineChart } from '../charts/Chart';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface BatteryDetailPanelProps {
  battery: BatteryType;
  onToggleCharging: (id: string) => void;
}

const BatteryDetailPanel: React.FC<BatteryDetailPanelProps> = ({ battery, onToggleCharging }) => {
  const { 
    id, 
    name, 
    manufacturer, 
    model, 
    capacity, 
    voltage, 
    chemistry, 
    manufactureDate,
    purchaseDate,
    isCharging, 
    stats, 
    history, 
    predictions 
  } = battery;
  
  // Filter history to last 24 hours for chart
  const last24Hours = history.slice(-24);
  
  // Format a value with unit
  const formatValue = (value: number, unit: string, decimals = 0) => {
    return `${value.toFixed(decimals)} ${unit}`;
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            {isCharging ? (
              <BatteryCharging className="text-yellow-500" />
            ) : (
              <Battery className="text-blue-500" />
            )}
            {name}
          </h2>
          <div>
            <button
              onClick={() => onToggleCharging(id)}
              className={`px-4 py-2 rounded-lg text-white ${
                isCharging 
                  ? 'bg-yellow-500 hover:bg-yellow-600' 
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isCharging ? 'Stop Charging' : 'Start Charging'}
            </button>
          </div>
        </div>
        
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {manufacturer} {model} • {chemistry} • {formatValue(capacity, 'mAh')}
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                  <Percent size={16} />
                  <span>State of Charge</span>
                </div>
                <div className="text-2xl font-semibold">
                  {stats.stateOfCharge.toFixed(1)}%
                </div>
                <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${stats.stateOfCharge}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                  <Activity size={16} />
                  <span>Health</span>
                </div>
                <div className="text-2xl font-semibold">
                  {stats.health.toFixed(0)}%
                </div>
                <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      stats.health >= 80 ? 'bg-green-500' :
                      stats.health >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${stats.health}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                  <Thermometer size={16} />
                  <span>Temperature</span>
                </div>
                <div className="text-2xl font-semibold">
                  {stats.temperature.toFixed(1)}°C
                </div>
                <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      stats.temperature < 30 ? 'bg-green-500' :
                      stats.temperature < 45 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, (stats.temperature / 60) * 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                  <Zap size={16} />
                  <span>Voltage / Current</span>
                </div>
                <div className="text-2xl font-semibold">
                  {stats.voltage.toFixed(2)}V / {stats.current.toFixed(2)}A
                </div>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Power: {stats.power.toFixed(1)}W
                </div>
              </div>
              
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                  <Calendar size={16} />
                  <span>Cycles</span>
                </div>
                <div className="text-2xl font-semibold">
                  {stats.cycles}
                </div>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Last charged: {dayjs(stats.lastCharged).fromNow()}
                </div>
              </div>
              
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                  <Clock size={16} />
                  <span>{isCharging ? 'Time to Full' : 'Time to Empty'}</span>
                </div>
                <div className="text-2xl font-semibold">
                  {isCharging 
                    ? formatValue(stats.timeToFull, 'min')
                    : formatValue(stats.timeToEmpty, 'min')
                  }
                </div>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {isCharging 
                    ? `Fully charged at ${dayjs().add(stats.timeToFull, 'minute').format('HH:mm')}`
                    : `Empty at ${dayjs().add(stats.timeToEmpty, 'minute').format('HH:mm')}`
                  }
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Real-time Data (Last 24 Hours)</h3>
              <div className="h-64 w-full">
                <LineChart
                  data={{
                    labels: last24Hours.map(point => dayjs(point.timestamp).format('HH:mm')),
                    datasets: [
                      {
                        label: 'State of Charge (%)',
                        data: last24Hours.map(point => point.stateOfCharge),
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true,
                      }
                    ]
                  }}
                />
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-5 mb-6">
              <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-4 flex items-center gap-2">
                <BarChart size={20} />
                AI Insights
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-blue-800 dark:text-blue-300 font-medium">Predicted Health:</span>
                    <span className={`text-sm font-semibold ${
                      predictions.estimatedHealth >= 80 ? 'text-green-600 dark:text-green-400' :
                      predictions.estimatedHealth >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {predictions.estimatedHealth.toFixed(0)}%
                    </span>
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-400">
                    {predictions.estimatedHealth >= stats.health
                      ? <div className="flex items-center gap-1">
                          <ArrowUpRight size={14} className="text-green-500" />
                          <span>Better than current measurements</span>
                        </div>
                      : <div className="flex items-center gap-1">
                          <ArrowDownRight size={14} className="text-red-500" />
                          <span>Deteriorating faster than expected</span>
                        </div>
                    }
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-blue-800 dark:text-blue-300 font-medium">Estimated Replacement:</span>
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-400">
                    {dayjs(predictions.estimatedReplacementDate).format('MMM D, YYYY')} ({dayjs(predictions.estimatedReplacementDate).fromNow()})
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-blue-800 dark:text-blue-300 font-medium">Charging Recommendations:</span>
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-400 space-y-2">
                    <div className="flex items-center gap-1">
                      <Check size={14} className="text-green-500" />
                      <span>Optimal charge level: {predictions.recommendedChargeLimit}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <AlertTriangle size={14} className="text-yellow-500" />
                      <span>Don't discharge below {predictions.recommendedDischargeLimit}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BadgeAlert size={14} className="text-red-500" />
                      <span>Keep between {predictions.optimalChargingTemperature[0]}-{predictions.optimalChargingTemperature[1]}°C</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-blue-600 dark:text-blue-500 italic mt-3">
                  * Predictions based on battery history and AI models
                  <div>Confidence score: {predictions.confidenceScore}%</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-5">
              <h3 className="text-lg font-medium mb-4">Battery Information</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Manufacturer</span>
                  <span className="font-medium">{manufacturer}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Model</span>
                  <span className="font-medium">{model}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Chemistry</span>
                  <span className="font-medium">{chemistry}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Capacity</span>
                  <span className="font-medium">{formatValue(capacity, 'mAh')}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Voltage</span>
                  <span className="font-medium">{formatValue(voltage, 'V', 1)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Manufacture Date</span>
                  <span className="font-medium">{dayjs(manufactureDate).format('MMM D, YYYY')}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Purchase Date</span>
                  <span className="font-medium">{dayjs(purchaseDate).format('MMM D, YYYY')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatteryDetailPanel;