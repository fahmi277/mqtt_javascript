import mqtt from "mqtt";
import { Sequelize, DataTypes } from "sequelize";

// MQTT broker URL and credentials
const brokerUrl = "7aca494c8dd94003b59fed341eed26d3.s2.eu.hivemq.cloud";
const mqttUsername = "mqttsangengon";
const mqttPassword = "mqttpassword123!!";

// MySQL database configuration
const databaseConfig = {
  database: "mqtt",
  username: "root",
  password: "",
  host: "localhost",
  dialect: "mysql",
};

// Sequelize initialization
const sequelize = new Sequelize(
  databaseConfig.database,
  databaseConfig.username,
  databaseConfig.password,
  {
    host: databaseConfig.host,
    dialect: databaseConfig.dialect,
  }
);

// Define the FailedPublish model
const FailedPublish = sequelize.define("FailedPublish", {
  topic: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});
// Create the table if it doesn't exist
FailedPublish.sync().then(() => {
  console.log("FailedPublish table created");
});

const options = {
  host: "",
  port: 8883,
  protocol: "",
  username: "",
  password: "",
};

// Create the MQTT client instance
const client = mqtt.connect(options);
let messaage_update = "";

// Setup the MQTT callbacks
client.on("connect", () => {
  console.log("Connected to MQTT broker");

  // Subscribe to the topic
  client.subscribe("my/test/topic", (err) => {
    if (err) {
      console.error("Failed to subscribe to topic", err);
    } else {
      console.log("Subscribed to topic");
    }
  });

  // Push failed data to MQTT upon connection reestablishment
  pushFailedDataToMQTT();
});

client.on("message", (topic, message) => {
  console.log("Received message:", topic, message.toString());
});

client.on("error", (err) => {
  console.error("MQTT error:", err);
  FailedPublish.create({
    topic: "my/test/topic",
    message: messaage_update,
  })
    .then(() => {
      console.log("Failed publish data stored in MySQL");
    })
    .catch((error) => {
      console.error("Failed to store failed publish data:", error);
    });
});

// Publishing interval
setInterval(() => {
  const currentTime = new Date();
  const timenow = currentTime.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const message = `messagev ${timenow}`;
  messaage_update = message;

  // Publish message to topic 'my/test/topic'
  try {
     client.publish("my/test/topicsang", message, (err) => {
      console.log("publish success : ", message);
      pushFailedDataToMQTT();
    });
  } catch (error) {
    console.error("Failed to publish message:", err);

    // Store failed publish data into MySQL using Sequelize
  }
}, 5000); // 5 seconds interval

// Function to push failed data to MQTT
async function pushFailedDataToMQTT() {
  try {
    const failedData = await FailedPublish.findAll();
    for (const data of failedData) {
      client.publish(data.topic, data.message, (err) => {
        if (err) {
          console.error("Failed to publish failed data:", err);
        } else {
          console.log(
            "Successfully published failed data:",
            data.topic,
            data.message
          );
          data.destroy(); // Remove the successfully published data from the database
        }
      });
    }
  } catch (error) {
    console.error("Failed to fetch failed publish data from MySQL:", error);
  }
}
