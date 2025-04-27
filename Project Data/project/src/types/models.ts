export interface ModelResults {
    rmse: number;
    mae: number;
    maxError: number;
    stdDev: number;
    r2Score: number;
    computationTime: number;
    predicted: number[];
    errors: number[];
    nEstimators?: number;  // For Random Forest
    hiddenNodes?: number;  // For ELM
    lstmUnits?: number;    // For LSTM
    kernel?: string;       // For SVR
    learningRate?: number; // For XGBoost and LSTM
}

export interface ModelConfig {
    randomForest: {
        nEstimators: number;
        maxDepth: number;
    };
    elm: {
        hiddenNodes: number;
        activationFunction: 'sigmoid' | 'leakyReLU' | 'tanh';
    };
    lstm: {
        units: number;
        learningRate: number;
        epochs: number;
    };
    xgboost: {
        maxDepth: number;
        learningRate: number;
        nEstimators: number;
    };
    svr: {
        kernel: 'RBF' | 'LINEAR' | 'POLYNOMIAL';
        C: number;
        gamma: number;
    };
} 