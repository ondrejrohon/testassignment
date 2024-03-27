import * as net from "net";
import { createMessage, parseMessage } from "./utils";

const server = net.createServer();
const PORT = 8000;

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

server.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("data", (data) => {
    const message = parseMessage(data);
    console.log(`Received message: ${message.payload.toString()}`);
    // Respond to the client
    const response = createMessage(Buffer.from("Hello from server!"));
    socket.write(Buffer.concat([response.header, response.payload]));
  });
});
