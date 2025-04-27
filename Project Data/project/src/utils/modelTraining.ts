import Papa from 'papaparse';

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

export interface ModelPrediction {
  health: number;
  remainingLife: number;
  degradationRate: number;
  confidenceScore: number;
}

export interface ModelMetrics {
  accuracy: number;
  features: number;
  trees: number;
  maxDepth: number;
}

// Create and manage the web worker
const worker = new Worker(
  new URL('./randomForest.worker.ts', import.meta.url),
  { type: 'module' }
);

class BatteryMLModel {
  private static instance: BatteryMLModel;
  private isTraining: boolean = false;
  private modelMetrics: ModelMetrics | null = null;
  private messageHandlers: Map<string, (data: any) => void> = new Map();

  private constructor() {
    worker.onmessage = (e: MessageEvent) => {
      const { type, data } = e.data;
      const handler = this.messageHandlers.get(type);
      if (handler) {
        handler(data);
      }
    };

    worker.onerror = (error: ErrorEvent) => {
      console.error('Worker error:', error);
          this.isTraining = false;
    };
  }

  static getInstance(): BatteryMLModel {
    if (!BatteryMLModel.instance) {
      BatteryMLModel.instance = new BatteryMLModel();
    }
    return BatteryMLModel.instance;
  }

  async loadAndTrainModel(csvData: string): Promise<ModelMetrics> {
    if (this.isTraining) {
      throw new Error('Model is already training');
    }

    this.isTraining = true;

    try {
      // Parse the CSV data
      const { data, errors } = Papa.parse<DatasetRow>(csvData, { 
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
      });

      if (errors.length > 0) {
        throw new Error('Error parsing CSV data: ' + errors[0].message);
      }

      if (data.length === 0) {
        throw new Error('Dataset is empty');
      }

      // Validate required columns
      const requiredColumns = ['voltage', 'current', 'temperature', 'cycles', 'age_days', 'charge_time', 'discharge_time', 'health'];
      const missingColumns = requiredColumns.filter(col => !(col in data[0]));
      
      if (missingColumns.length > 0) {
        throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
      }

      // Validate data types and ranges
      const validationErrors = this.validateData(data);
      if (validationErrors.length > 0) {
        throw new Error('Data validation failed: ' + validationErrors.join(', '));
      }

      // Prepare features and labels
      const features = data.map((row: DatasetRow) => [
        row.voltage,
        row.current,
        row.temperature,
        row.cycles,
        row.age_days,
        row.charge_time,
        row.discharge_time
      ]);

      const labels = data.map((row: DatasetRow) => row.health);

      // Train the model
      return new Promise<ModelMetrics>((resolve, reject) => {
        const timeout = setTimeout(() => {
          this.messageHandlers.delete('trained');
          this.messageHandlers.delete('error');
          reject(new Error('Training timeout'));
        }, 30000);

        this.messageHandlers.set('trained', (metrics: ModelMetrics) => {
            clearTimeout(timeout);
          this.messageHandlers.delete('trained');
          this.messageHandlers.delete('error');
          this.modelMetrics = metrics;
          resolve(metrics);
        });

        this.messageHandlers.set('error', (error: string) => {
            clearTimeout(timeout);
          this.messageHandlers.delete('trained');
          this.messageHandlers.delete('error');
          reject(new Error(error));
        });

        worker.postMessage({
          type: 'train',
          data: { features, labels }
        });
      });
    } catch (error) {
      this.isTraining = false;
      throw error;
    }
  }

  async predict(features: number[][]): Promise<ModelPrediction[]> {
    if (!this.modelMetrics) {
      throw new Error('Model not trained');
    }

    if (!Array.isArray(features) || features.length === 0) {
      throw new Error('Invalid prediction data');
    }

    return new Promise<ModelPrediction[]>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.messageHandlers.delete('predictions');
        this.messageHandlers.delete('error');
        reject(new Error('Prediction timeout'));
      }, 10000);

      this.messageHandlers.set('predictions', (predictions: number[]) => {
        clearTimeout(timeout);
        this.messageHandlers.delete('predictions');
        this.messageHandlers.delete('error');
        const results = predictions.map(pred => ({
          health: pred,
          remainingLife: this.calculateRemainingLife(pred),
          degradationRate: this.calculateDegradationRate(pred),
          confidenceScore: this.calculateConfidenceScore(pred)
        }));
        resolve(results);
      });

      this.messageHandlers.set('error', (error: string) => {
        clearTimeout(timeout);
        this.messageHandlers.delete('predictions');
        this.messageHandlers.delete('error');
        reject(new Error(error));
      });

      worker.postMessage({
        type: 'predict',
        data: features
      });
    });
  }

  getModelMetrics(): ModelMetrics | null {
    return this.modelMetrics;
  }

  private validateData(data: DatasetRow[]): string[] {
    const errors: string[] = [];

    data.forEach((row, index) => {
      if (row.voltage < 2.5 || row.voltage > 4.2) {
        errors.push(`Row ${index + 1}: Voltage out of range (2.5-4.2V)`);
      }
      if (row.current < 0 || row.current > 5) {
        errors.push(`Row ${index + 1}: Current out of range (0-5A)`);
      }
      if (row.temperature < -20 || row.temperature > 60) {
        errors.push(`Row ${index + 1}: Temperature out of range (-20°C to 60°C)`);
      }
      if (row.cycles < 0) {
        errors.push(`Row ${index + 1}: Cycles cannot be negative`);
      }
      if (row.age_days < 0) {
        errors.push(`Row ${index + 1}: Age cannot be negative`);
      }
      if (row.charge_time < 0) {
        errors.push(`Row ${index + 1}: Charge time cannot be negative`);
      }
      if (row.discharge_time < 0) {
        errors.push(`Row ${index + 1}: Discharge time cannot be negative`);
      }
      if (row.health < 0 || row.health > 100) {
        errors.push(`Row ${index + 1}: Health must be between 0 and 100`);
      }
    });

    return errors;
  }

  private calculateRemainingLife(health: number): number {
    // Estimate remaining life based on health
    const baseLife = 1000; // Base lifetime in days
    return Math.max(0, (health / 100) * baseLife);
  }

  private calculateDegradationRate(health: number): number {
    // Calculate degradation rate based on health
    return (100 - health) / 100;
  }

  private calculateConfidenceScore(prediction: number): number {
    // Calculate confidence score based on model metrics and prediction
    if (!this.modelMetrics) return 0;
    
    const baseConfidence = this.modelMetrics.accuracy;
    const predictionFactor = Math.min(1, prediction / 100);
    
    return baseConfidence * predictionFactor;
  }
}

export const batteryMLModel = BatteryMLModel.getInstance();