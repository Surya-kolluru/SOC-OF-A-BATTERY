import * as tf from '@tensorflow/tfjs';

interface ELMConfig {
    inputNodes: number;
    hiddenNodes: number;
    outputNodes: number;
    activationFunction?: 'sigmoid' | 'leakyReLU' | 'tanh';
    lambda?: number;
}

export class ELM {
    private inputNodes: number;
    private hiddenNodes: number;
    private outputNodes: number;
    private inputWeights: tf.Tensor | null = null;
    private biasWeights: tf.Tensor | null = null;
    private outputWeights: tf.Tensor | null = null;
    private activationFunction: string;
    private lambda: number;

    constructor(config: ELMConfig) {
        this.inputNodes = config.inputNodes;
        this.hiddenNodes = config.hiddenNodes;
        this.outputNodes = config.outputNodes;
        this.activationFunction = config.activationFunction || 'leakyReLU';
        this.lambda = config.lambda || 0.001;
    }

    private activation(x: tf.Tensor): tf.Tensor {
        switch (this.activationFunction) {
            case 'sigmoid':
                return tf.sigmoid(x);
            case 'leakyReLU':
                return tf.maximum(tf.scalar(0.01).mul(x), x);
            case 'tanh':
                return tf.tanh(x);
            default:
                return tf.maximum(tf.scalar(0.01).mul(x), x);
        }
    }

    private async calculateHiddenLayerOutput(X: tf.Tensor): Promise<tf.Tensor> {
        if (!this.inputWeights || !this.biasWeights) {
            throw new Error('Model not initialized');
        }
        const weighted = X.matMul(this.inputWeights);
        const biased = weighted.add(this.biasWeights);
        return this.activation(biased);
    }

    async initialize(): Promise<void> {
        this.inputWeights = tf.randomNormal([this.inputNodes, this.hiddenNodes])
            .mul(tf.scalar(Math.sqrt(2 / this.inputNodes)));
        this.biasWeights = tf.randomNormal([1, this.hiddenNodes]);
    }

    async train(X: tf.Tensor, y: tf.Tensor): Promise<void> {
        if (!this.inputWeights || !this.biasWeights) {
            await this.initialize();
        }

        // Calculate hidden layer output
        const H = await this.calculateHiddenLayerOutput(X);
        const HT = H.transpose();

        // Add regularization
        const HTH = HT.matMul(H);
        const regularization = tf.eye(this.hiddenNodes).mul(this.lambda);
        const regularizedHTH = HTH.add(regularization);

        // Calculate output weights using gradient descent
        const HTy = HT.matMul(y);
        const learningRate = 0.01;
        const iterations = 100;
        
        let currentWeights = tf.randomNormal([this.hiddenNodes, this.outputNodes]);
        
        for (let i = 0; i < iterations; i++) {
            const error = regularizedHTH.matMul(currentWeights).sub(HTy);
            const gradient = error.mul(learningRate);
            currentWeights = currentWeights.sub(gradient);
        }

        this.outputWeights = currentWeights;

        // Cleanup intermediate tensors
        HTH.dispose();
        regularization.dispose();
        regularizedHTH.dispose();
        HTy.dispose();
    }

    async predict(X: tf.Tensor): Promise<tf.Tensor> {
        if (!this.outputWeights) {
            throw new Error('Model not trained');
        }
        const H = await this.calculateHiddenLayerOutput(X);
        return H.matMul(this.outputWeights);
    }

    dispose(): void {
        this.inputWeights?.dispose();
        this.biasWeights?.dispose();
        this.outputWeights?.dispose();
    }
} 