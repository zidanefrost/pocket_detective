const DEFAULT_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb";
const DEFAULT_MODEL_ID = "eleven_multilingual_v2";
const TTS_TIMEOUT_MS = 30_000;
const MAX_TTS_TEXT_LENGTH = 2_500;
const MAX_TTS_AUDIO_BYTES = 4 * 1024 * 1024;

export class TtsPublicError extends Error {
  constructor(
    readonly statusCode: number,
    readonly publicMessage: string,
    options?: ErrorOptions,
  ) {
    super(publicMessage, options);
    this.name = "TtsPublicError";
  }
}

export interface SynthesizedSpeech {
  audio: Uint8Array;
  contentType: string;
}

function normalizeText(value: unknown): string {
  if (typeof value !== "string") {
    throw new TtsPublicError(400, "Narration text is required.");
  }
  const text = value.trim();
  if (!text) {
    throw new TtsPublicError(400, "Narration text is required.");
  }
  if (text.length > MAX_TTS_TEXT_LENGTH) {
    throw new TtsPublicError(
      400,
      "This passage is too long to narrate. Choose a shorter section.",
    );
  }
  return text;
}

export function normalizeTtsError(error: unknown): TtsPublicError {
  if (error instanceof TtsPublicError) {
    return error;
  }
  if (error instanceof Error && error.name === "AbortError") {
    return new TtsPublicError(
      504,
      "Voice narration took too long. Please try again.",
      { cause: error },
    );
  }
  return new TtsPublicError(
    502,
    "Voice narration is temporarily unavailable. Device narration can still be used.",
    { cause: error },
  );
}

export async function synthesizeSpeech(
  rawText: unknown,
): Promise<SynthesizedSpeech> {
  const text = normalizeText(rawText);
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey || apiKey === "MY_ELEVENLABS_API_KEY") {
    throw new TtsPublicError(
      503,
      "AI voice narration is not configured. Device narration can still be used.",
    );
  }

  const voiceId =
    process.env.ELEVENLABS_VOICE_ID?.trim() || DEFAULT_VOICE_ID;
  const modelId =
    process.env.ELEVENLABS_MODEL_ID?.trim() || DEFAULT_MODEL_ID;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TTS_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.85,
            style: 0.55,
            use_speaker_boost: true,
          },
        }),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new TtsPublicError(
          503,
          "AI voice credentials are invalid or lack permission.",
        );
      }
      if (response.status === 429) {
        throw new TtsPublicError(
          503,
          "AI voice narration is busy. Device narration can still be used.",
        );
      }
      throw new TtsPublicError(
        502,
        "AI voice narration is temporarily unavailable. Device narration can still be used.",
      );
    }

    const audio = new Uint8Array(await response.arrayBuffer());
    const contentType = response.headers.get("content-type") || "audio/mpeg";
    if (
      audio.byteLength === 0 ||
      audio.byteLength > MAX_TTS_AUDIO_BYTES ||
      !contentType.toLowerCase().startsWith("audio/")
    ) {
      throw new TtsPublicError(
        502,
        "The voice service returned invalid audio.",
      );
    }
    return { audio, contentType };
  } catch (error) {
    throw normalizeTtsError(error);
  } finally {
    clearTimeout(timeout);
  }
}
