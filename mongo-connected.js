import { MongoClient } from 'mongodb';

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'mydatabase';

// Use async/await for asynchronous operations
async function main() {
  // Use the MongoClient to connect to the MongoDB server
  const client = await MongoClient.connect(url, { useUnifiedTopology: true });

  try {
    console.log('Connected to the database');

    // Access the database
    const db = client.db(dbName);

    // Access a collection
    const collection = db.collection('mycollection');

    // Insert a document
    const document = { name: 'John Doe', age: 30 };
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

// Call the main function
main().catch(console.error);
