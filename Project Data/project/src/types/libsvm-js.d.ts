declare module 'libsvm-js' {
    export interface SVMOptions {
        kernel: 'RBF' | 'LINEAR' | 'POLYNOMIAL';
        type: 'EPSILON_SVR' | 'C_SVC' | 'NU_SVR';
        C: number;
        gamma: number;
        epsilon?: number;
        degree?: number;
    }

    export class SVM {
        constructor(options: SVMOptions);
        train(X: number[][], y: number[]): void;
        predict(X: number[][]): number[];
        getSupportVectors(): number[][];
    }
} 