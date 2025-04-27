# Battery Dataset for AI Model Training

This directory contains a sample battery dataset that can be used to train the AI model for battery health prediction.

## Dataset Format

The dataset is in CSV format with the following columns:

- **voltage**: Battery voltage in volts (typically 3.0-3.9V for Li-ion batteries)
- **current**: Current in amperes (typically 0.3-1.3A)
- **temperature**: Battery temperature in Celsius (typically 24-38°C)
- **cycles**: Number of charge/discharge cycles
- **age_days**: Age of the battery in days
- **charge_time**: Time taken to charge in minutes
- **discharge_time**: Time taken to discharge in minutes
- **health**: Battery health percentage (target variable for prediction)

## How to Use the Dataset

1. Navigate to the AI Battery Assistant section in the dashboard
2. Click the "Train AI Model" button
3. Upload the `battery_dataset.csv` file when prompted
4. The system will train a Random Forest model using this data
5. Once training is complete, you'll see the model's accuracy displayed

## Creating Your Own Dataset

If you want to create your own dataset, follow these guidelines:

1. Use the same column structure as shown above
2. Include at least 50 data points for reasonable model performance
3. Ensure all values are numeric
4. Make sure the health values range from 0-100 (representing percentage)
5. Save the file in CSV format

## Model Details

The AI model uses a Random Forest algorithm with the following configuration:

- Number of trees: 100
- Maximum tree depth: 10
- Minimum samples for split: 2
- Feature selection: Square root of total features

## Troubleshooting

If you encounter issues when training the model:

1. Check that your CSV file has all the required columns
2. Ensure there are no empty cells or non-numeric values
3. Verify that the file is properly formatted (no extra commas or special characters)
4. Try using the sample dataset provided to confirm the feature is working correctly 