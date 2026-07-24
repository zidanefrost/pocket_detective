import {
  normalizePublicError,
  parseImageDataUrl,
  PublicError,
  verifySolution,
} from "../src/server/roomQuest.js";

async function parseRequestBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      throw new PublicError(400, "The request body must be a JSON object.");
    }
    return body as Record<string, unknown>;
  } catch (error) {
    if (error instanceof PublicError) {
      throw error;
    }
    throw new PublicError(400, "The request body is not valid JSON.", {
      cause: error,
    });
  }
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST") {
      return Response.json(
        { error: "Method not allowed." },
        { status: 405, headers: { Allow: "POST" } },
      );
    }

    try {
      const body = await parseRequestBody(request);
      if (typeof body.target_object_name !== "string") {
        throw new PublicError(400, "A target object is required.");
      }

      const image = parseImageDataUrl(body.image);
      const result = await verifySolution(image, body.target_object_name);
      return Response.json({ success: true, data: result });
    } catch (error) {
      const publicError = normalizePublicError(error);
      console.error("RoomQuest verify-solution request failed", {
        statusCode: publicError.statusCode,
        errorType:
          publicError.cause instanceof Error
            ? publicError.cause.name
            : publicError.name,
      });
      return Response.json(
        { error: publicError.publicMessage },
        { status: publicError.statusCode },
      );
    }
  },
};
