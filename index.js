import aedes from 'aedes';
import net from 'net';
import websocket from 'websocket-stream';
import mongoPersistence from 'aedes-persistence-mongodb';
import { MongoClient } from 'mongodb';

// MongoDB configuration
// const url = 'mongodb://localhost:27017';
const url = 'mongodb+srv://fahmi277:Nganjuk27@cluster0.ngde1.mongodb.net/';
const dbName = 'mqttBroker';

// Create a MongoDB client

async function main(pushData) {
  // Use the MongoClient to connect to the MongoDB server
  const client = await MongoClient.connect(url, { useUnifiedTopology: true });

  try {
    console.log('Connected to the database');

    // Access the database
    const db = client.db(dbName);

    // Access a collection
    const collection = db.collection('mycollection');

    // Insert a document
    const document = pushData;
    const result = await collection.insertOne(document);
    console.log('Inserted document:', result.insertedId);

    // Find documents
    const query = { age: { $gte: 25 } };
    const cursor = collection.find(query);

    // Iterate over the cursor
    await cursor.forEach((doc) => {
      console.log('Found document:', doc);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    client.close();
    console.log('Disconnected from the database');
  }
}


  // Create the MQTT broker with persistence
  const broker = aedes();

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
    console.log('Client connected:', client.id);
  });

  // Listen for published messages
  broker.on('publish', async (packet, client) => {
    const data = packet.payload.toString();;
    console.log(packet.payload.toString());
    // console.log(data);

    try {
      const jsonObject = JSON.parse(data);
      await main(jsonObject).catch(console.error);
      
    } catch (error) {
      
    }

   
      

    // if (packet.payload) {
    //   try {
    //     const payload = JSON.parse(packet.payload.toString());
  
    //     if (payload._terminalTime) {
    //       const data = {
    //         terminal_time: payload._terminalTime,
    //         topic: packet.topic
    //       };
  
    //       await main(data);
    //     } else {
    //       console.error('Missing _terminalTime property in payload:', payload);
    //     }
    //   } catch (error) {
    //     console.error('Error parsing payload as JSON:', error);
    //   }
    // }
  });

