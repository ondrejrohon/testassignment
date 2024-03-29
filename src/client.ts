import * as net from "net";
import { MessageType, createMessage, parseMessage } from "./protocol";
import { getInput } from "./input";

const client = net.createConnection({ port: 8000, host: "localhost" });
let myId: number | null = null;

client.on("connect", () => {
  console.log("Connected to server");
});

client.on("data", async (data) => {
  const msg = parseMessage(data);
  console.log(
    `Received message: ${msg.content} from clientId: ${msg.senderId}`
  );

  // receive clientId
  if (msg.messageId === MessageType.Hello) {
    // server responded with client_id, store it
    myId = parseInt(msg.content, 10);
    console.log("got client id", myId);

    // get list of clients ids
    const buffer = createMessage(0, myId, MessageType.ListOpponents, null);
    client.write(buffer);
  }

  // answer question
  if (msg.messageId === MessageType.Authenticate) {
    if (!myId) {
      throw new Error("client has no id");
    }

    const answer = await getInput("Whozdat?\n");
    const payload = Buffer.from(answer);
    const buffer = createMessage(0, myId, MessageType.Authenticate, payload);
    client.write(buffer);
  }

  // list opponents
  if ((msg.messageId = MessageType.ListOpponents)) {
    if (!myId) {
      throw new Error("client has no id");
    }

    const list = msg.content.split(",");
    console.log(
      "got list of client ids:",
      list.filter((item: string) => parseInt(item, 10) !== myId).join(", ")
    );

    const opponentId = await getInput(
      "\n type match client_id to start a match:"
    );

    // validate
    if (list.includes(opponentId)) {
      const buffer = createMessage(
        parseInt(opponentId, 10),
        myId,
        MessageType.MatchRequest,
        null
      );
      client.write(buffer);
    } else {
      console.log(`this client id doesn't exist`);
    }
  }

  // get notified of new match
  if ((msg.messageId = MessageType.MatchRequest)) {
    const opponentId = msg.senderId;
    console.log("new match request from", opponentId);
  }
});
