import { Battery, BatteryHistoryPoint, Notification, ChatMessage, User } from '../types';
import dayjs from 'dayjs';

// Generate a random number between min and max
const random = (min: number, max: number) => 
  Math.round((Math.random() * (max - min) + min) * 100) / 100;

// Generate a realistic oscillating value to simulate battery metrics
const oscillate = (center: number, amplitude: number, period: number = 10000) => 
  center + (Math.sin(Date.now() / period) * amplitude);

// Battery manufacturer and chemistry options
const MANUFACTURERS = ['Samsung', 'LG', 'Panasonic', 'CATL', 'BYD', 'Tesla', 'Sony', 'Duracell'];
const CHEMISTRIES = ['Li-ion', 'LiFePO4', 'NMC', 'Lead-acid', 'Ni-MH', 'Li-polymer'];
const MODELS = ['BT1000', 'PowerCell', 'EnergyMax', 'UltraCharge', 'PowerPack', 'SuperCell'];

// Battery images
const BATTERY_IMAGES = [
  'https://images.pexels.com/photos/1236861/pexels-photo-1236861.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/159397/solar-panel-array-power-sun-electricity-159397.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1933320/pexels-photo-1933320.jpeg?auto=compress&cs=tinysrgb&w=800',
];

// Generate random date within the past 5 years
const randomPastDate = (yearsBack = 5) => {
  const now = dayjs();
  const pastDate = now.subtract(random(0, yearsBack * 365), 'day');
  return pastDate.format('YYYY-MM-DD');
};

// Generate realistic battery discharge curve
const generateDischargeCurve = (startCharge: number, duration: number): number[] => {
  const curve: number[] = [];
  let currentCharge = startCharge;
  
  for (let i = 0; i < duration; i++) {
    // Non-linear discharge rate that increases as battery level decreases
    const dischargeRate = 0.1 + (0.05 * (100 - currentCharge) / 100);
    currentCharge = Math.max(0, currentCharge - dischargeRate);
    curve.push(currentCharge);
  }
  
  return curve;
};

// Generate realistic battery charge curve
const generateChargeCurve = (startCharge: number, duration: number): number[] => {
  const curve: number[] = [];
  let currentCharge = startCharge;
  
  for (let i = 0; i < duration; i++) {
    // Non-linear charge rate that decreases as battery level increases
    const chargeRate = 0.5 * (1 - (currentCharge / 100));
    currentCharge = Math.min(100, currentCharge + chargeRate);
    curve.push(currentCharge);
  }
  
  return curve;
};

// Generate a full battery history with realistic patterns
export const generateBatteryHistory = (days: number = 365): BatteryHistoryPoint[] => {
  const history: BatteryHistoryPoint[] = [];
  const now = dayjs();
  const startDate = now.subtract(days, 'day');
  let currentCharge = 80; // Start at 80% charge
  let isCharging = false;
  
  // Generate points at 1-hour intervals
  for (let i = 0; i <= days * 24; i++) {
    const timestamp = startDate.add(i, 'hour').format('YYYY-MM-DD HH:mm:ss');
    const timeOfDay = i % 24;
    
    // Simulate realistic charging patterns based on time of day
    if (timeOfDay === 22 && currentCharge < 30) { // Start charging in evening if low
      isCharging = true;
    } else if (timeOfDay === 6 || currentCharge >= 100) { // Stop charging in morning or when full
      isCharging = false;
    }
    
    // Update charge level based on charging state
    if (isCharging) {
      currentCharge = Math.min(100, currentCharge + random(0.3, 0.5));
    } else {
      currentCharge = Math.max(0, currentCharge - random(0.1, 0.2));
    }
    
    // Calculate other metrics based on charging state and charge level
    const voltage = 3.2 + (currentCharge / 100) * 1.0 + (isCharging ? 0.1 : 0);
    const current = isCharging ? random(1.8, 2.2) : random(-1.5, -0.8);
    const temperature = 20 + (isCharging ? random(5, 8) : random(2, 4));
    const health = 100 - (i / (days * 24)) * 15;
    
    history.push({
      timestamp,
      stateOfCharge: currentCharge,
      voltage,
      current,
      temperature,
      health,
      power: voltage * Math.abs(current)
    });
  }
  
  return history;
};

// Generate a mock battery with realistic data
export const generateMockBattery = (id: string, isActive = true): Battery => {
  const manufacturer = MANUFACTURERS[Math.floor(Math.random() * MANUFACTURERS.length)];
  const chemistry = CHEMISTRIES[Math.floor(Math.random() * CHEMISTRIES.length)];
  
  // Realistic capacity based on manufacturer and chemistry
  const getCapacity = () => {
    switch (chemistry) {
      case 'Li-ion':
        return random(3000, 5000);
      case 'LiFePO4':
        return random(2000, 4000);
      case 'NMC':
        return random(4000, 6000);
      case 'Lead-acid':
        return random(7000, 10000);
      default:
        return random(2000, 4000);
    }
  };
  
  const capacity = getCapacity();
  const voltage = chemistry === 'Lead-acid' ? 12 : random(3.2, 4.2);
  const isCharging = Math.random() > 0.7;
  const cycleCount = random(10, 500);
  const health = Math.max(60, 100 - (cycleCount / 10));
  const stateOfCharge = random(20, 90);
  
  // Temperature based on charging state and ambient conditions
  const temperature = isCharging 
    ? random(30, 35) // Higher temp while charging
    : random(20, 25); // Normal operating temp
  
  const current = isCharging 
    ? random(0.8, 1.2) * (capacity / 1000) // C-rate based charging current
    : random(-0.5, -0.2) * (capacity / 1000); // Discharge current
  
  const manufactureDate = randomPastDate(3);
  const purchaseDate = dayjs(manufactureDate).add(random(10, 100), 'day').format('YYYY-MM-DD');
  
  return {
    id,
    name: `${manufacturer} ${chemistry.split('-')[0]} ${Math.floor(capacity/1000)}Ah`,
    image: BATTERY_IMAGES[Math.floor(Math.random() * BATTERY_IMAGES.length)],
    model: MODELS[Math.floor(Math.random() * MODELS.length)],
    manufacturer,
    capacity,
    voltage,
    chemistry,
    manufactureDate,
    purchaseDate,
    isCharging,
    isActive,
    stats: {
      stateOfCharge,
      voltage,
      current,
      temperature,
      health,
      cycles: cycleCount,
      lastCharged: dayjs().subtract(random(0, 24), 'hour').format('YYYY-MM-DD HH:mm:ss'),
      lastFullCharge: dayjs().subtract(random(1, 7), 'day').format('YYYY-MM-DD HH:mm:ss'),
      timeToEmpty: stateOfCharge * 6,
      timeToFull: isCharging ? (100 - stateOfCharge) * 2 : 0,
      power: voltage * Math.abs(current)
    },
    history: generateBatteryHistory(300),
    predictions: {
      estimatedHealth: Math.max(50, health - random(5, 15)),
      remainingLifetime: (health / 100) * random(500, 1500),
      degradationRate: random(0.01, 0.05),
      recommendedChargeLimit: random(80, 90),
      recommendedDischargeLimit: random(10, 20),
      optimalChargingTemperature: [15, 25],
      estimatedReplacementDate: dayjs().add((health / 100) * random(500, 1500), 'day').format('YYYY-MM-DD'),
      confidenceScore: random(85, 98)
    }
  };
};

// Generate multiple mock batteries
export const generateMockBatteries = (count: number): Battery[] => {
  return Array.from({ length: count }, (_, i) => 
    generateMockBattery(`battery-${i+1}-${Date.now().toString(36)}`)
  );
};

// Update a battery's stats based on its charging state
export const updateBatteryStats = (battery: Battery): Battery => {
  const { isCharging, stats, chemistry } = battery;
  const { stateOfCharge, voltage, current, temperature, cycles } = stats;
  
  // Calculate new state of charge with realistic charging/discharging curves
  let newStateOfCharge = stateOfCharge;
  let newCurrent = current;
  let newVoltage = voltage;
  
  if (isCharging) {
    // Implement CC-CV charging algorithm
    if (stateOfCharge < 80) {
      // Constant Current phase
      newStateOfCharge = Math.min(100, stateOfCharge + random(0.15, 0.25));
      newCurrent = chemistry === 'Lead-acid' ? random(4, 5) : random(1.8, 2.2);
    } else {
      // Constant Voltage phase - current tapers off
      const chargeRemaining = 100 - stateOfCharge;
      newStateOfCharge = Math.min(100, stateOfCharge + random(0.05, 0.1));
      newCurrent = Math.max(0.1, current * (chargeRemaining / 20));
    }
    newVoltage = chemistry === 'Lead-acid' 
      ? 12 + random(0.5, 1.0)
      : 3.2 + (newStateOfCharge / 100) * 1.0 + random(0.1, 0.2);
  } else {
    // Discharge characteristics
    const dischargeRate = 0.1 + (0.05 * (100 - stateOfCharge) / 100);
    newStateOfCharge = Math.max(0, stateOfCharge - dischargeRate);
    newCurrent = chemistry === 'Lead-acid'
      ? random(-3, -2)
      : random(-2, -0.8);
    newVoltage = chemistry === 'Lead-acid'
      ? 12 - (1 - newStateOfCharge / 100) * 2
      : 3.2 + (newStateOfCharge / 100) * 1.0;
  }
  
  // Temperature changes based on charging state and ambient conditions
  let newTemperature = temperature;
  if (isCharging) {
    newTemperature += random(0.1, 0.2);
    if (newStateOfCharge > 90) {
      newTemperature += random(0.2, 0.3); // Additional heating near full charge
    }
  } else {
    newTemperature += random(-0.2, 0.1);
  }
  newTemperature = Math.max(20, Math.min(45, newTemperature)); // Keep within realistic bounds
  
  // Update battery stats with new values
  return {
    ...battery,
    stats: {
      ...stats,
      stateOfCharge: newStateOfCharge,
      voltage: newVoltage,
      current: newCurrent,
      temperature: newTemperature,
      cycles: isCharging && stateOfCharge < 20 && newStateOfCharge >= 20 ? cycles + 1 : cycles,
      power: newVoltage * Math.abs(newCurrent),
      timeToEmpty: isCharging ? 0 : newStateOfCharge * 6,
      timeToFull: isCharging ? (100 - newStateOfCharge) * 2 : 0,
    }
  };
};

// Generate mock notifications
export const generateMockNotifications = (batteryIds: string[]): Notification[] => {
  const notifications: Notification[] = [];
  
  // Generate notification templates
  const templates = [
    { type: 'info', title: 'Battery Charged', message: 'Battery {id} is fully charged.' },
    { type: 'warning', title: 'Low Battery', message: 'Battery {id} is below 15% charge.' },
    { type: 'error', title: 'Overheating', message: 'Battery {id} temperature is above safe levels.' },
    { type: 'success', title: 'Health Check', message: 'Battery {id} passed health check.' },
    { type: 'info', title: 'Cycle Update', message: 'Battery {id} has completed {cycles} cycles.' },
    { type: 'warning', title: 'Health Degrading', message: 'Battery {id} health is at {health}%, below recommended levels.' },
    { type: 'error', title: 'Overcharging', message: 'Battery {id} has been at 100% for over 5 minutes.' },
    { type: 'warning', title: 'Voltage Fluctuation', message: 'Battery {id} is experiencing unusual voltage fluctuations.' },
  ];
  
  // Generate 20 random notifications
  for (let i = 0; i < 20; i++) {
    const template = templates[Math.floor(Math.random() * templates.length)];
    const batteryId = batteryIds[Math.floor(Math.random() * batteryIds.length)];
    const timestamp = dayjs().subtract(random(0, 72), 'hour').format('YYYY-MM-DD HH:mm:ss');
    
    notifications.push({
      id: `notification-${i}-${Date.now().toString(36)}`,
      batteryId,
      title: template.title,
      message: template.message.replace('{id}', batteryId.slice(0, 5).toUpperCase())
                               .replace('{cycles}', Math.round(random(10, 500)).toString())
                               .replace('{health}', Math.round(random(60, 85)).toString()),
      type: template.type as 'info' | 'warning' | 'error' | 'success',
      timestamp,
      isRead: random(0, 1) > 0.7,
    });
  }
  
  // Sort by timestamp (newest first)
  return notifications.sort((a, b) => 
    dayjs(b.timestamp).valueOf() - dayjs(a.timestamp).valueOf()
  );
};

// Generate sample chat conversation
export const generateSampleChat = (): ChatMessage[] => {
  return [
    {
      id: 'msg-1',
      role: 'assistant',
      content: 'Hello! I\'m your AI battery assistant. How can I help you with your battery management today?',
      timestamp: dayjs().subtract(2, 'minute').format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      id: 'msg-2',
      role: 'user',
      content: 'What\'s the optimal charging strategy for lithium batteries?',
      timestamp: dayjs().subtract(1, 'minute').format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      id: 'msg-3',
      role: 'assistant',
      content: CHATBOT_RESPONSES['charging'],
      timestamp: dayjs().subtract(30, 'second').format('YYYY-MM-DD HH:mm:ss'),
    },
  ];
};

// Predefined chatbot responses
export const CHATBOT_RESPONSES = {
  'battery life': 'To maximize battery life:\n1. Keep charge between 20-80%\n2. Avoid extreme temperatures\n3. Use appropriate charging current\n4. Store at 40% charge if unused\n5. Avoid complete discharges',
  'charging': 'For optimal battery longevity:\n1. Charge to 80-90% instead of 100%\n2. Avoid charging below 20%\n3. Use manufacturer-recommended charger\n4. Avoid fast charging when possible\n5. Charge at room temperature',
  'temperature': 'Optimal battery temperature is 15-25°C (59-77°F):\n1. High temps accelerate degradation\n2. Low temps reduce capacity temporarily\n3. Avoid charging when too hot/cold\n4. Remove thick cases while charging\n5. Keep away from heat sources',
  'storage': 'Long-term storage guidelines:\n1. Charge to 40-60%\n2. Store in cool, dry place (15-20°C)\n3. Check charge every 3-6 months\n4. Avoid full charge/discharge cycles\n5. Keep away from metal objects',
  'replacement': 'Consider battery replacement when:\n1. Capacity falls below 70-80%\n2. Unusual swelling occurs\n3. Charging problems persist\n4. Unexpected shutdowns happen\n5. Age exceeds 3-5 years',
  'fast charging': 'Fast charging considerations:\n1. Generates more heat\n2. Accelerates degradation\n3. Use only when necessary\n4. Avoid in extreme temperatures\n5. Stop at 80% when possible',
  'cycles': 'Understanding charge cycles:\n1. One cycle = using 100% capacity\n2. Partial cycles count fractionally\n3. Rated for 300-500 cycles\n4. Depth of discharge matters\n5. Shallow cycles extend life',
  'health': 'Battery health indicators:\n1. Capacity vs original\n2. Voltage characteristics\n3. Internal resistance\n4. Charging efficiency\n5. Temperature stability',
  'calibration': 'Battery calibration steps:\n1. Charge to 100%\n2. Use until auto-shutdown\n3. Leave discharged 3-4 hours\n4. Charge uninterrupted to 100%\n5. Regular use afterward',
  'swelling': 'Battery swelling warning signs:\n1. Physical deformation\n2. Case separation\n3. Reduced performance\n4. Overheating\n5. Immediate replacement needed',
  'disposal': 'Safe battery disposal:\n1. Never throw in regular trash\n2. Use certified recycling centers\n3. Cover terminals\n4. Keep away from heat\n5. Follow local regulations',
  'winter': 'Cold weather battery care:\n1. Keep above 0°C (32°F)\n2. Charge at room temperature\n3. Expect reduced capacity\n4. Avoid rapid temperature changes\n5. Use insulation when possible',
  'lithium ion': 'Lithium-ion advantages:\n1. High energy density\n2. No memory effect\n3. Low self-discharge\n4. Long cycle life\n5. Fast charging capable',
  'memory effect': 'Modern battery facts:\n1. Li-ion has no memory effect\n2. Partial charges are good\n3. Full cycles not required\n4. Old NiCd batteries had this\n5. Regular calibration helps',
};

// Mock user data
export const MOCK_USER = {
  id: 'user-1',
  name: 'Surya',
  email: 'surya@example.com',
  role: 'admin',
  createdAt: dayjs().subtract(6, 'month').format('YYYY-MM-DD'),
  lastLogin: dayjs().subtract(2, 'hour').format('YYYY-MM-DD HH:mm:ss'),
  profilePicture: 'https://images.pexels.com/photos/936019/pexels-photo-936019.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
};