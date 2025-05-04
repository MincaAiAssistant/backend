export interface Message {
  sessionId: string;
  content: string;
  createdDate: string; // ISO date string
}

export interface SessionSummary {
  sessionId: string;
  lastMessage: string;
  lastTimestamp: string;
  totalMessages: number;
}

export interface RawMessage {
  id: string;
  role: string;
  content: string;
  fileUploads: any;
  createdDate: string;
  sessionId: string;
  [key: string]: any;
}

export interface TransformedMessage {
  id: string;
  role: 'user' | 'assistant';
  files: any;
  time: string;
  sessionId: string;
}

export function transformSessions(data: Message[]): SessionSummary[] {
  const sessionMap: Record<string, SessionSummary> = {};

  data.forEach((msg) => {
    const sessionId = msg.sessionId;
    if (!sessionMap[sessionId]) {
      sessionMap[sessionId] = {
        sessionId,
        lastMessage: msg.content,
        lastTimestamp: msg.createdDate,
        totalMessages: 1,
      };
    } else {
      sessionMap[sessionId].totalMessages += 1;

      if (
        new Date(msg.createdDate) >
        new Date(sessionMap[sessionId].lastTimestamp)
      ) {
        sessionMap[sessionId].lastMessage = msg.content;
        sessionMap[sessionId].lastTimestamp = msg.createdDate;
      }
    }
  });

  return Object.values(sessionMap);
}

export function transformMessages(
  messages: RawMessage[],
  sessionId: string
): TransformedMessage[] {
  return messages
    .filter((msg) => msg.sessionId === sessionId)
    .map((msg) => ({
      id: msg.id,
      role: msg.role === 'userMessage' ? 'user' : 'assistant',
      files: msg.fileUploads,
      time: msg.createdDate,
      sessionId: msg.sessionId,
      content: msg.content,
    }));
}
