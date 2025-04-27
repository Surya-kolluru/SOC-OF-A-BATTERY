declare module 'ml-xgboost' {
    export interface XGBoostOptions {
        booster?: 'gbtree' | 'gblinear' | 'dart';
        objective?: string;
        max_depth?: number;
        eta?: number;
        num_round?: number;
    }

    export class XGBoost {
        constructor(options?: XGBoostOptions);
        train(X: number[][], y: number[]): Promise<void>;
        predict(X: number[][]): number[];
        getFeatureImportance(): { [key: string]: number };
    }
} 