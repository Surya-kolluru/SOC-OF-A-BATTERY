import { RandomForestRegression as MLRandomForest } from 'ml-random-forest';

interface RFConfig {
    nEstimators: number;
    maxDepth: number;
    seed?: number;
    maxFeatures?: number;
    replacement?: boolean;
    useSampleWeights?: boolean;
}

interface CrossValidationResult {
    rmse: number;
    mae: number;
    maxError: number;
    stdDev: number;
    r2Score: number;
    computationTime: number;
}

export class RandomForest {
    private model: MLRandomForest;
    private config: RFConfig;
    private trainingTime: number = 0;

    constructor(config: RFConfig) {
        this.config = {
            nEstimators: config.nEstimators || 25,
            maxDepth: config.maxDepth || 10,
            seed: config.seed || 42,
            maxFeatures: config.maxFeatures || 0.8,
            replacement: config.replacement || true,
            useSampleWeights: config.useSampleWeights || false
        };
        
        this.model = new MLRandomForest(this.config);
    }

    async train(X: number[][], y: number[]): Promise<void> {
        const startTime = performance.now();
        this.model.train(X, y);
        this.trainingTime = performance.now() - startTime;
    }

    predict(X: number[][]): number[] {
        return this.model.predict(X);
    }

    async crossValidate(X: number[][], y: number[], k: number = 5): Promise<CrossValidationResult[]> {
        const foldSize = Math.floor(X.length / k);
        const results: CrossValidationResult[] = [];

        for (let fold = 0; fold < k; fold++) {
            const validationStart = fold * foldSize;
            const validationEnd = validationStart + foldSize;

            // Split data into training and validation sets
            const X_train = [
                ...X.slice(0, validationStart),
                ...X.slice(validationEnd)
            ];
            const y_train = [
                ...y.slice(0, validationStart),
                ...y.slice(validationEnd)
            ];
            const X_val = X.slice(validationStart, validationEnd);
            const y_val = y.slice(validationStart, validationEnd);

            // Train and evaluate
            const startTime = performance.now();
            await this.train(X_train, y_train);
            const predictions = this.predict(X_val);
            const computationTime = performance.now() - startTime;

            // Calculate metrics
            results.push({
                ...this.calculateMetrics(predictions, y_val),
                computationTime
            });
        }

        return results;
    }

    private calculateMetrics(predicted: number[], actual: number[]): Omit<CrossValidationResult, 'computationTime'> {
        const n = predicted.length;
        const errors = predicted.map((p, i) => p - actual[i]);
        const absErrors = errors.map(Math.abs);
        const squaredErrors = errors.map(e => e * e);

        // Calculate basic metrics
        const rmse = Math.sqrt(squaredErrors.reduce((a, b) => a + b) / n);
        const mae = absErrors.reduce((a, b) => a + b) / n;
        const maxError = Math.max(...absErrors);

        // Calculate standard deviation
        const meanError = errors.reduce((a, b) => a + b) / n;
        const stdDev = Math.sqrt(
            errors.map(e => Math.pow(e - meanError, 2))
                .reduce((a, b) => a + b) / n
        );

        // Calculate R² score
        const yMean = actual.reduce((a, b) => a + b) / n;
        const totalSS = actual.map(y => Math.pow(y - yMean, 2))
            .reduce((a, b) => a + b);
        const residualSS = squaredErrors.reduce((a, b) => a + b);
        const r2Score = 1 - (residualSS / totalSS);

        return {
            rmse,
            mae,
            maxError,
            stdDev,
            r2Score
        };
    }

    getTrainingTime(): number {
        return this.trainingTime;
    }

    getFeatureImportance(): number[] {
        return this.model.featureImportance();
    }
} 