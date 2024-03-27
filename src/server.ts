import * as net from "net";
import { createMessage, parseMessage } from "./utils";
import { ANSWER, CLIENT_ID, QUESTION } from "./constants";
import { MessageType } from "./types";

const server = net.createServer();
const clients: { [id: string]: net.Socket } = {};
const PORT = 8000;

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

server.on("connection", (socket) => {
  console.log("Client connected");

  const message = createMessage("", QUESTION);
  socket.write(Buffer.concat([message.header, message.payload]));

  socket.on("data", (data) => {
    const msg = parseMessage(data);
    const { clientId, message } = JSON.parse(msg.payload.toString());
    console.log(`Received message: ${message} from client: ${clientId}`);

    // is authorizing
    if (message === ANSWER) {
      // create id and store it
      const id = Math.random().toString(36).substring(2);
      clients[id] = socket;
      const response = createMessage(id, CLIENT_ID);
      socket.write(Buffer.concat([response.header, response.payload]));
      return;
    } else if (!clientId) {
      // is not authorized and answered wrong
      const response = createMessage("", "Wrong answer");
      socket.write(Buffer.concat([response.header, response.payload]));
      socket.end();
    } else if (message === MessageType.ListClients) {
      // list clients
      const response = createMessage(
        "",
        `${MessageType.ListClients}:${Object.keys(clients).join(",")}`
      );
      socket.write(Buffer.concat([response.header, response.payload]));
    } else if (message.startsWith(MessageType.StartMatch)) {
      const clientId = message.replace(`${MessageType.StartMatch}:`, "");
      console.log("start match with", clientId);
    } else {
      // is authorized
      console.log("got safe message", message);
    }
  });
});
