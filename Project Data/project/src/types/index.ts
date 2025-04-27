export interface Battery {
  id: string;
  name: string;
  image: string;
  model: string;
  manufacturer: string;
  capacity: number; // mAh
  voltage: number; // V
  chemistry: string;
  manufactureDate: string;
  purchaseDate: string;
  isCharging: boolean;
  isActive: boolean;
  stats: BatteryStats;
  history: BatteryHistoryPoint[];
  predictions: BatteryPredictions;
}

export interface BatteryStats {
  stateOfCharge: number; // %
  voltage: number; // V
  current: number; // A
  temperature: number; // °C
  health: number; // %
  cycles: number;
  lastCharged: string;
  lastFullCharge: string;
  timeToEmpty: number; // minutes
  timeToFull: number; // minutes
  power: number; // W
}

export interface BatteryHistoryPoint {
  timestamp: string;
  stateOfCharge: number;
  voltage: number;
  current: number;
  temperature: number;
  health: number;
  power: number;
}

export interface BatteryPredictions {
  estimatedHealth: number; // %
  remainingLifetime: number; // days
  degradationRate: number; // % per charge cycle
  recommendedChargeLimit: number; // %
  recommendedDischargeLimit: number; // %
  optimalChargingTemperature: [number, number]; // °C range
  estimatedReplacementDate: string;
  confidenceScore: number; // %
}

export interface Notification {
  id: string;
  batteryId: string | null;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  isRead: boolean;
}

export type ChartTimeframe = '1h' | '24h' | '7d' | '30d' | '1y' | 'all';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
  lastLogin: string;
  profilePicture: string;
}

export interface BatteryFilter {
  search: string;
  manufacturer: string[];
  chemistry: string[];
  health: [number, number]; // min, max
  stateOfCharge: [number, number]; // min, max
}