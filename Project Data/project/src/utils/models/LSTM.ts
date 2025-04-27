import * as tf from '@tensorflow/tfjs';

interface LSTMConfig {
    inputShape: [number, number];  // [timesteps, features]
    units: number;
    learningRate?: number;
    epochs?: number;
    batchSize?: number;
}

export class LSTM {
    private model: tf.Sequential | null = null;
    private config: Required<LSTMConfig>;

    constructor(config: LSTMConfig) {
        this.config = {
            inputShape: config.inputShape,
            units: config.units,
            learningRate: config.learningRate || 0.001,
            epochs: config.epochs || 50,
            batchSize: config.batchSize || 32
        };
    }

    async initialize(): Promise<void> {
        this.model = tf.sequential();
        
        // Add LSTM layer
        this.model.add(tf.layers.lstm({
            units: this.config.units,
            inputShape: this.config.inputShape,
            returnSequences: false
        }));

        // Add Dense output layer
        this.model.add(tf.layers.dense({ units: 1 }));

        // Compile the model
        this.model.compile({
            optimizer: tf.train.adam(this.config.learningRate),
            loss: 'meanSquaredError',
            metrics: ['mse']
        });
    }

    async train(X: number[][], y: number[]): Promise<void> {
        if (!this.model) {
            await this.initialize();
        }

        // Reshape input data for LSTM [samples, timesteps, features]
        const reshapedX = tf.tensor3d(this.reshapeInput(X), [
            X.length,
            this.config.inputShape[0],
            this.config.inputShape[1]
        ]);
        const reshapedY = tf.tensor2d(y.map(v => [v]), [y.length, 1]);

        // Train the model
        await this.model!.fit(reshapedX, reshapedY, {
            epochs: this.config.epochs,
            batchSize: this.config.batchSize,
            validationSplit: 0.2,
            shuffle: true
        });

        // Cleanup
        reshapedX.dispose();
        reshapedY.dispose();
    }

    private reshapeInput(X: number[][]): number[][][] {
        const result: number[][][] = [];
        for (let i = 0; i < X.length; i++) {
            const sequence: number[][] = [];
            for (let j = 0; j < this.config.inputShape[0]; j++) {
                const features: number[] = [];
                for (let k = 0; k < this.config.inputShape[1]; k++) {
                    features.push(X[i][j * this.config.inputShape[1] + k] || 0);
                }
                sequence.push(features);
            }
            result.push(sequence);
        }
        return result;
    }

    async predict(X: number[][]): Promise<number[]> {
        if (!this.model) {
            throw new Error('Model not trained');
        }

        // Reshape input data
        const reshapedX = tf.tensor3d(this.reshapeInput(X), [
            X.length,
            this.config.inputShape[0],
            this.config.inputShape[1]
        ]);

        // Make predictions
        const predictions = this.model.predict(reshapedX) as tf.Tensor;
        const result = await predictions.array() as number[][];

        // Cleanup
        reshapedX.dispose();
        predictions.dispose();

        return result.map(r => r[0]);
    }

    dispose(): void {
        this.model?.dispose();
    }
} 