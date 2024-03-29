import { type Socket } from "node:net";
import { getInput } from "./input";
import { MessageType, createMessage } from "./protocol";

export const listOpponents = (client: Socket, myId: number) => {
  const buffer = createMessage(0, myId, MessageType.ListOpponents, null);
  client.write(buffer);
};

export const giveUp = (client: Socket, opponentId: number, myId: number) => {
  const buffer = createMessage(opponentId, myId, MessageType.GiveUp, null);
  client.write(buffer);
};

export const guess = async (
  client: Socket,
  opponentId: number,
  myId: number,
  attempt: number
): Promise<string> => {
  const answer = await getInput(
    `\nAttempt #${attempt} Guess? (press enter to give up)\n`,
    () => true
  );

  if (answer === "") {
    const giveup = await getInput("Give up? (y/n)\n");
    if (giveup === "y") {
      giveUp(client, opponentId, myId);
      return "";
    } else {
      return guess(client, opponentId, myId, attempt);
    }
  }

  return answer;
};
