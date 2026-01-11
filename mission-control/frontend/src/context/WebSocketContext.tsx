import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useWebSocket, WebSocketMessage } from '../hooks/useWebSocket';

interface WebSocketContextType {
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  sendMessage: (message: any) => boolean;
  subscribe: (channel: string) => void;
  unsubscribe: (channel: string) => void;
  connectionAttempts: number;
  error: Event | null;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:5002';

  const ws = useWebSocket({
    url: WS_URL,
    onConnect: () => {
      console.log('✅ WebSocket connected');
    },
    onDisconnect: () => {
      console.log('👋 WebSocket disconnected');
    },
    onError: (error) => {
      console.error('❌ WebSocket error:', error);
    },
    reconnect: true,
    reconnectInterval: 3000,
    reconnectAttempts: 10,
    debug: true
  });

  return (
    <WebSocketContext.Provider
      value={{
        isConnected: ws.isConnected,
        lastMessage: ws.lastMessage,
        sendMessage: ws.sendMessage,
        subscribe: ws.subscribe,
        unsubscribe: ws.unsubscribe,
        connectionAttempts: ws.connectionAttempts,
        error: ws.error
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within WebSocketProvider');
  }
  return context;
};

/**
 * Hook to listen to specific WebSocket events
 */
export const useWebSocketEvent = (eventType: string, callback: (data: any) => void) => {
  const { lastMessage } = useWebSocketContext();

  useEffect(() => {
    if (lastMessage && lastMessage.type === eventType && lastMessage.data) {
      callback(lastMessage.data);
    }
  }, [lastMessage, eventType, callback]);
};

export default WebSocketContext;
