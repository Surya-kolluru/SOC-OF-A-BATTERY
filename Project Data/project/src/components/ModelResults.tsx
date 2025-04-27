import React from 'react';
import Plot from 'react-plotly.js';

interface ModelResultsProps {
    observed: number[];
    predicted: number[];
    errors: number[];
    metrics: {
        rmse: number;
        mae: number;
        maxError: number;
        stdDev: number;
        r2Score: number;
        computationTime: number;
    };
    title?: string;
}

export const ModelResults: React.FC<ModelResultsProps> = ({
    observed,
    predicted,
    errors,
    metrics,
    title = 'Model Results'
}) => {
    // Create time array for x-axis
    const timePoints = Array.from({ length: observed.length }, (_, i) => i);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            
            {/* SOC Estimation Plot */}
            <div className="border rounded-lg p-4 bg-white shadow-sm">
                <Plot
                    data={[
                        {
                            x: timePoints,
                            y: observed,
                            type: 'scatter',
                            mode: 'lines',
                            name: 'Observed',
                            line: { color: 'blue' }
                        },
                        {
                            x: timePoints,
                            y: predicted,
                            type: 'scatter',
                            mode: 'lines',
                            name: 'Predicted',
                            line: { color: 'red' }
                        }
                    ]}
                    layout={{
                        title: 'SOC Estimation',
                        xaxis: { title: 'Instances (s)' },
                        yaxis: { title: 'SOC (%)' },
                        height: 400,
                        margin: { l: 50, r: 50, t: 50, b: 50 }
                    }}
                />
            </div>

            {/* Error Plot */}
            <div className="border rounded-lg p-4 bg-white shadow-sm">
                <Plot
                    data={[
                        {
                            x: timePoints,
                            y: errors,
                            type: 'scatter',
                            mode: 'lines',
                            name: 'Error',
                            line: { color: 'blue' }
                        }
                    ]}
                    layout={{
                        title: 'Error Analysis',
                        xaxis: { title: 'Instances (s)' },
                        yaxis: { title: 'Error (%)' },
                        height: 300,
                        margin: { l: 50, r: 50, t: 50, b: 50 }
                    }}
                />
            </div>

            {/* Metrics Table */}
            <div className="border rounded-lg p-4 bg-white shadow-sm">
                <h3 className="text-xl font-semibold mb-4">Performance Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <MetricCard title="RMSE" value={metrics.rmse.toFixed(4)} />
                    <MetricCard title="MAE" value={metrics.mae.toFixed(4)} />
                    <MetricCard title="Max Error" value={metrics.maxError.toFixed(4)} />
                    <MetricCard title="Std Dev" value={metrics.stdDev.toFixed(4)} />
                    <MetricCard title="R² Score" value={metrics.r2Score.toFixed(4)} />
                    <MetricCard title="Computation Time" value={`${metrics.computationTime.toFixed(2)}ms`} />
                </div>
            </div>
        </div>
    );
};

const MetricCard: React.FC<{ title: string; value: string }> = ({ title, value }) => (
    <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-600">{title}</h4>
        <p className="text-lg font-semibold text-gray-900">{value}</p>
    </div>
); 