import React, { useState, useRef, useEffect } from 'react';
import { useBatteryStore } from '../store/batteryStore';
import { MessageSquare, Send, BrainCircuit, ArrowDown, User, Bot, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';

const Chatbot: React.FC = () => {
  const { chatMessages, addChatMessage, batteries } = useBatteryStore();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() === '') return;
    
    addChatMessage(message, 'user');
    setMessage('');
  };
  
  // Generate helpful suggestions based on battery data
  const getSuggestions = () => {
    const suggestions = [
      "How can I extend my battery life?",
      "What's the optimal charging strategy?",
      "When should I replace my battery?",
      "Is fast charging bad for batteries?",
      "Why does my battery get hot while charging?",
      "What is battery memory effect?",
      "How can I calibrate my battery?",
      "What's the best way to store batteries long-term?",
      "Why does cold weather affect battery performance?",
    ];
    
    // Add battery-specific suggestions if available
    if (batteries.length > 0) {
      const lowHealthBatteries = batteries.filter(b => b.stats.health < 70);
      if (lowHealthBatteries.length > 0) {
        suggestions.unshift(`Why is my ${lowHealthBatteries[0].name} battery health low?`);
      }
      
      const hotBatteries = batteries.filter(b => b.stats.temperature > 40);
      if (hotBatteries.length > 0) {
        suggestions.unshift(`Why is my ${hotBatteries[0].name} running hot?`);
      }
    }
    
    return suggestions.slice(0, 5);
  };
  
  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2">
            <BrainCircuit size={24} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Battery AI Assistant</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ask me anything about your batteries and optimal management
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-6">
          {chatMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquare size={48} className="text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                No Messages Yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                Start a conversation with your AI Battery Assistant to get help with battery management, tips, and troubleshooting.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {chatMessages.map((chat) => (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${
                    chat.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div className={`max-w-[80%] flex items-start gap-3 ${
                    chat.role === 'user' ? 'flex-row-reverse' : ''
                  }`}>
                    <div className={`rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 ${
                      chat.role === 'user' 
                        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                        : 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400'
                    }`}>
                      {chat.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    
                    <div>
                      <div className={`rounded-lg p-4 ${
                        chat.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        <p className="whitespace-pre-wrap">{chat.content}</p>
                      </div>
                      <div className={`text-xs mt-1 text-gray-500 ${
                        chat.role === 'user' ? 'text-right' : ''
                      }`}>
                        {dayjs(chat.timestamp).format('h:mm A')}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          {/* Suggested Questions */}
          <div className="mb-4 overflow-x-auto whitespace-nowrap pb-2 scrollbar-thin">
            <div className="flex gap-2">
              {getSuggestions().map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setMessage(suggestion);
                  }}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap flex items-center gap-1 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Zap size={12} className="text-yellow-500" />
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about battery management, maintenance, or troubleshooting..."
              className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={message.trim() === ''}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full ${
                message.trim() === ''
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30'
              }`}
            >
              <Send size={18} />
            </button>
          </form>
          
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
            <span>Press Enter to send</span>
            <button
              onClick={scrollToBottom}
              className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <ArrowDown size={12} />
              <span>Scroll to bottom</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;