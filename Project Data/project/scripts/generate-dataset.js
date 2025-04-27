#!/usr/bin/env node

/**
 * Battery Dataset Generator CLI
 * 
 * This script generates synthetic battery datasets for training the AI model.
 * Usage: node generate-dataset.js [options]
 * 
 * Options:
 *   --count <number>       Number of data points to generate (default: 100)
 *   --output <file>        Output file path (default: battery_dataset_generated.csv)
 *   --comments             Include comments in the output
 *   --help                 Show help
 */

const { generateBatteryDataset } = require('../src/utils/generateBatteryDataset');
const path = require('path');
const fs = require('fs');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  count: 100,
  outputFile: 'battery_dataset_generated.csv',
  includeComments: false
};

// Show help
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Battery Dataset Generator CLI

This script generates synthetic battery datasets for training the AI model.

Usage: node generate-dataset.js [options]

Options:
  --count <number>       Number of data points to generate (default: 100)
  --output <file>        Output file path (default: battery_dataset_generated.csv)
  --comments             Include comments in the output
  --help                 Show help
  `);
  process.exit(0);
}

// Parse arguments
try {
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--count' || arg === '-c') {
      const count = parseInt(args[++i], 10);
      if (isNaN(count) || count <= 0) {
        throw new Error('Count must be a positive number');
      }
      options.count = count;
    } else if (arg === '--output' || arg === '-o') {
      const outputFile = args[++i];
      if (!outputFile || typeof outputFile !== 'string') {
        throw new Error('Output file path must be a non-empty string');
      }
      options.outputFile = outputFile;
    } else if (arg === '--comments') {
      options.includeComments = true;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }
} catch (error) {
  console.error(`Error parsing arguments: ${error.message}`);
  process.exit(1);
}

// Generate dataset
try {
  const outputPath = generateBatteryDataset(options);
  console.log(`\nDataset generated successfully!`);
  console.log(`File: ${outputPath}`);
  console.log(`Data points: ${options.count}`);
  console.log(`\nYou can now use this dataset to train the AI model.`);
  console.log(`1. Go to the AI Battery Assistant section in the dashboard`);
  console.log(`2. Click the "Train AI Model" button`);
  console.log(`3. Upload the generated dataset file`);
} catch (error) {
  console.error(`Error generating dataset: ${error.message}`);
  process.exit(1);
} 