import * as tf from '@tensorflow/tfjs';
import { RandomForest } from './RandomForest';
import { ELM } from './ELM';
import { LSTM } from './LSTM';
import { XGBoost } from './XGBoost';
import { SVR } from './SVR';

interface TrainingConfig {
    rfConfigurations: {
        nEstimators: number;
        maxDepth: number;
    }[];
    elmConfiguration: {
        hiddenNodes: number;
        activationFunction: 'sigmoid' | 'leakyReLU' | 'tanh';
    };
    lstmConfiguration: {
        inputShape: [number, number];
        units: number;
        epochs?: number;
    };
    xgboostConfiguration: {
        maxDepth?: number;
        learningRate?: number;
        nEstimators?: number;
    };
    svrConfiguration: {
        kernel?: 'RBF' | 'LINEAR' | 'POLYNOMIAL';
        C?: number;
        gamma?: number;
    };
    crossValidationFolds: number;
    runs: number;
}

interface ModelResults {
    rmse: number;
    mae: number;
    maxError: number;
    stdDev: number;
    r2Score: number;
    computationTime: number;
    predicted: number[];
    errors: number[];
}

export class TrainingPipeline {
    private config: TrainingConfig;

    constructor(config: Partial<TrainingConfig>) {
        const defaultConfig: TrainingConfig = {
            rfConfigurations: [
                { nEstimators: 25, maxDepth: 10 },
                { nEstimators: 50, maxDepth: 10 },
                { nEstimators: 75, maxDepth: 10 },
                { nEstimators: 100, maxDepth: 10 }
            ],
            elmConfiguration: {
                hiddenNodes: 100,
                activationFunction: 'leakyReLU'
            },
            lstmConfiguration: {
                inputShape: [10, 4], // Default: 10 timesteps, 4 features
                units: 64,
                epochs: 50
            },
            xgboostConfiguration: {
                maxDepth: 6,
                learningRate: 0.3,
                nEstimators: 100
            },
            svrConfiguration: {
                kernel: 'RBF',
                C: 1.0,
                gamma: 0.1
            },
            crossValidationFolds: 5,
            runs: 5
        };

        this.config = { ...defaultConfig, ...config };
        console.log('TrainingPipeline initialized with config:', this.config);
    }

    async trainAndEvaluate(X: number[][], y: number[]): Promise<{
        randomForest: ModelResults[];
        elm: ModelResults;
        lstm: ModelResults;
        xgboost: ModelResults;
        svr: ModelResults;
    }> {
        console.log('Starting trainAndEvaluate with data shape:', { X: X.length, y: y.length });
        
        // Convert data to tensors for ELM and LSTM
        const X_tensor = tf.tensor2d(X);
        const y_tensor = tf.tensor2d(y.map(v => [v]));

        console.log('Data converted to tensors');

        // Train Random Forest models
        const rfResults: ModelResults[] = [];
        for (const rfConfig of this.config.rfConfigurations) {
            console.log('Training Random Forest with config:', rfConfig);
            const rf = new RandomForest(rfConfig);
            const results = await this.evaluateRandomForest(rf, X, y);
            rfResults.push(results);
        }

        // Train ELM model
        console.log('Training ELM model');
        const elm = new ELM({
            inputNodes: X[0].length,
            hiddenNodes: this.config.elmConfiguration.hiddenNodes,
            outputNodes: 1,
            activationFunction: this.config.elmConfiguration.activationFunction
        });
        const elmResults = await this.evaluateELM(elm, X_tensor, y_tensor, X, y);

        // Train LSTM model
        console.log('Training LSTM model');
        const lstm = new LSTM(this.config.lstmConfiguration);
        const lstmResults = await this.evaluateLSTM(lstm, X, y);

        // Train XGBoost model
        console.log('Training XGBoost model');
        const xgboost = new XGBoost(this.config.xgboostConfiguration);
        const xgboostResults = await this.evaluateXGBoost(xgboost, X, y);

        // Train SVR model
        console.log('Training SVR model');
        const svr = new SVR(this.config.svrConfiguration);
        const svrResults = await this.evaluateSVR(svr, X, y);

        // Cleanup
        X_tensor.dispose();
        y_tensor.dispose();

        console.log('All models trained successfully');

        return {
            randomForest: rfResults,
            elm: elmResults,
            lstm: lstmResults,
            xgboost: xgboostResults,
            svr: svrResults
        };
    }

    private async evaluateRandomForest(
        model: RandomForest,
        X: number[][],
        y: number[]
    ): Promise<ModelResults> {
        console.log('Evaluating Random Forest model');
        const results = await model.crossValidate(X, y, this.config.crossValidationFolds);
        const predictions = model.predict(X);
        const errors = predictions.map((p, i) => p - y[i]);

        // Average the cross-validation results
        const avgResults = results.reduce((acc, curr) => ({
            rmse: acc.rmse + curr.rmse / results.length,
            mae: acc.mae + curr.mae / results.length,
            maxError: Math.max(acc.maxError, curr.maxError),
            stdDev: acc.stdDev + curr.stdDev / results.length,
            r2Score: acc.r2Score + curr.r2Score / results.length,
            computationTime: acc.computationTime + curr.computationTime / results.length
        }), {
            rmse: 0,
            mae: 0,
            maxError: -Infinity,
            stdDev: 0,
            r2Score: 0,
            computationTime: 0
        });

        return {
            ...avgResults,
            predicted: predictions,
            errors
        };
    }

    private async evaluateELM(
        model: ELM,
        X_tensor: tf.Tensor,
        y_tensor: tf.Tensor,
        X: number[][],
        y: number[]
    ): Promise<ModelResults> {
        console.log('Evaluating ELM model');
        const startTime = performance.now();
        await model.train(X_tensor, y_tensor);
        const computationTime = performance.now() - startTime;

        const predictions_tensor = await model.predict(X_tensor);
        const predictions = await predictions_tensor.array() as number[][];
        predictions_tensor.dispose();

        const predicted = predictions.map(p => p[0]);
        const errors = predicted.map((p, i) => p - y[i]);

        return {
            ...this.calculateMetrics(predicted, y),
            computationTime,
            predicted,
            errors
        };
    }

    private async evaluateLSTM(
        model: LSTM,
        X: number[][],
        y: number[]
    ): Promise<ModelResults> {
        console.log('Evaluating LSTM model');
        const startTime = performance.now();
        await model.train(X, y);
        const computationTime = performance.now() - startTime;

        const predictions = await model.predict(X);
        const errors = predictions.map((p, i) => p - y[i]);

        return {
            ...this.calculateMetrics(predictions, y),
            computationTime,
            predicted: predictions,
            errors
        };
    }

    private async evaluateXGBoost(
        model: XGBoost,
        X: number[][],
        y: number[]
    ): Promise<ModelResults> {
        console.log('Evaluating XGBoost model');
        const startTime = performance.now();
        await model.train(X, y);
        const computationTime = performance.now() - startTime;

        const predictions = model.predict(X);
        const errors = predictions.map((p, i) => p - y[i]);

        return {
            ...this.calculateMetrics(predictions, y),
            computationTime,
            predicted: predictions,
            errors
        };
    }

    private async evaluateSVR(
        model: SVR,
        X: number[][],
        y: number[]
    ): Promise<ModelResults> {
        console.log('Evaluating SVR model');
        const startTime = performance.now();
        await model.train(X, y);
        const computationTime = performance.now() - startTime;

        const predictions = model.predict(X);
        const errors = predictions.map((p, i) => p - y[i]);

        return {
            ...this.calculateMetrics(predictions, y),
            computationTime,
            predicted: predictions,
            errors
        };
    }

    private calculateMetrics(predicted: number[], actual: number[]): Omit<ModelResults, 'predicted' | 'errors' | 'computationTime'> {
        const n = predicted.length;
        const errors = predicted.map((p, i) => p - actual[i]);
        const absErrors = errors.map(Math.abs);
        const squaredErrors = errors.map(e => e * e);

        const rmse = Math.sqrt(squaredErrors.reduce((a, b) => a + b) / n);
        const mae = absErrors.reduce((a, b) => a + b) / n;
        const maxError = Math.max(...absErrors);

        const meanError = errors.reduce((a, b) => a + b) / n;
        const stdDev = Math.sqrt(
            errors.map(e => Math.pow(e - meanError, 2))
                .reduce((a, b) => a + b) / n
        );

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
} 