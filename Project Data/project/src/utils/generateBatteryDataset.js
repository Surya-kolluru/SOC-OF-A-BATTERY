/**
 * Battery Dataset Generator
 * 
 * This utility helps generate synthetic battery datasets for training the AI model.
 * It creates realistic battery parameters based on specified conditions.
 */

const fs = require('fs');
const path = require('path');

/**
 * Generate a synthetic battery dataset
 * @param {Object} options - Configuration options
 * @param {number} options.count - Number of data points to generate
 * @param {string} options.outputFile - Output file path
 * @param {Object} options.conditions - Battery conditions to simulate
 * @param {boolean} options.includeComments - Whether to include comments in the output
 * @returns {string} - Path to the generated file
 */
function generateBatteryDataset(options = {}) {
  // Validate and set default options
  const {
    count = 100,
    outputFile = 'battery_dataset_generated.csv',
    conditions = {
      newBatteries: true,
      moderateUsage: true,
      heavyUsage: true,
      poorMaintenance: true,
      optimalMaintenance: true,
      temperatureVariations: true,
      voltageVariations: true
    },
    includeComments = false
  } = options;

  // Validate count
  if (typeof count !== 'number' || count <= 0) {
    throw new Error('Count must be a positive number');
  }

  // Validate outputFile
  if (typeof outputFile !== 'string' || !outputFile.trim()) {
    throw new Error('Output file path must be a non-empty string');
  }

  // CSV header
  let csvContent = 'voltage,current,temperature,cycles,age_days,charge_time,discharge_time,health';
  if (includeComments) {
    csvContent += ',notes';
  }
  csvContent += '\n';

  // Generate data points
  const dataPoints = [];
  
  // Helper function to generate random number within range
  const randomInRange = (min, max) => min + Math.random() * (max - min);
  
  // Helper function to generate data point
  const generateDataPoint = (params) => {
    const {
      voltageRange,
      currentRange,
      temperatureRange,
      cyclesRange,
      chargeTimeRange,
      dischargeTimeRange,
      healthRange,
      note
    } = params;

    const cycles = Math.floor(randomInRange(cyclesRange[0], cyclesRange[1]));
    const ageDays = Math.floor(cycles * 3);
    const voltage = randomInRange(voltageRange[0], voltageRange[1]);
    const current = randomInRange(currentRange[0], currentRange[1]);
    const temperature = randomInRange(temperatureRange[0], temperatureRange[1]);
    const chargeTime = randomInRange(chargeTimeRange[0], chargeTimeRange[1]);
    const dischargeTime = randomInRange(dischargeTimeRange[0], dischargeTimeRange[1]);
    const health = randomInRange(healthRange[0], healthRange[1]);

    return {
      voltage: Number(voltage.toFixed(2)),
      current: Number(current.toFixed(2)),
      temperature: Number(temperature.toFixed(2)),
      cycles,
      ageDays,
      chargeTime: Number(chargeTime.toFixed(1)),
      dischargeTime: Number(dischargeTime.toFixed(1)),
      health: Number(health.toFixed(1)),
      notes: includeComments ? note : ''
    };
  };

  // New batteries (high health)
  if (conditions.newBatteries) {
    const count = Math.floor(options.count * 0.15);
    for (let i = 0; i < count; i++) {
      dataPoints.push(generateDataPoint({
        voltageRange: [3.7, 3.9],
        currentRange: [1.0, 1.3],
        temperatureRange: [24, 26],
        cyclesRange: [1, 30],
        chargeTimeRange: [40, 45],
        dischargeTimeRange: [100, 120],
        healthRange: [94, 98],
        note: 'New battery'
      }));
    }
  }

  // Moderate usage (6 months)
  if (conditions.moderateUsage) {
    const count = Math.floor(options.count * 0.2);
    for (let i = 0; i < count; i++) {
      dataPoints.push(generateDataPoint({
        voltageRange: [3.6, 3.8],
        currentRange: [0.9, 1.2],
        temperatureRange: [25, 27],
        cyclesRange: [30, 120],
        chargeTimeRange: [45, 50],
        dischargeTimeRange: [120, 150],
        healthRange: [80, 90],
        note: 'Moderate usage'
      }));
    }
  }

  // Heavy usage (1 year)
  if (conditions.heavyUsage) {
    const count = Math.floor(options.count * 0.2);
    for (let i = 0; i < count; i++) {
      dataPoints.push(generateDataPoint({
        voltageRange: [3.4, 3.6],
        currentRange: [0.8, 1.1],
        temperatureRange: [27, 29],
        cyclesRange: [120, 240],
        chargeTimeRange: [50, 60],
        dischargeTimeRange: [150, 180],
        healthRange: [70, 80],
        note: 'Heavy usage'
      }));
    }
  }

  // Poor maintenance
  if (conditions.poorMaintenance) {
    const count = Math.floor(options.count * 0.15);
    for (let i = 0; i < count; i++) {
      dataPoints.push(generateDataPoint({
        voltageRange: [3.3, 3.6],
        currentRange: [0.7, 1.1],
        temperatureRange: [30, 38],
        cyclesRange: [50, 150],
        chargeTimeRange: [65, 80],
        dischargeTimeRange: [180, 220],
        healthRange: [55, 70],
        note: 'Poor maintenance'
      }));
    }
  }

  // Optimal maintenance
  if (conditions.optimalMaintenance) {
    const count = Math.floor(options.count * 0.15);
    for (let i = 0; i < count; i++) {
      dataPoints.push(generateDataPoint({
        voltageRange: [3.5, 3.8],
        currentRange: [0.9, 1.2],
        temperatureRange: [26, 30],
        cyclesRange: [100, 250],
        chargeTimeRange: [55, 65],
        dischargeTimeRange: [160, 190],
        healthRange: [75, 85],
        note: 'Optimal maintenance'
      }));
    }
  }

  // Temperature variations
  if (conditions.temperatureVariations) {
    const count = Math.floor(options.count * 0.075);
    for (let i = 0; i < count; i++) {
      dataPoints.push(generateDataPoint({
        voltageRange: [3.6, 3.8],
        currentRange: [0.9, 1.2],
        temperatureRange: [22, 34],
        cyclesRange: [50, 150],
        chargeTimeRange: [45, 55],
        dischargeTimeRange: [140, 170],
        healthRange: [80, 90],
        note: 'Temperature variation'
      }));
    }
  }

  // Voltage variations
  if (conditions.voltageVariations) {
    const count = Math.floor(options.count * 0.075);
    for (let i = 0; i < count; i++) {
      dataPoints.push(generateDataPoint({
        voltageRange: [3.1, 3.9],
        currentRange: [0.5, 1.3],
        temperatureRange: [25, 27],
        cyclesRange: [50, 150],
        chargeTimeRange: [45, 55],
        dischargeTimeRange: [140, 170],
        healthRange: [70, 90],
        note: 'Voltage variation'
      }));
    }
  }

  // Shuffle the data points
  for (let i = dataPoints.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [dataPoints[i], dataPoints[j]] = [dataPoints[j], dataPoints[i]];
  }

  // Add data points to CSV content
  dataPoints.forEach(point => {
    csvContent += `${point.voltage},${point.current},${point.temperature},${point.cycles},${point.ageDays},${point.chargeTime},${point.dischargeTime},${point.health}`;
    if (includeComments) {
      csvContent += `,"${point.notes}"`;
    }
    csvContent += '\n';
  });

  // Ensure output directory exists
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write to file
  try {
    fs.writeFileSync(outputFile, csvContent);
    return outputFile;
  } catch (error) {
    throw new Error(`Failed to write dataset to file: ${error.message}`);
  }
}

// Example usage
if (require.main === module) {
  // Generate a dataset with 200 data points
  generateBatteryDataset({
    count: 200,
    outputFile: 'battery_dataset_generated.csv',
    includeComments: true
  });
}

module.exports = { generateBatteryDataset }; 