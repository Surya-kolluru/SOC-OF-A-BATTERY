/// <reference lib="webworker" />

import { RandomForestRegression as RFRegression } from 'ml-random-forest';

interface TrainingData {
  features: number[][];
  labels: number[];
}

interface ModelMetrics {
  accuracy: number;
  features: number;
  trees: number;
  maxDepth: number;
}

let model: RFRegression;

// Handle messages from main thread
self.onmessage = async (e: MessageEvent<{ type: string; data: any }>) => {
  const { type, data } = e.data;

  try {
  switch (type) {
    case 'train':
      await trainModel(data);
      break;
    case 'predict':
      const predictions = predict(data);
      self.postMessage({ type: 'predictions', data: predictions });
      break;
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    self.postMessage({ 
      type: 'error', 
      data: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

async function trainModel(trainingData: TrainingData) {
  try {
    // Validate input data
    if (!Array.isArray(trainingData.features) || !Array.isArray(trainingData.labels)) {
      throw new Error('Invalid training data format');
    }

    if (trainingData.features.length === 0 || trainingData.labels.length === 0) {
      throw new Error('Training data is empty');
    }

    if (trainingData.features.length !== trainingData.labels.length) {
      throw new Error('Features and labels length mismatch');
    }

    // Configure Random Forest model
    const options = {
      nEstimators: 100,
      maxDepth: 10,
      minSamplesSplit: 2,
      treeOptions: { maxFeatures: 'sqrt' }
    };

    // Create and train the model
    model = new RFRegression(options);
    model.train(trainingData.features, trainingData.labels);

    // Calculate training accuracy
    const predictions = model.predict(trainingData.features);
    const accuracy = calculateAccuracy(predictions, trainingData.labels);

    const metrics: ModelMetrics = {
        accuracy,
      features: trainingData.features[0].length,
          trees: options.nEstimators,
          maxDepth: options.maxDepth
    };

    self.postMessage({ type: 'trained', data: metrics });
  } catch (error) {
    throw new Error(`Training failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function predict(features: number[][]) {
  if (!model) {
    throw new Error('Model not trained');
  }

  if (!Array.isArray(features) || features.length === 0) {
    throw new Error('Invalid prediction data');
  }

  return model.predict(features);
}

function calculateAccuracy(predictions: number[], actual: number[]): number {
  if (predictions.length !== actual.length) {
    throw new Error('Predictions and actual values length mismatch');
  }

  const mse = predictions.reduce((sum, pred, i) => {
    return sum + Math.pow(pred - actual[i], 2);
  }, 0) / predictions.length;
  
  const rmse = Math.sqrt(mse);
  const range = Math.max(...actual) - Math.min(...actual);
  
  if (range === 0) {
    return 100; // Perfect accuracy if all values are the same
  }
  
  // Normalized accuracy (0-100%)
  return Math.max(0, Math.min(100, 100 * (1 - rmse / range)));
}