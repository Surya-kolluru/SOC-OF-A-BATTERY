import React from 'react';
import { Battery, BatteryWarning, Zap, ZapOff, Settings, Trash } from 'lucide-react';
import { Battery as BatteryType } from '../../types';
import classNames from 'classnames';

interface BatteryCardProps {
  battery: BatteryType;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onToggleCharging: (id: string) => void;
  onToggleActive: (id: string) => void;
  onRemove: (id: string) => void;
}

const BatteryCard: React.FC<BatteryCardProps> = ({
  battery,
  isSelected,
  onSelect,
  onToggleCharging,
  onToggleActive,
  onRemove
}) => {
  const { id, name, image, manufacturer, model, stats, isCharging, isActive } = battery;
  const { stateOfCharge, health, temperature } = stats;
  
  // Determine status color based on health and charge
  const getHealthColor = (health: number) => {
    if (health >= 80) return 'text-green-500';
    if (health >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  const getChargeColor = (charge: number) => {
    if (charge >= 50) return 'text-green-500';
    if (charge >= 20) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  const getTemperatureColor = (temp: number) => {
    if (temp < 30) return 'text-blue-500';
    if (temp < 45) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  // Calculate charge level for battery icon (0-4)
  const getChargeLevel = (charge: number) => {
    if (charge >= 80) return 4;
    if (charge >= 60) return 3;
    if (charge >= 40) return 2;
    if (charge >= 20) return 1;
    return 0;
  };
  
  // Helper function to format numbers
  const formatValue = (value: number, decimals = 0) => {
    return value.toFixed(decimals);
  };
  
  const handleCardClick = () => {
    onSelect(id);
  };
  
  return (
    <div
      className={classNames(
        "bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-200 h-full",
        {
          "ring-2 ring-blue-500 transform scale-[1.02]": isSelected,
          "hover:shadow-xl cursor-pointer": !isSelected,
          "opacity-60": !isActive
        }
      )}
      onClick={handleCardClick}
    >
      <div className="h-40 w-full overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
        />
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-lg">{name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{manufacturer} - {model}</p>
          </div>
          <div className="flex items-center">
            {isCharging ? (
              <Zap className="text-yellow-500 h-5 w-5 mr-1" />
            ) : (
              <Battery className={`${getChargeColor(stateOfCharge)} h-5 w-5`} />
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
            <div className="text-xs text-gray-500 dark:text-gray-400">Charge</div>
            <div className={`font-semibold ${getChargeColor(stateOfCharge)}`}>
              {formatValue(stateOfCharge)}%
            </div>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
            <div className="text-xs text-gray-500 dark:text-gray-400">Health</div>
            <div className={`font-semibold ${getHealthColor(health)}`}>
              {formatValue(health)}%
            </div>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
            <div className="text-xs text-gray-500 dark:text-gray-400">Temperature</div>
            <div className={`font-semibold ${getTemperatureColor(temperature)}`}>
              {formatValue(temperature, 1)}°C
            </div>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
            <div className="text-xs text-gray-500 dark:text-gray-400">Voltage</div>
            <div className="font-semibold">
              {formatValue(stats.voltage, 1)}V
            </div>
          </div>
        </div>
        
        <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCharging(id);
            }}
            className={classNames(
              "p-2 rounded-lg transition-colors",
              isCharging
                ? "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20"
                : "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700/50"
            )}
            title={isCharging ? "Stop Charging" : "Start Charging"}
          >
            {isCharging ? <ZapOff size={16} /> : <Zap size={16} />}
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleActive(id);
            }}
            className={classNames(
              "p-2 rounded-lg transition-colors",
              isActive
                ? "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20"
                : "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700/50"
            )}
            title={isActive ? "Deactivate" : "Activate"}
          >
            <Settings size={16} />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Are you sure you want to remove ${name}?`)) {
                onRemove(id);
              }
            }}
            className="p-2 rounded-lg text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20 transition-colors"
            title="Remove Battery"
          >
            <Trash size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BatteryCard;