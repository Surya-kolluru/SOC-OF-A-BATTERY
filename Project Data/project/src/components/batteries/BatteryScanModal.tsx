import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Battery, X, Upload, Search, Check } from 'lucide-react';
import { Battery as BatteryType } from '../../types';
import { MANUFACTURERS, CHEMISTRIES, MODELS } from '../../utils/constants';

interface BatteryScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBattery: (battery: Omit<BatteryType, 'id' | 'history' | 'predictions'>) => void;
}

const BatteryScanModal: React.FC<BatteryScanModalProps> = ({
  isOpen,
  onClose,
  onAddBattery
}) => {
  const [step, setStep] = useState<'upload' | 'scanning' | 'review'>('upload');
  const [preview, setPreview] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [batteryData, setBatteryData] = useState({
    name: '',
    model: '',
    manufacturer: '',
    capacity: 5000,
    voltage: 3.7,
    chemistry: 'Li-ion',
    manufactureDate: '',
    purchaseDate: '',
    image: '',
    isCharging: false,
    isActive: true,
    stats: {
      stateOfCharge: 50,
      voltage: 3.7,
      current: 0,
      temperature: 25,
      health: 100,
      cycles: 0,
      lastCharged: new Date().toISOString(),
      lastFullCharge: new Date().toISOString(),
      timeToEmpty: 300,
      timeToFull: 0,
      power: 0,
    }
  });
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      setStep('scanning');
      
      // Simulate scanning process
      let progress = 0;
      const scanInterval = setInterval(() => {
        progress += 5;
        setScanProgress(progress);
        
        if (progress >= 100) {
          clearInterval(scanInterval);
          
          // Generate "detected" battery data
          const detectedData = {
            name: `Battery ${Math.floor(Math.random() * 1000)}`,
            model: MODELS[Math.floor(Math.random() * MODELS.length)],
            manufacturer: MANUFACTURERS[Math.floor(Math.random() * MANUFACTURERS.length)],
            capacity: Math.floor(Math.random() * 5000) + 3000,
            voltage: (Math.random() * 1) + 3.2,
            chemistry: CHEMISTRIES[Math.floor(Math.random() * CHEMISTRIES.length)],
            manufactureDate: new Date(Date.now() - Math.random() * 94608000000).toISOString().split('T')[0], // Random date in last 3 years
            purchaseDate: new Date(Date.now() - Math.random() * 31536000000).toISOString().split('T')[0], // Random date in last year
            image: previewUrl,
          };
          
          setBatteryData({
            ...batteryData,
            ...detectedData
          });
          
          setStep('review');
        }
      }, 100);
    }
  }, [batteryData]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBatteryData({
      ...batteryData,
      [name]: value
    });
  };
  
  const handleSubmit = () => {
    onAddBattery(batteryData);
    onClose();
    
    // Clean up any object URLs we created
    if (preview) {
      URL.revokeObjectURL(preview);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Battery className="text-green-500" />
            Add New Battery
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          {step === 'upload' && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700'
              }`}
            >
              <input {...getInputProps()} />
              <Upload size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium mb-2">Upload Battery Image</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Drag and drop a battery image, or click to select a file
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                Select File
              </button>
            </div>
          )}
          
          {step === 'scanning' && (
            <div className="text-center py-8">
              <div className="relative w-48 h-48 mx-auto mb-6">
                {preview && (
                  <img 
                    src={preview} 
                    alt="Battery preview" 
                    className="w-full h-full object-cover rounded-lg" 
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                  <Search size={48} className="text-white animate-pulse" />
                </div>
              </div>
              
              <h3 className="text-lg font-medium mb-4">Analyzing Battery Image...</h3>
              
              <div className="w-full max-w-md mx-auto bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-6">
                <div 
                  className="bg-blue-600 h-4 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${scanProgress}%` }}
                ></div>
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
                Using AI to extract battery information...
              </p>
            </div>
          )}
          
          {step === 'review' && (
            <div>
              <div className="flex gap-6 mb-6">
                <div className="w-1/3">
                  {preview && (
                    <div className="relative">
                      <img 
                        src={preview} 
                        alt="Battery preview" 
                        className="w-full aspect-square object-cover rounded-lg" 
                      />
                      <div className="absolute bottom-2 right-2 bg-green-500 text-white p-1 rounded-full">
                        <Check size={16} />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="w-2/3 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Battery Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={batteryData.name}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Manufacturer
                    </label>
                    <select
                      name="manufacturer"
                      value={batteryData.manufacturer}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    >
                      {MANUFACTURERS.map((manufacturer) => (
                        <option key={manufacturer} value={manufacturer}>
                          {manufacturer}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Model
                    </label>
                    <input
                      type="text"
                      name="model"
                      value={batteryData.model}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Chemistry
                    </label>
                    <select
                      name="chemistry"
                      value={batteryData.chemistry}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    >
                      {CHEMISTRIES.map((chemistry) => (
                        <option key={chemistry} value={chemistry}>
                          {chemistry}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Capacity (mAh)
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      value={batteryData.capacity}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Voltage (V)
                    </label>
                    <input
                      type="number"
                      name="voltage"
                      step="0.1"
                      value={batteryData.voltage}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Manufacture Date
                    </label>
                    <input
                      type="date"
                      name="manufactureDate"
                      value={batteryData.manufactureDate}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Purchase Date
                    </label>
                    <input
                      type="date"
                      name="purchaseDate"
                      value={batteryData.purchaseDate}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Add Battery
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatteryScanModal;