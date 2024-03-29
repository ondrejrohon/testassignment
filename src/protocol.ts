// custom binary protocol message
export type Message = {
  header: Buffer; // contains payload length (2 bytes), recipientId (1 byte), senderId (1 byte), messageId (1 byte)
  payload: Buffer; // content
};

export type ParsedMessage = {
  recipientId: number;
  senderId: number;
  messageId: number;
  content: string;
};

export enum MessageType {
  Hello,
  Authenticate,
  ListOpponents,
  MatchRequest,
  RejectMatch,
  Guess,
  Hint,
  GiveUp,
  Win,
  Error,
}

// creates random UInt8 ID, 0 is reserved for messages for server only
export const createRandomId = () => Math.floor(Math.random() * 254) + 1;

const validateUInt8 = (value: number, name: string) => {
  if (value > 255) throw new Error(`${name} is too large`);
};

export function createMessage(
  recipientId: number,
  senderId: number,
  messageId: number,
  payload: Buffer | null = null
): Buffer {
  const header = Buffer.alloc(5);

  validateUInt8(recipientId, "recipientId");
  validateUInt8(senderId, "senderId");
  validateUInt8(messageId, "messageId");

  header.writeUInt16BE(payload?.length || 0, 0);
  header.writeUint8(recipientId, 2);
  header.writeUint8(senderId, 3);
  header.writeUint8(messageId, 4);

  if (payload) {
    return Buffer.concat([header, payload]);
  }
  return header;
}

export function parseMessage(data: Buffer): ParsedMessage {
  const payloadSize = data.readUInt16BE(0);
  const recipientId = data.readUint8(2);
  const senderId = data.readUint8(3);
  const messageId = data.readUint8(4);
  const content = data.slice(5, 5 + payloadSize).toString();

  return { recipientId, senderId, messageId, content };
}
