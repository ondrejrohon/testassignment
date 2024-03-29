import * as net from "net";
import {
  MessageType,
  createMessage,
  createRandomId,
  parseMessage,
} from "./protocol";

const server = net.createServer();
const clients: { [id: string]: net.Socket } = {};

const PORT = 8000;
const ANSWER = "pass";

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

server.on("connection", (socket) => {
  console.log("Client connected");

  // when clients connects, ask for password
  const buffer = createMessage(
    0,
    0,
    MessageType.Hello,
    Buffer.from("Whozdat?")
  );
  socket.write(buffer);

  socket.on("data", (data) => {
    const msg = parseMessage(data);
    console.log(
      `Received message: ${msg.content} from client: ${msg.senderId}`
    );

    // is authorizing
    if (msg.content === ANSWER) {
      // create id and store it
      const id = createRandomId();
      const response = createMessage(id, 0, MessageType.Authenticate, null);
      socket.write(response);
      return;
      // } else if (!clientId) {
      //   // is not authorized and answered wrong
      //   const response = createMessage("", "Wrong answer");
      //   socket.write(Buffer.concat([response.header, response.payload]));
      //   socket.end();
    } else if (msg.messageId === MessageType.ListOpponents) {
      // list clients
      const clientIds = Object.keys(clients).join(",");
      const buffer = createMessage(
        0,
        0,
        MessageType.ListOpponents,
        Buffer.from(clientIds)
      );
      socket.write(buffer);
    } else if (msg.messageId === MessageType.MatchRequest) {
      const opponentId = msg.senderId;
      console.log("start match with", opponentId);

      if (clients[opponentId]) {
        // TODO: get my id here
        const buffer = createMessage(
          opponentId,
          1,
          MessageType.MatchRequest,
          null
        );
        clients[opponentId].write(buffer);
      } else {
        console.log("client id not found", opponentId);
      }
    }
  });
});
