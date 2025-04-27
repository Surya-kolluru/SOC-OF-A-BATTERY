import React, { useState } from 'react';
import { useBatteryStore } from '../store/batteryStore';
import { BarChart, LineChart } from '../components/charts/Chart';
import { 
  BarChart as BarChartIcon, 
  LineChart as LineChartIcon, 
  Calendar, 
  Download, 
  Share, 
  ChevronDown,
  BatteryCharging
} from 'lucide-react';
import { ChartTimeframe } from '../types';
import dayjs from 'dayjs';

const Analytics: React.FC = () => {
  const { batteries } = useBatteryStore();
  const [timeframe, setTimeframe] = useState<ChartTimeframe>('24h');
  const [selectedChart, setSelectedChart] = useState<'soc' | 'health' | 'temp' | 'cycles'>('soc');
  
  const getTimeframeData = (timeframe: ChartTimeframe) => {
    if (batteries.length === 0) return [];
    
    // Get a representative battery for time calculations
    const battery = batteries[0];
    const history = battery.history;
    
    switch (timeframe) {
      case '1h':
        return history.slice(-60); // Last hour (assuming minute-by-minute data)
      case '24h':
        return history.slice(-24); // Last 24 hours (assuming hourly data)
      case '7d':
        return history.slice(-168); // Last 7 days (7 * 24 hours)
      case '30d':
        return history.slice(-720); // Last 30 days (30 * 24 hours)
      case '1y':
        return history.filter((_, i) => i % 24 === 0).slice(-365); // Daily samples for a year
      case 'all':
        return history.filter((_, i) => i % 48 === 0); // Every other day for all time
    }
  };
  
  const getChartData = () => {
    if (batteries.length === 0) return null;
    
    const timeData = getTimeframeData(timeframe);
    const labels = timeData.map(point => 
      dayjs(point.timestamp).format(timeframe === '1h' ? 'HH:mm' : 'MM/DD')
    );
    
    // Create chart data based on selected chart type
    switch (selectedChart) {
      case 'soc':
        return {
          labels,
          datasets: batteries.slice(0, 5).map((battery, index) => ({
            label: battery.name,
            data: getTimeframeData(timeframe).map(point => point.stateOfCharge),
            borderColor: getColor(index),
            backgroundColor: `${getColor(index)}20`,
            tension: 0.4,
            fill: false,
          }))
        };
      
      case 'health':
        return {
          labels,
          datasets: batteries.slice(0, 5).map((battery, index) => ({
            label: battery.name,
            data: getTimeframeData(timeframe).map(point => point.health),
            borderColor: getColor(index),
            backgroundColor: `${getColor(index)}20`,
            tension: 0.4,
            fill: false,
          }))
        };
      
      case 'temp':
        return {
          labels,
          datasets: batteries.slice(0, 5).map((battery, index) => ({
            label: battery.name,
            data: getTimeframeData(timeframe).map(point => point.temperature),
            borderColor: getColor(index),
            backgroundColor: `${getColor(index)}20`,
            tension: 0.4,
            fill: false,
          }))
        };
      
      case 'cycles':
        // For cycles, we'll use a bar chart with simulated cycle count growth
        const cycleLabels = batteries.map(b => b.name);
        return {
          labels: cycleLabels,
          datasets: [
            {
              label: 'Cycle Count',
              data: batteries.map(b => b.stats.cycles),
              backgroundColor: batteries.map((_, i) => getColor(i)),
              borderRadius: 4,
            }
          ]
        };
    }
  };
  
  const getChartOptions = () => {
    switch (selectedChart) {
      case 'soc':
        return {
          scales: {
            y: {
              title: {
                display: true,
                text: 'State of Charge (%)'
              },
              min: 0,
              max: 100,
            }
          }
        };
      
      case 'health':
        return {
          scales: {
            y: {
              title: {
                display: true,
                text: 'Health (%)'
              },
              min: 0,
              max: 100,
            }
          }
        };
      
      case 'temp':
        return {
          scales: {
            y: {
              title: {
                display: true,
                text: 'Temperature (°C)'
              },
              min: 0,
              max: 60,
            }
          }
        };
      
      case 'cycles':
        return {
          indexAxis: 'y' as const,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Cycle Count'
              },
              min: 0,
            }
          }
        };
    }
  };
  
  const getColor = (index: number) => {
    const colors = [
      'rgb(59, 130, 246)',   // blue
      'rgb(16, 185, 129)',   // green
      'rgb(245, 158, 11)',   // amber
      'rgb(239, 68, 68)',    // red
      'rgb(139, 92, 246)',   // purple
      'rgb(14, 165, 233)',   // sky
    ];
    
    return colors[index % colors.length];
  };
  
  const getChartTitle = () => {
    switch (selectedChart) {
      case 'soc':
        return 'State of Charge Over Time';
      case 'health':
        return 'Battery Health Degradation';
      case 'temp':
        return 'Temperature Variations';
      case 'cycles':
        return 'Charge Cycle Comparison';
    }
  };
  
  const exportData = () => {
    // Create CSV data from chart data
    const chartData = getChartData();
    if (!chartData) return;
    
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Add header row
    const headers = ['Timestamp', ...chartData.datasets.map(ds => ds.label)];
    csvContent += headers.join(',') + '\n';
    
    // Add data rows
    chartData.labels.forEach((label, i) => {
      const row = [label];
      
      // Add values for each dataset
      chartData.datasets.forEach(dataset => {
        row.push(dataset.data[i]);
      });
      
      csvContent += row.join(',') + '\n';
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `battery-${selectedChart}-${timeframe}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const chartData = getChartData();
  const chartOptions = getChartOptions();
  
  if (batteries.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <BatteryCharging size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
            No Batteries Available
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Add batteries to view analytics data
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics</h1>
        
        <div className="flex gap-3">
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Download size={16} />
            <span>Export</span>
          </button>
          
          <button
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Share size={16} />
            <span>Share</span>
          </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-lg font-semibold">{getChartTitle()}</h2>
            
            <div className="flex flex-wrap gap-3">
              <div className="flex">
                <button
                  onClick={() => setSelectedChart('soc')}
                  className={`px-3 py-1.5 flex items-center gap-1 rounded-l-lg border ${
                    selectedChart === 'soc' 
                      ? 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400'
                      : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <LineChartIcon size={14} />
                  <span>SoC</span>
                </button>
                
                <button
                  onClick={() => setSelectedChart('health')}
                  className={`px-3 py-1.5 flex items-center gap-1 border-t border-b ${
                    selectedChart === 'health' 
                      ? 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400'
                      : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <LineChartIcon size={14} />
                  <span>Health</span>
                </button>
                
                <button
                  onClick={() => setSelectedChart('temp')}
                  className={`px-3 py-1.5 flex items-center gap-1 border-t border-b ${
                    selectedChart === 'temp' 
                      ? 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400'
                      : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <LineChartIcon size={14} />
                  <span>Temp</span>
                </button>
                
                <button
                  onClick={() => setSelectedChart('cycles')}
                  className={`px-3 py-1.5 flex items-center gap-1 rounded-r-lg border ${
                    selectedChart === 'cycles' 
                      ? 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400'
                      : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <BarChartIcon size={14} />
                  <span>Cycles</span>
                </button>
              </div>
              
              {selectedChart !== 'cycles' && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Timeframe:</span>
                  <div className="relative">
                    <select
                      value={timeframe}
                      onChange={(e) => setTimeframe(e.target.value as ChartTimeframe)}
                      className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg pr-8 pl-3 py-1.5 appearance-none"
                    >
                      <option value="1h">1 Hour</option>
                      <option value="24h">24 Hours</option>
                      <option value="7d">7 Days</option>
                      <option value="30d">30 Days</option>
                      <option value="1y">1 Year</option>
                      <option value="all">All Time</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="h-80">
            {chartData && (
              selectedChart === 'cycles'
                ? <BarChart data={chartData} options={chartOptions} />
                : <LineChart data={chartData} options={chartOptions} />
            )}
          </div>
          
          <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <Calendar size={14} />
            <span>
              Data shown from {' '}
              {timeframe === '1h' ? 'last hour' : 
               timeframe === '24h' ? 'last 24 hours' :
               timeframe === '7d' ? 'last 7 days' :
               timeframe === '30d' ? 'last 30 days' :
               timeframe === '1y' ? 'last year' : 'all time'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Charge Efficiency Analysis</h3>
            <div className="h-64">
              <BarChart
                data={{
                  labels: batteries.slice(0, 5).map(b => b.name),
                  datasets: [
                    {
                      label: 'Charge Efficiency (%)',
                      data: batteries.slice(0, 5).map(() => Math.round(85 + Math.random() * 10)),
                      backgroundColor: 'rgb(16, 185, 129)',
                      borderRadius: 4,
                    }
                  ]
                }}
              />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Power Consumption Trends</h3>
            <div className="h-64">
              <LineChart
                data={{
                  labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
                  datasets: [
                    {
                      label: 'Power (W)',
                      data: Array.from({ length: 24 }, () => Math.random() * 5 + 2),
                      borderColor: 'rgb(239, 68, 68)',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      tension: 0.4,
                      fill: true,
                    }
                  ]
                }}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-8">
        <h2 className="text-lg font-semibold">Battery Reports</h2>
        <button
          onClick={exportData}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          <Download size={16} />
          <span>Download Report</span>
        </button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
              <h4 className="font-medium mb-2">Battery Health Report</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Detailed analysis of battery health, degradation patterns, and estimated lifetime.
              </p>
              <button
                onClick={() => exportData()}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                Download PDF
              </button>
            </div>
            
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
              <h4 className="font-medium mb-2">Usage Statistics</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Comprehensive usage patterns, charge cycles, and power consumption statistics.
              </p>
              <button
                onClick={() => exportData()}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                Download CSV
              </button>
            </div>
            
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
              <h4 className="font-medium mb-2">Performance Comparison</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Side-by-side comparison of all batteries with efficiency ratings and recommendations.
              </p>
              <button
                onClick={() => exportData()}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                Download Excel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;