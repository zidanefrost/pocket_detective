import type { IncomingMessage, ServerResponse } from "node:http";

import {
  generateQuest,
  normalizePublicError,
  parseImageDataUrl,
} from "../src/server/roomQuest";

interface VercelRequest extends IncomingMessage {
  body?: unknown;
}

interface VercelResponse extends ServerResponse {
  status(statusCode: number): VercelResponse;
  json(body: unknown): void;
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
): Promise<void> {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ error: "Method not allowed." });
    return;
  }

  try {
    const body =
      typeof request.body === "object" && request.body !== null
        ? (request.body as Record<string, unknown>)
        : {};
    const image = parseImageDataUrl(body.image);
    const quest = await generateQuest(image);
    response.status(200).json({ success: true, data: quest });
  } catch (error) {
    const publicError = normalizePublicError(error);
    console.error("RoomQuest analyze-room request failed", {
      statusCode: publicError.statusCode,
      errorType:
        publicError.cause instanceof Error
          ? publicError.cause.name
          : publicError.name,
    });
    response
      .status(publicError.statusCode)
      .json({ error: publicError.publicMessage });
  }
}
