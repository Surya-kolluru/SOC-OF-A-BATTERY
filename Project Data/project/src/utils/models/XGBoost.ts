import { XGBoost as MLXGBoost } from 'ml-xgboost';

interface XGBoostConfig {
    maxDepth?: number;
    learningRate?: number;
    nEstimators?: number;
    objective?: 'reg:squarederror';
    boosterType?: 'gbtree' | 'gblinear' | 'dart';
}

export class XGBoost {
    private model: MLXGBoost;
    private config: Required<XGBoostConfig>;

    constructor(config: XGBoostConfig = {}) {
        this.config = {
            maxDepth: config.maxDepth || 6,
            learningRate: config.learningRate || 0.3,
            nEstimators: config.nEstimators || 100,
            objective: config.objective || 'reg:squarederror',
            boosterType: config.boosterType || 'gbtree'
        };

        this.model = new MLXGBoost({
            booster: this.config.boosterType,
            objective: this.config.objective,
            max_depth: this.config.maxDepth,
            eta: this.config.learningRate,
            num_round: this.config.nEstimators
        });
    }

    async train(X: number[][], y: number[]): Promise<void> {
        await this.model.train(X, y);
    }

    predict(X: number[][]): number[] {
        return this.model.predict(X);
    }

    getFeatureImportance(): { [key: string]: number } {
        return this.model.getFeatureImportance();
    }
} 