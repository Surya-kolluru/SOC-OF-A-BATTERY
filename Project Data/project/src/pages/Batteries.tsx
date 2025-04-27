import React, { useState, useEffect } from 'react';
import { useBatteryStore } from '../store/batteryStore';
import BatteryCard from '../components/batteries/BatteryCard';
import BatteryScanModal from '../components/batteries/BatteryScanModal';
import BatteryDetailPanel from '../components/batteries/BatteryDetailPanel';
import { Battery, Plus, Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';

const Batteries: React.FC = () => {
  const {
    batteries,
    filteredBatteries,
    selectedBatteryId,
    selectBattery,
    addBattery,
    updateBattery,
    removeBattery,
    toggleBatteryCharging,
    toggleBatteryActive,
    batteryFilter,
    updateFilter,
    applyFilters,
    resetFilters,
    simulationActive,
    startSimulation
  } = useBatteryStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Start simulation if not already running
  useEffect(() => {
    if (!simulationActive) {
      startSimulation();
    }
  }, [simulationActive, startSimulation]);
  
  // Get selected battery
  const selectedBattery = selectedBatteryId 
    ? batteries.find(b => b.id === selectedBatteryId)
    : null;
  
  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFilter({ search: e.target.value });
  };
  
  // Handle filter change and apply
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'manufacturer' || name === 'chemistry') {
      // Handle multi-select
      const currentValues = batteryFilter[name];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      updateFilter({ [name]: newValues });
    } else if (name.startsWith('health') || name.startsWith('stateOfCharge')) {
      // Handle range inputs
      const [filterName, rangeIndex] = name.split('-');
      const currentRange = batteryFilter[filterName as 'health' | 'stateOfCharge'];
      const newRange = [...currentRange] as [number, number];
      newRange[parseInt(rangeIndex)] = parseInt(value);
      
      updateFilter({ [filterName]: newRange });
    }
  };
  
  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [batteryFilter, applyFilters]);
  
  // Get unique manufacturers and chemistries for filter options
  const getUniqueValues = (field: 'manufacturer' | 'chemistry') => {
    const values = new Set<string>();
    batteries.forEach(battery => values.add(battery[field]));
    return Array.from(values);
  };
  
  const manufacturers = getUniqueValues('manufacturer');
  const chemistries = getUniqueValues('chemistry');
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold">Batteries</h1>
        
        <div className="flex gap-3 items-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={18} />
            <span>Add Battery</span>
          </button>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 rounded-lg border ${
              showFilters 
                ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'
            } flex items-center gap-2`}
          >
            <SlidersHorizontal size={16} />
            <span>Filters</span>
          </button>
        </div>
      </div>
      
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 transition-all duration-300 overflow-hidden ${
        showFilters ? 'max-h-96' : 'max-h-0 py-0 px-4 shadow-none'
      }`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-medium">Filter Batteries</h2>
          <div className="flex gap-3">
            <button
              onClick={resetFilters}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            >
              Reset filters
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                name="search"
                value={batteryFilter.search}
                onChange={handleSearchChange}
                placeholder="Name, model, manufacturer..."
                className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg block w-full pl-10 p-2.5"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Manufacturer
            </label>
            <div className="relative">
              <select
                name="manufacturer"
                multiple
                size={3}
                value={batteryFilter.manufacturer}
                onChange={handleFilterChange}
                className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg block w-full p-2.5"
              >
                {manufacturers.map(manufacturer => (
                  <option key={manufacturer} value={manufacturer}>
                    {manufacturer}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Chemistry
            </label>
            <div className="relative">
              <select
                name="chemistry"
                multiple
                size={3}
                value={batteryFilter.chemistry}
                onChange={handleFilterChange}
                className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg block w-full p-2.5"
              >
                {chemistries.map(chemistry => (
                  <option key={chemistry} value={chemistry}>
                    {chemistry}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Health Range
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                name="health-0"
                min="0"
                max="100"
                value={batteryFilter.health[0]}
                onChange={handleFilterChange}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm">{batteryFilter.health[0]}%</span>
              <span>-</span>
              <input
                type="range"
                name="health-1"
                min="0"
                max="100"
                value={batteryFilter.health[1]}
                onChange={handleFilterChange}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm">{batteryFilter.health[1]}%</span>
            </div>
            
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 mt-3">
              State of Charge Range
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                name="stateOfCharge-0"
                min="0"
                max="100"
                value={batteryFilter.stateOfCharge[0]}
                onChange={handleFilterChange}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm">{batteryFilter.stateOfCharge[0]}%</span>
              <span>-</span>
              <input
                type="range"
                name="stateOfCharge-1"
                min="0"
                max="100"
                value={batteryFilter.stateOfCharge[1]}
                onChange={handleFilterChange}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm">{batteryFilter.stateOfCharge[1]}%</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredBatteries.length} of {batteries.length} batteries
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">Sort by:</span>
          <div className="relative">
            <select
              className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg pr-8 pl-3 py-1.5 appearance-none"
            >
              <option>State of Charge</option>
              <option>Health</option>
              <option>Name</option>
              <option>Last Updated</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>
      
      {filteredBatteries.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <Battery size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
            No batteries found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {batteries.length === 0
              ? "You haven't added any batteries yet."
              : "No batteries match your current filters."
            }
          </p>
          {batteries.length === 0 ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Add Your First Battery
            </button>
          ) : (
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBatteries.map(battery => (
            <BatteryCard
              key={battery.id}
              battery={battery}
              isSelected={battery.id === selectedBatteryId}
              onSelect={selectBattery}
              onToggleCharging={toggleBatteryCharging}
              onToggleActive={toggleBatteryActive}
              onRemove={removeBattery}
            />
          ))}
        </div>
      )}
      
      {selectedBattery && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Battery Details</h2>
          <BatteryDetailPanel 
            battery={selectedBattery} 
            onToggleCharging={toggleBatteryCharging} 
          />
        </div>
      )}
      
      {isModalOpen && (
        <BatteryScanModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddBattery={addBattery}
        />
      )}
    </div>
  );
};

export default Batteries;