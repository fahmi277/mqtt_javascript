import aedes from 'aedes';
import net from 'net';
import websocket from 'websocket-stream';

const broker = aedes();

// Create a TCP server
const server = net.createServer(broker.handle);
server.listen(1883, () => {
  console.log('MQTT broker is running on port 1883');
});

// Create a WebSocket server
const wss = websocket.createServer({ server: server }, broker.handle);
wss.on('listening', () => {
  console.log('MQTT over WebSocket is running on port 1883');
});

broker.on('publish', (packet, client) => {
    console.log('Message received from', client && client.id, ':', packet.topic, ':', packet.payload.toString());
  });
