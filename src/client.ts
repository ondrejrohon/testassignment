import * as net from "net";
import { createMessage, parseMessage } from "./utils";
import { ANSWER, CLIENT_ID, QUESTION } from "./constants";
import { getInput } from "./input";

const client = net.createConnection({ port: 8000, host: "localhost" });
let id = "";

client.on("connect", () => {
  console.log("Connected to server");
});

client.on("data", async (data) => {
  const msg = parseMessage(data);
  const { clientId, message } = JSON.parse(msg.payload.toString());
  console.log(`Received message: ${message} from client: ${clientId}`);

  if (message === CLIENT_ID) {
    // server responded with client_id, store it
    id = clientId;
    console.log("got client id", id);

    const message = createMessage(id, "test");
    client.write(Buffer.concat([message.header, message.payload]));
  }

  if (message === QUESTION) {
    const answer = await getInput("Whozdat?");
    const message = createMessage("", answer);
    client.write(Buffer.concat([message.header, message.payload]));
  }
});
