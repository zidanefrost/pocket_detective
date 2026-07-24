import type { QuestData, VerificationResult } from "../types";

const CLIENT_TIMEOUT_MS = 70_000;

interface ApiEnvelope<T> {
  success: true;
  data: T;
}

interface ApiErrorEnvelope {
  error?: string;
}

export class RoomQuestApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RoomQuestApiError";
  }
}

async function postJson<T>(
  path: string,
  body: Record<string, unknown>,
): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);

  try {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    let payload: ApiEnvelope<T> | ApiErrorEnvelope;
    try {
      payload = (await response.json()) as ApiEnvelope<T> | ApiErrorEnvelope;
    } catch {
      throw new RoomQuestApiError(
        "The RoomQuest server returned an unreadable response.",
      );
    }

    if (!response.ok) {
      const message =
        "error" in payload && typeof payload.error === "string"
          ? payload.error
          : "The RoomQuest request failed.";
      throw new RoomQuestApiError(message);
    }

    if (!("success" in payload) || payload.success !== true || !("data" in payload)) {
      throw new RoomQuestApiError(
        "The RoomQuest server returned an incomplete response.",
      );
    }
    return payload.data;
  } catch (error) {
    if (error instanceof RoomQuestApiError) {
      throw error;
    }
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new RoomQuestApiError(
        "The request timed out. Check your connection and try again.",
      );
    }
    throw new RoomQuestApiError(
      "Could not reach the RoomQuest server. Check your connection and retry.",
    );
  } finally {
    window.clearTimeout(timeout);
  }
}

export function generateQuest(roomImages: string | string[]): Promise<QuestData> {
  const images = Array.isArray(roomImages) ? roomImages : [roomImages];
  return postJson<QuestData>("/api/analyze-room", { images });
}

export function verifySolution(
  solutionImage: string,
  targetObjectName: string,
): Promise<VerificationResult> {
  return postJson<VerificationResult>("/api/verify-solution", {
    image: solutionImage,
    target_object_name: targetObjectName,
  });
}
