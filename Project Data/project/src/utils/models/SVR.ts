import { SVM } from 'libsvm-js';

interface SVRConfig {
    kernel?: 'RBF' | 'LINEAR' | 'POLYNOMIAL';
    C?: number;
    gamma?: number;
    epsilon?: number;
    degree?: number;
}

export class SVR {
    private model: SVM;
    private config: Required<SVRConfig>;

    constructor(config: SVRConfig = {}) {
        this.config = {
            kernel: config.kernel || 'RBF',
            C: config.C || 1.0,
            gamma: config.gamma || 0.1,
            epsilon: config.epsilon || 0.1,
            degree: config.degree || 3
        };

        this.model = new SVM({
            kernel: this.config.kernel,
            type: 'EPSILON_SVR',
            C: this.config.C,
            gamma: this.config.gamma,
            epsilon: this.config.epsilon,
            degree: this.config.degree
        });
    }

    async train(X: number[][], y: number[]): Promise<void> {
        this.model.train(X, y);
    }

    predict(X: number[][]): number[] {
        return X.map(x => this.model.predict([x])[0]);
    }

    getSupportVectors(): number[][] {
        return this.model.getSupportVectors();
    }
} 