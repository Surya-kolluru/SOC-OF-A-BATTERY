import React, { useState } from 'react';
import { TrainingPipeline } from '../utils/models/TrainingPipeline';
import { ModelResults as ModelResultsComponent } from './ModelResults';
import { ModelResults } from '../types/models';

interface ModelTrainingProps {
    data: {
        features: number[][];
        targets: number[];
    };
}

export const ModelTraining: React.FC<ModelTrainingProps> = ({ data }) => {
    const [isTraining, setIsTraining] = useState(false);
    const [results, setResults] = useState<{
        randomForest: ModelResults[];
        elm: ModelResults;
        lstm: ModelResults;
        xgboost: ModelResults;
        svr: ModelResults;
    } | null>(null);

    console.log('ModelTraining received data:', data);

    const handleTraining = async () => {
        console.log('Starting training with data:', data);
        setIsTraining(true);
        try {
            const pipeline = new TrainingPipeline({
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
                    inputShape: [10, data.features[0].length],
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
                }
            });

            console.log('Training pipeline created, starting evaluation...');
            const trainingResults = await pipeline.trainAndEvaluate(
                data.features,
                data.targets
            );
            console.log('Training completed, results:', trainingResults);
            setResults(trainingResults);
        } catch (error) {
            console.error('Training error:', error);
        } finally {
            setIsTraining(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">
                    Battery SOC Estimation Model Training
                </h1>
                <button
                    onClick={handleTraining}
                    disabled={isTraining}
                    className={`px-4 py-2 rounded-lg font-medium ${
                        isTraining
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                    {isTraining ? 'Training...' : 'Start Training'}
                </button>
            </div>

            {results && (
                <div className="space-y-12">
                    {/* Random Forest Results */}
                    {results.randomForest.map((result, index) => (
                        <ModelResultsComponent
                            key={`rf-${index}`}
                            observed={data.targets}
                            predicted={result.predicted}
                            errors={result.errors}
                            metrics={result}
                            title={`Random Forest (${result.nEstimators} trees)`}
                        />
                    ))}

                    {/* ELM Results */}
                    <ModelResultsComponent
                        observed={data.targets}
                        predicted={results.elm.predicted}
                        errors={results.elm.errors}
                        metrics={results.elm}
                        title="Extreme Learning Machine"
                    />

                    {/* LSTM Results */}
                    <ModelResultsComponent
                        observed={data.targets}
                        predicted={results.lstm.predicted}
                        errors={results.lstm.errors}
                        metrics={results.lstm}
                        title="Long Short-Term Memory (LSTM)"
                    />

                    {/* XGBoost Results */}
                    <ModelResultsComponent
                        observed={data.targets}
                        predicted={results.xgboost.predicted}
                        errors={results.xgboost.errors}
                        metrics={results.xgboost}
                        title="XGBoost"
                    />

                    {/* SVR Results */}
                    <ModelResultsComponent
                        observed={data.targets}
                        predicted={results.svr.predicted}
                        errors={results.svr.errors}
                        metrics={results.svr}
                        title="Support Vector Regression"
                    />

                    {/* Comparison Table */}
                    <div className="border rounded-lg p-6 bg-white shadow-sm">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            Model Comparison
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Model
                                        </th>
                                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            RMSE
                                        </th>
                                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            MAE
                                        </th>
                                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Max Error
                                        </th>
                                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            R² Score
                                        </th>
                                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Time (ms)
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.randomForest.map((rf, index) => (
                                        <tr key={`rf-row-${index}`}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                RF ({rf.nEstimators} trees)
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {rf.rmse.toFixed(4)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {rf.mae.toFixed(4)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {rf.maxError.toFixed(4)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {rf.r2Score.toFixed(4)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {rf.computationTime.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                    {[
                                        { name: 'ELM', results: results.elm },
                                        { name: 'LSTM', results: results.lstm },
                                        { name: 'XGBoost', results: results.xgboost },
                                        { name: 'SVR', results: results.svr }
                                    ].map(({ name, results: modelResults }) => (
                                        <tr key={name}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {modelResults.rmse.toFixed(4)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {modelResults.mae.toFixed(4)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {modelResults.maxError.toFixed(4)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {modelResults.r2Score.toFixed(4)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {modelResults.computationTime.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}; 