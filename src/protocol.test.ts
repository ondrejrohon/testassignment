import { expect, test } from "vitest";
import { createMessage, parseMessage } from "./protocol";

test("create and parse message", () => {
  const recipientId = 250;
  const senderId = 251;
  const messageId = 252;
  const content = Buffer.from("some content");

  const msg = createMessage(recipientId, senderId, messageId, content);
  const res = parseMessage(msg);

  expect(res.recipientId).toBe(250);
  expect(res.senderId).toBe(251);
  expect(res.messageId).toBe(252);
  expect(res.content).toBe("some content");
});
