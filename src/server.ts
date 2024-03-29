import * as net from "net";
import {
  MessageType,
  createMessage,
  createRandomId,
  parseMessage,
} from "./protocol";

const server = net.createServer();
const clients: { [id: string]: net.Socket } = {};
const matches: { [guesser: string]: { word: string; attempts: number } } = {};

const PORT = 8000;
const ANSWER = "pass";

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

server.on("connection", (socket) => {
  let clientId: number | null;

  console.log("Client connected");

  // when clients connects, ask for password
  const buffer = createMessage(
    0,
    0,
    MessageType.Hello,
    Buffer.from("Whozdat?")
  );
  socket.write(buffer);

  socket.on("close", () => {
    if (clientId) {
      console.log("client closed", clientId);
      delete clients[clientId];
    }
  });

  socket.on("data", (data) => {
    const msg = parseMessage(data);
    console.log(
      `Received message: ${msg.content} from client: ${msg.senderId}`
    );

    // is authorizing, correct answer
    if (msg.messageId === MessageType.Authenticate && msg.content === ANSWER) {
      // create id and store it
      const id = createRandomId();
      clientId = id;
      clients[id] = socket;
      const response = createMessage(id, 0, MessageType.Authenticate, null);
      socket.write(response);
      return;
    }

    // authorizing, wrong answer
    if (msg.messageId === MessageType.Authenticate && msg.content !== ANSWER) {
      const buffer = createMessage(0, 1, MessageType.Error, Buffer.from("bye"));
      socket.write(buffer);
      socket.end();
    }

    // list opponents
    if (msg.messageId === MessageType.ListOpponents) {
      // list clients
      const clientIds = Object.keys(clients)
        .filter((id) => parseInt(id, 10) !== msg.senderId)
        .join(", ");

      const buffer = createMessage(
        0,
        0,
        MessageType.ListOpponents,
        Buffer.from(clientIds)
      );

      socket.write(buffer);
    }

    // match request
    if (msg.messageId === MessageType.MatchRequest) {
      const opponentId = msg.recipientId;
      console.log("start match with", opponentId);

      if (clients[opponentId]) {
        const buffer = createMessage(
          opponentId,
          msg.senderId,
          MessageType.MatchRequest,
          Buffer.from(msg.content)
        );
        clients[opponentId].write(buffer);
        matches[opponentId] = {
          word: msg.content,
          attempts: 0,
        };
      } else {
        // TODO: send error to client
        console.log("client id not found", opponentId);
      }
    }

    // guess
    if (msg.messageId === MessageType.Guess) {
      // Guess means that player accepted request and started guessing
      const opponentId = msg.senderId;
      const match = matches[opponentId];
      if (msg.content === match.word) {
        // inform guesser
        const buffer = createMessage(
          1,
          msg.recipientId,
          MessageType.Win,
          Buffer.from(String(match.attempts))
        );
        clients[msg.recipientId].write(buffer);
        // inform asker
        const bufferAsker = createMessage(
          1,
          msg.senderId,
          MessageType.Win,
          Buffer.from(String(match.attempts))
        );
        clients[msg.senderId].write(bufferAsker);
        delete matches[msg.senderId];
      } else {
        // increment attempts
        match.attempts++;
        const content = Buffer.from(`${match.attempts},${msg.content}`);
        const buffer = createMessage(
          msg.recipientId,
          msg.senderId,
          MessageType.Guess,
          content
        );
        clients[msg.recipientId].write(buffer);
        // inform guesser of incorrect answer
        const feedback = createMessage(
          msg.senderId,
          msg.recipientId,
          MessageType.IncorrectGuess,
          Buffer.from(String(match.attempts))
        );
        clients[msg.senderId].write(feedback);
      }
    }

    // reject
    if (msg.messageId === MessageType.RejectMatch) {
      // delete match
      delete matches[msg.senderId];
      // inform oponent
      const buffer = createMessage(
        msg.recipientId,
        msg.senderId,
        MessageType.RejectMatch,
        null
      );
      clients[msg.recipientId].write(buffer);
    }

    if (msg.messageId === MessageType.GiveUp) {
      // delete match
      delete matches[msg.senderId];
      // inform oponent
      const buffer = createMessage(
        msg.recipientId,
        msg.senderId,
        MessageType.GiveUp,
        null
      );
      clients[msg.recipientId].write(buffer);
    }
  });
});
