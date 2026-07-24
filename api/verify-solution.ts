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
    if (typeof body.target_object_name !== "string") {
      throw new PublicError(400, "A target object is required.");
    }

    const image = parseImageDataUrl(body.image);
    const result = await verifySolution(image, body.target_object_name);
    response.status(200).json({ success: true, data: result });
  } catch (error) {
    const publicError = normalizePublicError(error);
    console.error("RoomQuest verify-solution request failed", {
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
