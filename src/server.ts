import * as net from "net";
import { createMessage, parseMessage } from "./utils";
import { ANSWER, QUESTION } from "./constants";

const server = net.createServer();
const PORT = 8000;

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

server.on("connection", (socket) => {
  console.log("Client connected");

  const message = createMessage(Buffer.from(QUESTION));
  socket.write(Buffer.concat([message.header, message.payload]));

  socket.on("data", (data) => {
    const message = parseMessage(data);
    const text = message.payload.toString();
    console.log(`Received message: ${text}`);

    if (text === ANSWER) {
      // Respond to the client
      const response = createMessage(Buffer.from("Welcome!"));
      socket.write(Buffer.concat([response.header, response.payload]));
      return;
    } else {
      const response = createMessage(Buffer.from("Wrong answer"));
      socket.write(Buffer.concat([response.header, response.payload]));
      socket.end();
    }
  });
});
