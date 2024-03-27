import * as net from "net";
import { createMessage, parseMessage } from "./utils";
import { CLIENT_ID, QUESTION } from "./constants";
import { getInput } from "./input";
import { MessageType } from "./types";

const client = net.createConnection({ port: 8000, host: "localhost" });
let myId = "";

client.on("connect", () => {
  console.log("Connected to server");
});

client.on("data", async (data) => {
  const msg = parseMessage(data);
  const { clientId, message } = JSON.parse(msg.payload.toString());
  console.log(`Received message: ${message} from client: ${clientId}`);

  if (message === CLIENT_ID) {
    // server responded with client_id, store it
    myId = clientId;
    console.log("got client id", myId);

    // get list of clients ids
    const message = createMessage(myId, MessageType.ListClients);
    client.write(Buffer.concat([message.header, message.payload]));
  }

  if (message === QUESTION) {
    const answer = await getInput("Whozdat?\n");
    const message = createMessage("", answer);
    client.write(Buffer.concat([message.header, message.payload]));
  }

  if (message.startsWith(MessageType.ListClients)) {
    const list = message.replace(`${MessageType.ListClients}:`, "").split(",");
    console.log(
      "got list of client ids:",
      list.filter((item) => item !== myId).join(", ")
    );

    const clientId = await getInput(
      "\n type match client_id to start a match:"
    );

    // validate
    if (list.includes(clientId)) {
      const message = createMessage(
        myId,
        `${MessageType.StartMatch}:${clientId}`
      );
      client.write(Buffer.concat([message.header, message.payload]));
    } else {
      console.log(`this client id doesn't exist`);
    }
  }
});
