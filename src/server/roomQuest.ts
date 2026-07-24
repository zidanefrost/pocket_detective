import { GoogleGenAI } from "@google/genai";

import type {
  ClueItem,
  QuestData,
  VerificationResult,
} from "../types";

const MODEL_NAME = process.env.GEMINI_MODEL?.trim() || "gemini-3.6-flash";
const REQUEST_TIMEOUT_MS = 60_000;

// A 3 MB binary image becomes roughly 4 MB after base64 encoding, leaving
// enough room below Vercel Functions' 4.5 MB request-body limit for JSON.
export const MAX_API_IMAGE_BYTES = 3 * 1024 * 1024;

const QUEST_SYSTEM_INSTRUCTION =
  "You are the AI Gamemaster for RoomQuest. Analyze the room photo, select 3 distinct physical objects visible in the image, and generate an opening storyline and 3 rhyming riddles in strict JSON.";

const QUEST_PROMPT = [
  "Build a three-stage physical escape-room quest from this room photo.",
  "Select exactly three distinct, clearly visible physical objects.",
  "Each target_object_name must be visually specific enough to verify in a close-up.",
  "Do not select people, body parts, reflections, screens, text, or mostly hidden objects.",
  "Use unique positive integer clue IDs.",
  "Each poetic_clue must contain 2 to 4 short rhyming lines separated by newlines.",
  "Keep the story playful, family-friendly, suspenseful, and concise.",
  "A storyline_continuation must celebrate its solved clue without revealing another answer.",
].join("\n");

const QUEST_RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  propertyOrdering: ["opening_narrative", "clues"],
  required: ["opening_narrative", "clues"],
  properties: {
    opening_narrative: {
      type: "string",
      description: "A suspenseful opening narrative grounded in the photographed room.",
    },
    clues: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        propertyOrdering: [
          "clue_id",
          "target_object_name",
          "poetic_clue",
          "storyline_continuation",
        ],
        required: [
          "clue_id",
          "target_object_name",
          "poetic_clue",
          "storyline_continuation",
        ],
        properties: {
          clue_id: {
            type: "integer",
            minimum: 1,
            description: "A unique positive clue identifier.",
          },
          target_object_name: {
            type: "string",
            description:
              "A specific visible object, such as a blue ceramic coffee mug.",
          },
          poetic_clue: {
            type: "string",
            description: "A two-to-four-line rhyming riddle.",
          },
          storyline_continuation: {
            type: "string",
            description: "Story text unlocked after this clue is solved.",
          },
        },
      },
    },
  },
};

const VERIFICATION_RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  propertyOrdering: ["is_correct", "detected_item", "feedback_message"],
  required: ["is_correct", "detected_item", "feedback_message"],
  properties: {
    is_correct: {
      type: "boolean",
      description:
        "Whether the submitted close-up clearly shows the specified target object.",
    },
    detected_item: {
      type: "string",
      description: "A concise name for the main object visible in the submission.",
    },
    feedback_message: {
      type: "string",
      description:
        "Fun encouragement when correct, or a gentle non-spoiler hint when incorrect.",
    },
  },
};

export class PublicError extends Error {
  constructor(
    readonly statusCode: number,
    readonly publicMessage: string,
    options?: ErrorOptions,
  ) {
    super(publicMessage, options);
    this.name = "PublicError";
  }
}

export interface ParsedImage {
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  data: string;
}

let genAIClient: GoogleGenAI | undefined;

function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new PublicError(
      503,
      "RoomQuest is not configured yet. Add GEMINI_API_KEY to the server environment.",
    );
  }

  genAIClient ??= new GoogleGenAI({
    apiKey,
    httpOptions: {
      timeout: REQUEST_TIMEOUT_MS,
      retryOptions: { attempts: 3 },
    },
  });
  return genAIClient;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredText(
  record: Record<string, unknown>,
  key: string,
  maxLength: number,
): string {
  const value = record[key];
  if (typeof value !== "string") {
    throw new PublicError(502, "Gemini returned an invalid structured response.");
  }
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) {
    throw new PublicError(502, "Gemini returned an invalid structured response.");
  }
  return normalized;
}

export function parseImageDataUrl(value: unknown): ParsedImage {
  if (typeof value !== "string") {
    throw new PublicError(400, "An image is required.");
  }

  const match = value.match(
    /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/i,
  );
  if (!match) {
    throw new PublicError(
      400,
      "Use a valid JPEG, PNG, or WebP image from the camera or file picker.",
    );
  }

  const mimeType = match[1].toLowerCase() as ParsedImage["mimeType"];
  const data = match[2].replace(/\s/g, "");
  if (!data || data.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(data)) {
    throw new PublicError(400, "The submitted image data is malformed.");
  }

  const decodedBytes = Buffer.byteLength(data, "base64");
  if (decodedBytes <= 0 || decodedBytes > MAX_API_IMAGE_BYTES) {
    throw new PublicError(
      413,
      "The processed image is too large. Choose a smaller image and retry.",
    );
  }
  return { mimeType, data };
}

export function parseQuestData(value: unknown): QuestData {
  if (!isRecord(value)) {
    throw new PublicError(502, "Gemini returned an invalid quest.");
  }

  const rawClues = value.clues;
  if (!Array.isArray(rawClues) || rawClues.length !== 3) {
    throw new PublicError(502, "Gemini did not return exactly three clues.");
  }

  const clues: ClueItem[] = rawClues.map((rawClue) => {
    if (!isRecord(rawClue) || !Number.isInteger(rawClue.clue_id)) {
      throw new PublicError(502, "Gemini returned an invalid clue.");
    }

    const clueId = rawClue.clue_id as number;
    if (clueId < 1) {
      throw new PublicError(502, "Gemini returned an invalid clue ID.");
    }

    const poeticClue = requiredText(rawClue, "poetic_clue", 500);
    const riddleLines = poeticClue
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (riddleLines.length < 2 || riddleLines.length > 4) {
      throw new PublicError(502, "Gemini returned a malformed riddle.");
    }

    return {
      clue_id: clueId,
      target_object_name: requiredText(rawClue, "target_object_name", 120),
      poetic_clue: riddleLines.join("\n"),
      storyline_continuation: requiredText(
        rawClue,
        "storyline_continuation",
        800,
      ),
    };
  });

  const clueIds = new Set(clues.map((clue) => clue.clue_id));
  const targetNames = new Set(
    clues.map((clue) => clue.target_object_name.toLocaleLowerCase()),
  );
  if (clueIds.size !== 3 || targetNames.size !== 3) {
    throw new PublicError(502, "Gemini returned duplicate clues.");
  }

  return {
    opening_narrative: requiredText(value, "opening_narrative", 1_500),
    clues,
  };
}

export function parseVerificationResult(value: unknown): VerificationResult {
  if (!isRecord(value) || typeof value.is_correct !== "boolean") {
    throw new PublicError(502, "Gemini returned an invalid verification result.");
  }
  return {
    is_correct: value.is_correct,
    detected_item: requiredText(value, "detected_item", 160),
    feedback_message: requiredText(value, "feedback_message", 500),
  };
}

function parseGeminiJson(responseText: string | undefined): unknown {
  if (!responseText?.trim()) {
    throw new PublicError(502, "Gemini returned an empty response.");
  }
  try {
    return JSON.parse(responseText);
  } catch (error) {
    throw new PublicError(502, "Gemini returned malformed JSON.", {
      cause: error,
    });
  }
}

export function normalizePublicError(error: unknown): PublicError {
  if (error instanceof PublicError) {
    return error;
  }

  const details = isRecord(error) ? error : {};
  const status = Number(details.status ?? details.statusCode ?? details.code);
  const errorName =
    error instanceof Error ? error.name.toLocaleLowerCase() : "unknown";

  if (errorName.includes("timeout") || errorName.includes("abort")) {
    return new PublicError(
      504,
      "Gemini took too long to respond. Please try again.",
      { cause: error },
    );
  }
  if (status === 401 || status === 403) {
    return new PublicError(
      503,
      "The Gemini API credentials are invalid or lack permission.",
      { cause: error },
    );
  }
  if (status === 429) {
    return new PublicError(
      503,
      "Gemini is busy right now. Wait a moment and retry.",
      { cause: error },
    );
  }
  if (status >= 500) {
    return new PublicError(
      502,
      "Gemini is temporarily unavailable. Please retry.",
      { cause: error },
    );
  }
  return new PublicError(
    502,
    "Gemini could not process this photo. Try a clearer, well-lit image.",
    { cause: error },
  );
}

export async function generateQuest(image: ParsedImage): Promise<QuestData> {
  try {
    const response = await getGenAI().models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          { inlineData: { mimeType: image.mimeType, data: image.data } },
          { text: QUEST_PROMPT },
        ],
      },
      config: {
        systemInstruction: QUEST_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseJsonSchema: QUEST_RESPONSE_SCHEMA,
      },
    });
    return parseQuestData(parseGeminiJson(response.text));
  } catch (error) {
    throw normalizePublicError(error);
  }
}

export async function verifySolution(
  image: ParsedImage,
  targetObjectName: string,
): Promise<VerificationResult> {
  const target = targetObjectName.trim();
  if (!target || target.length > 120) {
    throw new PublicError(400, "A valid target object is required.");
  }

  try {
    const response = await getGenAI().models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          { inlineData: { mimeType: image.mimeType, data: image.data } },
          {
            text: `Target object to find: '${target}'. Analyze this submitted photo. Is this a close-up photo of the specified target object? Respond in JSON.`,
          },
        ],
      },
      config: {
        systemInstruction:
          "You are the RoomQuest AI Gamemaster verifying a player's solution. Be accurate, fair, playful, and never reveal the target object when the answer is wrong.",
        responseMimeType: "application/json",
        responseJsonSchema: VERIFICATION_RESPONSE_SCHEMA,
      },
    });
    return parseVerificationResult(parseGeminiJson(response.text));
  } catch (error) {
    throw normalizePublicError(error);
  }
}
