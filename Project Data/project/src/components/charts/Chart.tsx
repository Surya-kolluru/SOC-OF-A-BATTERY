import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Common chart options
const commonOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        boxWidth: 10,
        usePointStyle: true,
      }
    },
    tooltip: {
      backgroundColor: 'rgba(17, 24, 39, 0.8)',
      titleColor: 'rgba(255, 255, 255, 0.8)',
      bodyColor: 'rgba(255, 255, 255, 0.8)',
      borderColor: 'rgba(75, 85, 99, 0.5)',
      borderWidth: 1,
      padding: 10,
      cornerRadius: 8,
      displayColors: false,
    }
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(75, 85, 99, 0.1)',
      },
      ticks: {
        maxRotation: 0,
        autoSkipPadding: 15,
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(75, 85, 99, 0.1)',
      }
    }
  },
  interaction: {
    mode: 'index',
    intersect: false,
  },
  elements: {
    line: {
      tension: 0.4,
    },
    point: {
      radius: 2,
      hoverRadius: 4,
      hitRadius: 8,
    }
  },
};

// Line Chart Component
interface LineChartProps {
  data: ChartData<'line'>;
  options?: ChartOptions<'line'>;
}

export const LineChart: React.FC<LineChartProps> = ({ data, options = {} }) => {
  return <Line data={data} options={{ ...commonOptions, ...options }} />;
};

// Bar Chart Component
interface BarChartProps {
  data: ChartData<'bar'>;
  options?: ChartOptions<'bar'>;
}

export const BarChart: React.FC<BarChartProps> = ({ data, options = {} }) => {
  return <Bar data={data} options={{ ...commonOptions, ...options }} />;
};

// Re-export ChartJS for direct use
export { ChartJS };
export type { ChartData, ChartOptions };