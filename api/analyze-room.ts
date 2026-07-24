import type { IncomingMessage, ServerResponse } from "node:http";

import {
  generateQuest,
  normalizePublicError,
  parseImageDataUrl,
} from "../src/server/roomQuest";

interface VercelRequest extends IncomingMessage {
  body?: unknown;
}

function sendJson(
  response: ServerResponse,
  statusCode: number,
  body: unknown,
): void {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(body));
}

export default async function handler(
  request: VercelRequest,
  response: ServerResponse,
): Promise<void> {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    sendJson(response, 405, { error: "Method not allowed." });
    return;
  }

  try {
    const body =
      typeof request.body === "object" && request.body !== null
        ? (request.body as Record<string, unknown>)
        : {};
    const image = parseImageDataUrl(body.image);
    const quest = await generateQuest(image);
    sendJson(response, 200, { success: true, data: quest });
  } catch (error) {
    const publicError = normalizePublicError(error);
    console.error("RoomQuest analyze-room request failed", {
      statusCode: publicError.statusCode,
      errorType:
        publicError.cause instanceof Error
          ? publicError.cause.name
          : publicError.name,
    });
    sendJson(response, publicError.statusCode, {
      error: publicError.publicMessage,
    });
  }
}
