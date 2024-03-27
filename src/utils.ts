interface Message {
  header: Buffer;
  payload: Buffer;
}

export function createMessage(clientId: string, message: string): Message {
  const header = Buffer.alloc(2);
  const payload = Buffer.from(JSON.stringify({ clientId, message }));
  header.writeUInt16BE(payload.length, 0);
  return { header, payload };
}

export function parseMessage(data: Buffer): Message {
  const header = data.slice(0, 2);
  const payloadSize = header.readUInt16BE(0);
  const payload = data.slice(2, 2 + payloadSize);
  return { header, payload };
}
