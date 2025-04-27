import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import os

def generate_soc_dataset(n_samples=10000):
    # Set random seed for reproducibility
    np.random.seed(42)
    
    # Generate time series data
    start_time = datetime.now()
    time_steps = [start_time + timedelta(minutes=i) for i in range(n_samples)]
    
    # Generate base SOC values with realistic patterns
    # Start with a full battery and gradually discharge with some charging cycles
    base_soc = np.linspace(100, 20, n_samples)  # Linear discharge trend
    
    # Add charging cycles
    for i in range(0, n_samples, 1000):
        if i + 500 < n_samples:
            base_soc[i:i+500] += 30  # Simulate charging
    
    # Add random noise
    noise = np.random.normal(0, 1, n_samples)
    
    # Add some periodic variations (daily usage patterns)
    time = np.linspace(0, 4*np.pi, n_samples)
    periodic = 5 * np.sin(time)  # 5% periodic variation
    
    # Combine all components
    soc = base_soc + noise + periodic
    
    # Ensure SOC stays within valid range (0-100%)
    soc = np.clip(soc, 0, 100)
    
    # Generate additional features
    temperature = 25 + np.random.normal(0, 2, n_samples)  # Temperature in Celsius
    current = np.random.normal(10, 2, n_samples)  # Current in Amperes
    voltage = 3.7 + 0.1 * (soc/100) + np.random.normal(0, 0.1, n_samples)  # Voltage in Volts
    
    # Create DataFrame
    df = pd.DataFrame({
        'timestamp': time_steps,
        'soc': soc,
        'temperature': temperature,
        'current': current,
        'voltage': voltage
    })
    
    return df

if __name__ == "__main__":
    # Generate dataset
    df = generate_soc_dataset()
    
    # Create data directory if it doesn't exist
    data_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'data')
    os.makedirs(data_dir, exist_ok=True)
    
    # Save to CSV in the data directory
    output_path = os.path.join(data_dir, 'soc_estimation_data.csv')
    df.to_csv(output_path, index=False)
    print(f"Generated dataset with {len(df)} samples")
    print(f"Dataset saved to: {output_path}")
    print("\nFirst few rows of the dataset:")
    print(df.head())
    print("\nDataset statistics:")
    print(df.describe()) 