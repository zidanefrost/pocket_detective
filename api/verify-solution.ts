import type { IncomingMessage, ServerResponse } from "node:http";

import {
  normalizePublicError,
  parseImageDataUrl,
  PublicError,
  verifySolution,
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
    if (typeof body.target_object_name !== "string") {
      throw new PublicError(400, "A target object is required.");
    }

    const image = parseImageDataUrl(body.image);
    const result = await verifySolution(image, body.target_object_name);
    sendJson(response, 200, { success: true, data: result });
  } catch (error) {
    const publicError = normalizePublicError(error);
    console.error("RoomQuest verify-solution request failed", {
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
