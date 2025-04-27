declare module 'ml-random-forest' {
  export interface RandomForestOptions {
    seed?: number;
    maxFeatures?: number;
    replacement?: boolean;
    nEstimators?: number;
    maxDepth?: number;
    useSampleWeights?: boolean;
  }

  export class RandomForestRegression {
    constructor(options?: RandomForestOptions);
    train(X: number[][], y: number[]): void;
    predict(X: number[][]): number[];
  }
} 