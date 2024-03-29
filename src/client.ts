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
  // console.log(
  //   `Received message: ${msg.content} from clientId: ${msg.senderId}`
  // );

  // answer question
  if (msg.messageId === MessageType.Hello) {
    const answer = await getInput(`${msg.content}\n`);
    const payload = Buffer.from(answer);
    const buffer = createMessage(0, 0, MessageType.Authenticate, payload);
    client.write(buffer);
    return;
  }

  if (msg.messageId === MessageType.Authenticate) {
    // server responded with client_id, store it
    myId = msg.recipientId;
    console.log("got client id", myId);

    // get list of opponents
    const buffer = createMessage(0, myId, MessageType.ListOpponents, null);
    client.write(buffer);
    return;
  }

  // list opponents
  if (msg.messageId === MessageType.ListOpponents) {
    if (!myId) {
      throw new Error("not authenticated");
    }

    if (msg.content) {
      console.log("got list of client ids:", msg.content);
      const list = msg.content.split(", ");
      const opponentId = await getInput(
        "\n type match client_id to start a match:"
      );
      // validate
      if (list.includes(opponentId)) {
        const word = await getInput("\nWord to guess?\n");
        const buffer = createMessage(
          parseInt(opponentId, 10),
          myId,
          MessageType.MatchRequest,
          Buffer.from(word)
        );
        client.write(buffer);
      } else {
        console.log(`this client id doesn't exist`);
      }
    } else {
      console.log("waiting for other players");
    }

    return;
  }

  if (msg.messageId === MessageType.Error) {
    console.log(msg.content);
  }

  // get notified of new match
  if (msg.messageId === MessageType.MatchRequest) {
    if (!myId) {
      throw new Error("not authenticated");
    }

    const opponentId = msg.senderId;
    const res = await getInput(
      `\nnew match request from ${opponentId}, accept? (y/n)`
    );
    if (res === "y") {
      const answer = await getInput(`\nAttempt #${1} Guess?\n`);
      const buffer = createMessage(
        opponentId,
        myId,
        MessageType.Guess,
        Buffer.from(answer)
      );
      client.write(buffer);
    } else {
      const buffer = createMessage(
        opponentId,
        myId,
        MessageType.RejectMatch,
        null
      );
      client.write(buffer);
    }
  }

  // opponent rejected match
  if (msg.messageId === MessageType.RejectMatch) {
    console.log("Match was rejected by oponnent.\n");

    if (!myId) {
      throw new Error("not authenticated");
    }

    // get list of opponents
    const buffer = createMessage(0, myId, MessageType.ListOpponents, null);
    client.write(buffer);
    return;
  }

  if (msg.messageId === MessageType.Guess) {
    if (!myId) {
      throw new Error("not authenticated");
    }
    const [attempt, word] = msg.content.split(",");
    console.log(`Oponnent's guess #${attempt} is: ${word}`);
  }

  if (msg.messageId === MessageType.IncorrectGuess) {
    if (!myId) {
      throw new Error("not authenticated");
    }
    console.log("\nIncorrect guess");
    const answer = await getInput(
      `\nAttempt #${parseInt(msg.content, 10) + 1} Guess?\n`
    );
    const buffer = createMessage(
      msg.senderId,
      myId,
      MessageType.Guess,
      Buffer.from(answer)
    );
    client.write(buffer);
  }

  if (msg.messageId === MessageType.Win) {
    if (!myId) {
      throw new Error("not authenticated");
    }

    console.log(`\nGuesser won in ${parseInt(msg.content, 10) + 1} attempts.`);
    // get list of opponents
    const buffer = createMessage(0, myId, MessageType.ListOpponents, null);
    client.write(buffer);
  }
});
