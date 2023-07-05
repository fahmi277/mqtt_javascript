import aedes from 'aedes';
import net from 'net';
import websocket from 'websocket-stream';

const broker = aedes();

// Authenticate clients
broker.authenticate = (client, username, password, callback) => {
  // Implement your authentication logic here
  // Check username and password against your user database or any other method

  const isValid = checkCredentials(username, password); // Implement your authentication logic here

  if (isValid) {
    client.user = username; // Attach the authenticated username to the client object
  }

  callback(null, isValid);
};

// Authorize client subscriptions
broker.authorizeSubscribe = (client, subscription, callback) => {
  // Implement your authorization logic here
  // Check if the client is authorized to subscribe to the given topic

  const isAuthorized = checkAuthorization(client.user, subscription.topic); // Implement your authorization logic here

  callback(null, isAuthorized);
};

// Authorize client publishing
broker.authorizePublish = (client, packet, callback) => {
  // Implement your authorization logic here
  // Check if the client is authorized to publish to the given topic

  const isAuthorized = checkAuthorization(client.user, packet.topic); // Implement your authorization logic here

  callback(null, isAuthorized);
};

// Create a TCP server
const server = net.createServer(broker.handle);
server.listen(1883, () => {
  const address = server.address();
  console.log('MQTT broker is running on', address.address + ':' + address.port);
});

// Create a WebSocket server
const wss = websocket.createServer({ server: server }, broker.handle);
wss.on('listening', () => {
  const address = server.address();
  console.log('MQTT over WebSocket is running on', address.address + ':' + address.port);
});

// Listen for connection events
broker.on('client', client => {
  console.log('Client connected:', client.id, 'from', getClientIP(client));
});

// Listen for published messages
broker.on('publish', (packet, client) => {
  console.log('Message received from', client && client.id, 'from', getClientIP(client), ':', packet.topic, ':', packet.payload.toString());
});

function checkCredentials(username, password) {
  // Implement your own authentication logic here
  // Return true if the username and password are valid, otherwise return false
  // You may check against a user database, credentials file, or any other method
  // For simplicity, this example considers 'admin' as the valid username with any non-empty password
  return username === 'admin' && password !== '';
}

function checkAuthorization(username, topic) {
  // Implement your own authorization logic here
  // Return true if the user is authorized to access the given topic, otherwise return false
  // You may check against user roles, permissions, or any other method
  // For simplicity, this example considers all users authorized to access any topic
  return true;
}

function getClientIP(client) {
  // Extract the client's IP address from the connection object
  const { socket } = client;
  const { remoteAddress, remoteFamily } = socket;
  return `${remoteAddress}:${remoteFamily}`;
}
