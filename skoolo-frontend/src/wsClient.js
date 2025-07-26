// src/wsClient.js
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = 'https://skoolo-production.up.railway.app/ws-chat'; // Spring Boot SockJS endpoint

export const createStompClient = (onMessageReceived) => {
  const client = new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    reconnectDelay: 5000, // Auto reconnect every 5 sec
    debug: (str) => {
      console.log('[WebSocket]', str);
    },
    onConnect: (frame) => {
      console.log('[WebSocket] Connected:', frame.headers);

      // ✅ IMPORTANT: Call the external onConnect handler
      if (client.onConnectedCallback) {
        client.onConnectedCallback(client);
      }
    },
    onStompError: (frame) => {
      console.error('[WebSocket] Broker error:', frame.headers['message']);
      console.error('Details:', frame.body);
    },
  });

  // 🔁 Hook to register custom message callback after creation
  client.setMessageHandler = (handler) => {
    client.onMessageReceived = handler;
  };

  return client;
};
