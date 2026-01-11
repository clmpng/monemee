import { useEffect, useRef, useState, useCallback } from 'react';

export interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp?: string;
}

interface UseWebSocketOptions {
  url: string;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  reconnect?: boolean;
  reconnectInterval?: number;
  reconnectAttempts?: number;
  heartbeatInterval?: number;
  debug?: boolean;
}

interface WebSocketState {
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  connectionAttempts: number;
  error: Event | null;
}

/**
 * Custom hook for WebSocket connection with automatic reconnection
 */
export const useWebSocket = (options: UseWebSocketOptions) => {
  const {
    url,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    reconnect = true,
    reconnectInterval = 3000,
    reconnectAttempts = 10,
    heartbeatInterval = 30000,
    debug = false
  } = options;

  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    lastMessage: null,
    connectionAttempts: 0,
    error: null
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout>();
  const attemptCountRef = useRef(0);

  const log = useCallback((message: string, ...args: any[]) => {
    if (debug) {
      console.log(`[WebSocket] ${message}`, ...args);
    }
  }, [debug]);

  // Send message
  const sendMessage = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      log('Sent message:', message);
      return true;
    }
    log('Cannot send message - connection not open');
    return false;
  }, [log]);

  // Subscribe to specific event types
  const subscribe = useCallback((eventType: string) => {
    sendMessage({
      type: 'subscribe',
      channel: eventType
    });
  }, [sendMessage]);

  // Unsubscribe from event types
  const unsubscribe = useCallback((eventType: string) => {
    sendMessage({
      type: 'unsubscribe',
      channel: eventType
    });
  }, [sendMessage]);

  // Heartbeat
  const startHeartbeat = useCallback(() => {
    if (heartbeatTimeoutRef.current) {
      clearInterval(heartbeatTimeoutRef.current);
    }

    heartbeatTimeoutRef.current = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        sendMessage({ type: 'ping' });
      }
    }, heartbeatInterval);
  }, [heartbeatInterval, sendMessage]);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatTimeoutRef.current) {
      clearInterval(heartbeatTimeoutRef.current);
    }
  }, []);

  // Connect
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      log('Already connected');
      return;
    }

    attemptCountRef.current += 1;
    log(`Connecting... (attempt ${attemptCountRef.current}/${reconnectAttempts})`);

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        log('Connected');
        attemptCountRef.current = 0;
        setState(prev => ({ ...prev, isConnected: true, connectionAttempts: 0, error: null }));
        startHeartbeat();
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          log('Received message:', message);
          setState(prev => ({ ...prev, lastMessage: message }));
          onMessage?.(message);
        } catch (error) {
          log('Error parsing message:', error);
        }
      };

      ws.onerror = (error) => {
        log('Error:', error);
        setState(prev => ({ ...prev, error }));
        onError?.(error);
      };

      ws.onclose = () => {
        log('Disconnected');
        stopHeartbeat();
        setState(prev => ({ ...prev, isConnected: false }));
        onDisconnect?.();

        // Auto-reconnect
        if (reconnect && attemptCountRef.current < reconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            log('Attempting to reconnect...');
            connect();
          }, reconnectInterval);
        } else if (attemptCountRef.current >= reconnectAttempts) {
          log('Max reconnection attempts reached');
        }
      };
    } catch (error) {
      log('Connection error:', error);
    }
  }, [url, reconnect, reconnectInterval, reconnectAttempts, onConnect, onMessage, onError, onDisconnect, startHeartbeat, stopHeartbeat, log]);

  // Disconnect
  const disconnect = useCallback(() => {
    log('Disconnecting...');
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    stopHeartbeat();
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setState(prev => ({ ...prev, isConnected: false }));
  }, [stopHeartbeat, log]);

  // Reconnect manually
  const reconnectManually = useCallback(() => {
    log('Manual reconnect requested');
    attemptCountRef.current = 0;
    disconnect();
    setTimeout(connect, 500);
  }, [connect, disconnect, log]);

  // Auto-connect on mount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [url]); // Only reconnect if URL changes

  return {
    isConnected: state.isConnected,
    lastMessage: state.lastMessage,
    error: state.error,
    connectionAttempts: state.connectionAttempts,
    sendMessage,
    subscribe,
    unsubscribe,
    connect,
    disconnect,
    reconnect: reconnectManually
  };
};

/**
 * Hook for listening to specific WebSocket event types
 */
export const useWebSocketEvent = (
  eventType: string,
  callback: (data: any) => void,
  wsHook: ReturnType<typeof useWebSocket>
) => {
  useEffect(() => {
    if (!wsHook.lastMessage) return;

    if (wsHook.lastMessage.type === eventType) {
      callback(wsHook.lastMessage.data);
    }
  }, [wsHook.lastMessage, eventType, callback]);

  useEffect(() => {
    if (wsHook.isConnected) {
      wsHook.subscribe(eventType);
    }

    return () => {
      if (wsHook.isConnected) {
        wsHook.unsubscribe(eventType);
      }
    };
  }, [wsHook.isConnected, eventType]);
};

export default useWebSocket;
