import * as net from "net";
import { createMessage, parseMessage } from "./utils";

const client = net.createConnection({ port: 8000, host: "localhost" });

client.on("connect", () => {
  console.log("Connected to server");
  // Send a message to the server
  const message = createMessage(Buffer.from("Hello from client!"));
  client.write(Buffer.concat([message.header, message.payload]));
});

client.on("data", (data) => {
  const message = parseMessage(data);
  console.log(`Received message: ${message.payload.toString()}`);
});
