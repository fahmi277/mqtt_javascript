import mqtt from "mqtt";

const options = {
  host: "7aca494c8dd94003b59fed341eed26d3.s2.eu.hivemq.cloud",
  port: 8883,
  protocol: "mqtts",
  username: "mqttsangengon",
  password: "mqttpassword123!!",
};

// initialize the MQTT client
const client = mqtt.connect(options);

// setup the callbacks
client.on("connect", () => {
  console.log("Connected");
  // Start publishing interval
  setInterval(() => {
    const currentTime = new Date();
    const timenow = currentTime.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const message = `messagev ${timenow}`;

    // publish message to topic 'my/test/topic'
    client.publish("my/test/topicsang", message);
  }, 5000); // 5 seconds interval
});

client.on("error", (error) => {
  console.log(error);
});

client.on("message", (topic, message) => {
  // called each time a message is received
  console.log("Received message:", topic, message.toString());
});

// subscribe to topic 'my/test/topic'
client.subscribe("my/test/topic");

// publish message 'Hello' to topic 'my/test/topic'
// client.publish('my/test/topicsang', 'Hello');
