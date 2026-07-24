import {
  normalizeTtsError,
  synthesizeSpeech,
  TtsPublicError,
} from "../src/server/tts.js";

async function parseRequestText(request: Request): Promise<unknown> {
  try {
    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      throw new TtsPublicError(400, "The request body must be a JSON object.");
    }
    return (body as Record<string, unknown>).text;
  } catch (error) {
    if (error instanceof TtsPublicError) {
      throw error;
    }
    throw new TtsPublicError(400, "The request body is not valid JSON.", {
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
      const text = await parseRequestText(request);
      const speech = await synthesizeSpeech(text);
      return new Response(new Blob([speech.audio], { type: speech.contentType }), {
        headers: {
          "Cache-Control": "private, no-store",
          "Content-Type": speech.contentType,
        },
      });
    } catch (error) {
      const publicError = normalizeTtsError(error);
      console.error("RoomQuest TTS request failed", {
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
