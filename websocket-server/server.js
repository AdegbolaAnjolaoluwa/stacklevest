const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

console.log('WebSocket server started on port 8080');

const clients = new Set();

// Store messages in memory for this session
const messageHistory = [];

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('Client connected');

  // Send history to new client
  if (messageHistory.length > 0) {
    ws.send(JSON.stringify({ type: 'history', payload: messageHistory }));
  }

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received:', data);

      if (data.type === 'message') {
        // Add timestamp and ID if missing (though frontend should provide some)
        const msg = {
            ...data.payload,
            id: data.payload.id || Date.now().toString(),
            timestamp: data.payload.timestamp || new Date().toISOString()
        };
        
        messageHistory.push(msg);
        
        // Broadcast
        const broadcastData = JSON.stringify({ type: 'message', payload: msg });
        for (const client of clients) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(broadcastData);
          }
        }
      }
    } catch (e) {
      console.error('Error processing message:', e);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected');
  });
});
