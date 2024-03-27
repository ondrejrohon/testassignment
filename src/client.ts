import * as net from "net";
import { createMessage, parseMessage } from "./utils";
import { ANSWER, QUESTION } from "./constants";

const client = net.createConnection({ port: 8000, host: "localhost" });

client.on("connect", () => {
  console.log("Connected to server");
});

client.on("data", (data) => {
  const message = parseMessage(data);
  const text = message.payload.toString();

  console.log(`Received message: ${text}`);

  if (text === QUESTION) {
    const message = createMessage(Buffer.from(ANSWER));
    client.write(Buffer.concat([message.header, message.payload]));
  }
});
