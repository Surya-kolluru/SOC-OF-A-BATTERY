import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Battery, BatteryFilter, Notification, ChatMessage } from '../types';
import { 
  generateMockBatteries, 
  updateBatteryStats, 
  generateMockNotifications,
  generateSampleChat,
  MOCK_USER,
  CHATBOT_RESPONSES 
} from '../utils/mockData';
import dayjs from 'dayjs';

interface BatteryStoreState {
  batteries: Battery[];
  filteredBatteries: Battery[];
  selectedBatteryId: string | null;
  batteryFilter: BatteryFilter;
  notifications: Notification[];
  unreadNotificationCount: number;
  simulationActive: boolean;
  simulationInterval: number | null;
  chatMessages: ChatMessage[];
  user: typeof MOCK_USER;
  
  // Battery actions
  initializeBatteries: () => void;
  selectBattery: (id: string | null) => void;
  addBattery: (battery: Omit<Battery, 'id' | 'history' | 'predictions'>) => void;
  updateBattery: (id: string, updates: Partial<Battery>) => void;
  removeBattery: (id: string) => void;
  toggleBatteryCharging: (id: string) => void;
  toggleBatteryActive: (id: string) => void;
  
  // Simulation actions
  startSimulation: () => void;
  stopSimulation: () => void;
  updateAllBatteries: () => void;
  
  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  
  // Filter actions
  updateFilter: (filter: Partial<BatteryFilter>) => void;
  applyFilters: () => void;
  resetFilters: () => void;
  
  // Chat actions
  addChatMessage: (content: string, role: 'user' | 'assistant') => void;
  generateAIResponse: (message: string) => void;
}

// Create the store with zustand
export const useBatteryStore = create<BatteryStoreState>()(
  devtools(
    (set, get) => ({
      batteries: [],
      filteredBatteries: [],
      selectedBatteryId: null,
      batteryFilter: {
        search: '',
        manufacturer: [],
        chemistry: [],
        health: [0, 100],
        stateOfCharge: [0, 100],
      },
      notifications: [],
      unreadNotificationCount: 0,
      simulationActive: false,
      simulationInterval: null,
      chatMessages: generateSampleChat(),
      user: MOCK_USER,
      
      // Initialize the store with mock data
      initializeBatteries: () => {
        const mockBatteries = generateMockBatteries(6);
        const mockNotifications = generateMockNotifications(mockBatteries.map(b => b.id));
        const unreadCount = mockNotifications.filter(n => !n.isRead).length;
        
        set({
          batteries: mockBatteries,
          filteredBatteries: mockBatteries,
          notifications: mockNotifications,
          unreadNotificationCount: unreadCount,
        });
      },
      
      // Battery selection
      selectBattery: (id) => {
        set({ selectedBatteryId: id });
      },
      
      // Add a new battery
      addBattery: (batteryData) => {
        const newBattery: Battery = {
          id: `battery-${Date.now().toString(36)}`,
          ...batteryData,
          isActive: true,
          stats: {
            stateOfCharge: 50,
            voltage: 3.7,
            current: 0,
            temperature: 25,
            health: 100,
            cycles: 0,
            lastCharged: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            lastFullCharge: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            timeToEmpty: 300,
            timeToFull: 0,
            power: 0,
          },
          history: [],
          predictions: {
            estimatedHealth: 95,
            remainingLifetime: 1000,
            degradationRate: 0.02,
            recommendedChargeLimit: 85,
            recommendedDischargeLimit: 15,
            optimalChargingTemperature: [15, 25],
            estimatedReplacementDate: dayjs().add(3, 'year').format('YYYY-MM-DD'),
            confidenceScore: 90,
          }
        };
        
        const updatedBatteries = [...get().batteries, newBattery];
        set({ 
          batteries: updatedBatteries,
          filteredBatteries: updatedBatteries,
          selectedBatteryId: newBattery.id
        });
        
        // Add notification for new battery
        get().addNotification({
          batteryId: newBattery.id,
          title: 'New Battery Added',
          message: `${newBattery.name} has been added to your dashboard.`,
          type: 'success'
        });
      },
      
      // Update an existing battery
      updateBattery: (id, updates) => {
        const { batteries } = get();
        const updatedBatteries = batteries.map(battery => 
          battery.id === id ? { ...battery, ...updates } : battery
        );
        
        set({ 
          batteries: updatedBatteries,
          filteredBatteries: get().applyFilters()
        });
      },
      
      // Remove a battery
      removeBattery: (id) => {
        const { batteries, selectedBatteryId } = get();
        const updatedBatteries = batteries.filter(battery => battery.id !== id);
        
        set({ 
          batteries: updatedBatteries,
          filteredBatteries: updatedBatteries,
          selectedBatteryId: selectedBatteryId === id ? null : selectedBatteryId
        });
        
        // Add notification for battery removal
        get().addNotification({
          batteryId: null,
          title: 'Battery Removed',
          message: `A battery has been removed from your dashboard.`,
          type: 'info'
        });
      },
      
      // Toggle battery charging state
      toggleBatteryCharging: (id) => {
        const { batteries } = get();
        const battery = batteries.find(b => b.id === id);
        
        if (battery) {
          const isCharging = !battery.isCharging;
          get().updateBattery(id, { isCharging });
          
          // Add notification for charging state change
          get().addNotification({
            batteryId: id,
            title: isCharging ? 'Charging Started' : 'Charging Stopped',
            message: `${battery.name} is now ${isCharging ? 'charging' : 'discharging'}.`,
            type: 'info'
          });
        }
      },
      
      // Toggle battery active state
      toggleBatteryActive: (id) => {
        const { batteries } = get();
        const battery = batteries.find(b => b.id === id);
        
        if (battery) {
          const isActive = !battery.isActive;
          get().updateBattery(id, { isActive });
          
          // Add notification for active state change
          get().addNotification({
            batteryId: id,
            title: isActive ? 'Battery Activated' : 'Battery Deactivated',
            message: `${battery.name} is now ${isActive ? 'active' : 'inactive'}.`,
            type: isActive ? 'success' : 'info'
          });
        }
      },
      
      // Start battery simulation
      startSimulation: () => {
        const interval = setInterval(() => {
          get().updateAllBatteries();
        }, 3000) as unknown as number;
        
        set({ 
          simulationActive: true,
          simulationInterval: interval
        });
      },
      
      // Stop battery simulation
      stopSimulation: () => {
        const { simulationInterval } = get();
        if (simulationInterval) {
          clearInterval(simulationInterval);
        }
        
        set({ 
          simulationActive: false,
          simulationInterval: null
        });
      },
      
      // Update all active batteries
      updateAllBatteries: () => {
        const { batteries } = get();
        const updatedBatteries = batteries.map(battery => 
          battery.isActive ? updateBatteryStats(battery) : battery
        );
        
        // Check for critical states that should trigger notifications
        updatedBatteries.forEach(battery => {
          const { stats, id, name, isCharging } = battery;
          
          // Low battery notification (below 15%)
          if (stats.stateOfCharge < 15 && stats.stateOfCharge > 5 && !isCharging) {
            get().addNotification({
              batteryId: id,
              title: 'Low Battery',
              message: `${name} is at ${Math.round(stats.stateOfCharge)}% charge. Consider charging soon.`,
              type: 'warning'
            });
          }
          
          // Critical battery notification (below 5%)
          if (stats.stateOfCharge < 5 && !isCharging) {
            get().addNotification({
              batteryId: id,
              title: 'Critical Battery Level',
              message: `${name} is at ${Math.round(stats.stateOfCharge)}% charge. Connect to charger immediately.`,
              type: 'error'
            });
          }
          
          // Fully charged notification
          if (stats.stateOfCharge > 99 && isCharging) {
            get().addNotification({
              batteryId: id,
              title: 'Battery Fully Charged',
              message: `${name} is now fully charged.`,
              type: 'success'
            });
          }
          
          // Overcharging notification
          if (stats.stateOfCharge >= 100 && isCharging) {
            get().addNotification({
              batteryId: id,
              title: 'Overcharging Warning',
              message: `${name} has been at 100% for over 5 minutes. Consider unplugging.`,
              type: 'warning'
            });
          }
          
          // Temperature warning
          if (stats.temperature > 45) {
            get().addNotification({
              batteryId: id,
              title: 'High Temperature Warning',
              message: `${name} temperature is ${Math.round(stats.temperature)}°C, which is above safe levels.`,
              type: 'error'
            });
          }
        });
        
        set({ 
          batteries: updatedBatteries,
          filteredBatteries: get().applyFilters()
        });
      },
      
      // Add a new notification
      addNotification: (notification) => {
        const newNotification: Notification = {
          id: `notification-${Date.now().toString(36)}`,
          ...notification,
          timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          isRead: false
        };
        
        const updatedNotifications = [newNotification, ...get().notifications];
        
        set({ 
          notifications: updatedNotifications,
          unreadNotificationCount: get().unreadNotificationCount + 1
        });
      },
      
      // Mark a notification as read
      markNotificationAsRead: (id) => {
        const { notifications } = get();
        const updatedNotifications = notifications.map(notification => 
          notification.id === id ? { ...notification, isRead: true } : notification
        );
        
        set({ 
          notifications: updatedNotifications,
          unreadNotificationCount: updatedNotifications.filter(n => !n.isRead).length
        });
      },
      
      // Mark all notifications as read
      markAllNotificationsAsRead: () => {
        const { notifications } = get();
        const updatedNotifications = notifications.map(notification => 
          ({ ...notification, isRead: true })
        );
        
        set({ 
          notifications: updatedNotifications,
          unreadNotificationCount: 0
        });
      },
      
      // Update the filter
      updateFilter: (filterUpdates) => {
        set({ 
          batteryFilter: { ...get().batteryFilter, ...filterUpdates }
        });
      },
      
      // Apply the current filters
      applyFilters: () => {
        const { batteries, batteryFilter } = get();
        const { search, manufacturer, chemistry, health, stateOfCharge } = batteryFilter;
        
        // Apply all filters
        const filtered = batteries.filter(battery => {
          // Search filter
          const searchMatch = search === '' || 
            battery.name.toLowerCase().includes(search.toLowerCase()) ||
            battery.model.toLowerCase().includes(search.toLowerCase()) ||
            battery.manufacturer.toLowerCase().includes(search.toLowerCase());
          
          // Manufacturer filter
          const manufacturerMatch = manufacturer.length === 0 || 
            manufacturer.includes(battery.manufacturer);
          
          // Chemistry filter
          const chemistryMatch = chemistry.length === 0 || 
            chemistry.includes(battery.chemistry);
          
          // Health range filter
          const healthMatch = battery.stats.health >= health[0] && 
            battery.stats.health <= health[1];
          
          // State of charge range filter
          const socMatch = battery.stats.stateOfCharge >= stateOfCharge[0] && 
            battery.stats.stateOfCharge <= stateOfCharge[1];
          
          return searchMatch && manufacturerMatch && chemistryMatch && healthMatch && socMatch;
        });
        
        set({ filteredBatteries: filtered });
        return filtered;
      },
      
      // Reset all filters
      resetFilters: () => {
        const defaultFilter: BatteryFilter = {
          search: '',
          manufacturer: [],
          chemistry: [],
          health: [0, 100],
          stateOfCharge: [0, 100],
        };
        
        set({ 
          batteryFilter: defaultFilter,
          filteredBatteries: get().batteries
        });
      },
      
      // Add a new chat message
      addChatMessage: (content, role) => {
        const newMessage: ChatMessage = {
          id: `message-${Date.now().toString(36)}`,
          role,
          content,
          timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss')
        };
        
        set({ 
          chatMessages: [...get().chatMessages, newMessage]
        });
        
        // If the message is from the user, generate an AI response
        if (role === 'user') {
          get().generateAIResponse(content);
        }
      },
      
      // Generate an AI response based on user input
      generateAIResponse: (message) => {
        const lowerMessage = message.toLowerCase();
        
        // Search for battery-specific information in the message
        let response = '';
        
        // Look for matches in our predefined responses
        for (const [keyword, responseText] of Object.entries(CHATBOT_RESPONSES)) {
          if (lowerMessage.includes(keyword)) {
            response = responseText;
            break;
          }
        }
        
        // Handle battery-specific queries
        if (lowerMessage.includes('my battery') || lowerMessage.includes('battery status')) {
          const { selectedBatteryId, batteries } = get();
          const battery = selectedBatteryId ? 
            batteries.find(b => b.id === selectedBatteryId) : 
            batteries[0];
          
          if (battery) {
            response = `Your battery ${battery.name} is currently at ${Math.round(battery.stats.stateOfCharge)}% charge with a health rating of ${Math.round(battery.stats.health)}%. `;
            
            if (battery.isCharging) {
              response += `It's currently charging and should be fully charged in approximately ${Math.round(battery.stats.timeToFull)} minutes.`;
            } else {
              response += `At the current discharge rate, it should last approximately ${Math.round(battery.stats.timeToEmpty)} minutes.`;
            }
          }
        }
        
        // If no specific match was found, provide a generic response
        if (!response) {
          response = "I don't have specific information about that. Can you ask something about battery charging, health, temperature, storage, or maintenance?";
        }
        
        // Add the AI response with a slight delay to simulate thinking
        setTimeout(() => {
          get().addChatMessage(response, 'assistant');
        }, 1000);
      }
    })
  )
);