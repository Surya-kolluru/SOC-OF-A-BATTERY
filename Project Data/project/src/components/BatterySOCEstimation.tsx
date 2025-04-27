import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { ModelTraining } from './ModelTraining';
import { ErrorBoundary } from './ErrorBoundary';

interface ProcessedData {
    features: number[][];
    targets: number[];
}

export const BatterySOCEstimation: React.FC = () => {
    const [data, setData] = useState<ProcessedData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const onDrop = (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            Papa.parse(file, {
                complete: (results) => {
                    try {
                        console.log('Parsing results:', results);
                        const parsedData = results.data as string[][];
                        if (parsedData.length < 2) {
                            throw new Error('File is empty or has insufficient data');
                        }

                        // Remove header row and any empty rows
                        const cleanData = parsedData
                            .slice(1)
                            .filter(row => row.every(cell => cell !== ''));

                        console.log('Clean data:', cleanData);

                        // Extract features (voltage, current, temperature, ambient_temp)
                        const features = cleanData.map(row => [
                            parseFloat(row[1]), // voltage
                            parseFloat(row[2]), // current
                            parseFloat(row[3]), // temperature
                            parseFloat(row[4])  // ambient temperature
                        ]);

                        // Extract target (SOC)
                        const targets = cleanData.map(row => parseFloat(row[5]));

                        console.log('Processed features:', features);
                        console.log('Processed targets:', targets);

                        // Validate data
                        if (features.some(row => row.some(isNaN)) || targets.some(isNaN)) {
                            throw new Error('Invalid data format. Please check your CSV file.');
                        }

                        setData({ features, targets });
                        setError(null);
                    } catch (err) {
                        console.error('Error processing file:', err);
                        setError(err instanceof Error ? err.message : 'Error processing file');
                        setData(null);
                    }
                },
                error: (error: Papa.ParseError) => {
                    console.error('Parse error:', error);
                    setError(error.message);
                    setData(null);
                }
            });
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv']
        },
        maxFiles: 1
    });

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">
                Battery SOC Estimation
            </h1>

            {!data && (
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                        isDragActive
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-blue-500'
                    }`}
                >
                    <input {...getInputProps()} />
                    <p className="text-lg text-gray-600">
                        {isDragActive
                            ? 'Drop the CSV file here'
                            : 'Drag and drop your CSV file here, or click to select'}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        File should contain voltage, current, temperature, ambient temperature, and SOC data
                    </p>
                </div>
            )}

            {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {data && (
                <ErrorBoundary>
                    <ModelTraining data={data} />
                </ErrorBoundary>
            )}
        </div>
    );
}; 