import React, { useState, useEffect } from 'react';
import { Zap, Battery, Thermometer, BrainCircuit, AlertTriangle, Upload, Check, XCircle } from 'lucide-react';
import { Battery as BatteryType } from '../../types';
import { motion } from 'framer-motion';
import { batteryMLModel } from '../../utils/modelTraining';
import { useDropzone, FileRejection } from 'react-dropzone';

interface AiBatteryAssistantProps {
  batteries: BatteryType[];
}

interface DatasetRow {
  voltage: number;
  current: number;
  temperature: number;
  cycles: number;
  age_days: number;
  charge_time: number;
  discharge_time: number;
  health: number;
}

const AiBatteryAssistant: React.FC<AiBatteryAssistantProps> = ({ batteries }) => {
  const [selectedInsight, setSelectedInsight] = useState<'health' | 'charging' | 'temperature'>('health');
  const [modelMetrics, setModelMetrics] = useState<{ accuracy: number; trained: boolean }>({
    accuracy: 0,
    trained: false
  });
  const [isTraining, setIsTraining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
    try {
      setIsTraining(true);
      setError(null);
      
          const reader = new FileReader();
          reader.onload = async (e) => {
            try {
              const csvData = e.target?.result as string;
              const metrics = await batteryMLModel.loadAndTrainModel(csvData);
      
      setModelMetrics({
        accuracy: metrics.accuracy,
        trained: true
      });
      
              setShowUploadDialog(false);
      setRetryCount(0);
    } catch (error) {
              handleTrainingError(error);
            } finally {
              setIsTraining(false);
            }
          };
          
          reader.onerror = () => {
            setError('Error reading file. Please try again.');
            setIsTraining(false);
          };
          
          reader.readAsText(file);
        } catch (error) {
          handleTrainingError(error);
        }
      }
    }
  });

  const handleTrainingError = (error: unknown) => {
      console.error('Training error:', error);
      
      if (retryCount < 3 && (error instanceof Error && error.message.includes('fetch'))) {
      const retryDelay = Math.pow(2, retryCount) * 1000;
        setError(`Network error. Retrying in ${retryDelay/1000} seconds...`);
        
        setTimeout(() => {
        setRetryCount((prev: number) => prev + 1);
          trainModel();
        }, retryDelay);
      } else {
        setError(
          error instanceof Error 
          ? `${error.message} Please check your dataset format and try again.` 
            : 'Failed to train model. Please try again later.'
        );
        setRetryCount(0);
      }
      setIsTraining(false);
  };

  const trainModel = () => {
    setShowUploadDialog(true);
  };

  // Calculate total health score across all batteries
  const calculateOverallHealth = () => {
    if (batteries.length === 0) return 0;
    return batteries.reduce((sum: number, battery: BatteryType) => sum + battery.stats.health, 0) / batteries.length;
  };
  
  // Get critical batteries (health < 70%)
  const getCriticalBatteries = () => {
    return batteries.filter((battery: BatteryType) => battery.stats.health < 70);
  };
  
  // Get overcharging batteries (SoC > 95% and still charging)
  const getOverchargingBatteries = () => {
    return batteries.filter(battery => battery.stats.stateOfCharge > 95 && battery.isCharging);
  };
  
  // Get high temperature batteries (temp > 40°C)
  const getHighTempBatteries = () => {
    return batteries.filter(battery => battery.stats.temperature > 40);
  };
  
  // Calculate average time to full charge for charging batteries
  const getAverageChargeTime = () => {
    const chargingBatteries = batteries.filter(battery => battery.isCharging);
    if (chargingBatteries.length === 0) return 0;
    return chargingBatteries.reduce((sum, battery) => sum + battery.stats.timeToFull, 0) / chargingBatteries.length;
  };
  
  // Get recommendations based on selected insight
  const getRecommendations = () => {
    switch (selectedInsight) {
      case 'health':
        return [
          "Avoid complete discharges; keep batteries above 20% charge when possible",
          "Don't store batteries at 100% charge for extended periods",
          "Keep batteries at moderate temperatures (15-25°C) for optimal lifespan",
          "Consider replacing batteries below 70% health for critical applications",
          "Calibrate battery readings occasionally by performing a full charge/discharge cycle"
        ];
      
      case 'charging':
        return [
          "Charge batteries to 80-90% rather than 100% to extend battery lifespan",
          "Use the original charger or one with appropriate voltage/current ratings",
          "Avoid wireless charging for extended periods as it generates more heat",
          "Disconnect batteries promptly when fully charged to prevent overcharging",
          "If storing long-term, maintain charge at 40-60% in a cool environment"
        ];
      
      case 'temperature':
        return [
          "Keep batteries away from direct sunlight and heat sources",
          "Remove protective cases during charging to improve heat dissipation",
          "Don't charge batteries immediately after heavy use; allow cooling time",
          "Avoid using batteries in extreme cold (<0°C) or hot (>45°C) conditions",
          "If a battery feels hot to touch, stop using it immediately and allow it to cool"
        ];
    }
  };
  
  const overallHealth = calculateOverallHealth();
  const criticalBatteries = getCriticalBatteries();
  const overchargingBatteries = getOverchargingBatteries();
  const highTempBatteries = getHighTempBatteries();
  const averageChargeTime = getAverageChargeTime();
  
  return (
    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <BrainCircuit size={24} className="text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-xl font-semibold text-indigo-800 dark:text-indigo-300">
              AI Battery Assistant
            </h3>
          </div>
          
          {!modelMetrics.trained && (
            <button
              onClick={trainModel}
              disabled={isTraining}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              <Upload size={16} className={isTraining ? 'animate-spin' : ''} />
              {isTraining ? 'Training Model...' : 'Train AI Model'}
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-300">
              <XCircle size={16} />
              <span>{error}</span>
            </div>
          </div>
        )}

        {modelMetrics.trained && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-green-800 dark:text-green-300">
              <Check size={16} />
              <span>Model trained with {modelMetrics.accuracy.toFixed(1)}% accuracy</span>
            </div>
          </div>
        )}
        
        {showUploadDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Upload Training Dataset</h3>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-300 dark:border-gray-700'
                }`}
              >
                <input {...getInputProps()} />
                <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium mb-2">Upload Dataset</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Drag and drop your CSV dataset, or click to select a file
                </p>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">
                  Select File
                </button>
              </div>
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                <p>Supported formats: CSV, XLS, XLSX</p>
                <p>Required columns: voltage, current, temperature, cycles, age_days, charge_time, discharge_time, health</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            className={`p-4 rounded-lg transition-colors ${
              selectedInsight === 'health'
                ? 'bg-indigo-100 dark:bg-indigo-800'
                : 'bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/40'
            }`}
            onClick={() => setSelectedInsight('health')}
          >
            <div className="flex items-center gap-3">
              <Battery className="text-indigo-600 dark:text-indigo-400" />
              <div className="text-left">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Overall Health
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {overallHealth.toFixed(0)}%
                </div>
              </div>
            </div>
            {criticalBatteries.length > 0 && (
              <div className="mt-3 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertTriangle size={12} />
                <span>{criticalBatteries.length} batteries critical</span>
              </div>
            )}
          </button>
          
          <button
            className={`p-4 rounded-lg transition-colors ${
              selectedInsight === 'charging'
                ? 'bg-indigo-100 dark:bg-indigo-800'
                : 'bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/40'
            }`}
            onClick={() => setSelectedInsight('charging')}
          >
            <div className="flex items-center gap-3">
              <Zap className="text-yellow-500" />
              <div className="text-left">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Charging Status
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {averageChargeTime > 0 
                    ? `~${Math.round(averageChargeTime)} min to full`
                    : 'No charging batteries'
                  }
                </div>
              </div>
            </div>
            {overchargingBatteries.length > 0 && (
              <div className="mt-3 text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                <AlertTriangle size={12} />
                <span>{overchargingBatteries.length} overcharging</span>
              </div>
            )}
          </button>
          
          <button
            className={`p-4 rounded-lg transition-colors ${
              selectedInsight === 'temperature'
                ? 'bg-indigo-100 dark:bg-indigo-800'
                : 'bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/40'
            }`}
            onClick={() => setSelectedInsight('temperature')}
          >
            <div className="flex items-center gap-3">
              <Thermometer className="text-red-500" />
              <div className="text-left">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Temperature
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {batteries.length > 0
                    ? `${(batteries.reduce((sum, b) => sum + b.stats.temperature, 0) / batteries.length).toFixed(1)}°C avg`
                    : 'No data'
                  }
                </div>
              </div>
            </div>
            {highTempBatteries.length > 0 && (
              <div className="mt-3 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertTriangle size={12} />
                <span>{highTempBatteries.length} overheating</span>
              </div>
            )}
          </button>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-5">
          <h4 className="font-medium mb-4">AI Recommendations</h4>
          <ul className="space-y-3">
            {getRecommendations().map((recommendation, index) => (
              <motion.li 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-start gap-3"
              >
                <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span className="text-sm text-gray-700 dark:text-gray-300">{recommendation}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AiBatteryAssistant;