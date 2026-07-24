import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser with 50mb limit for base64 images
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Helper to get GoogleGenAI client lazily
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set in process.env");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "MISSING_KEY",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Utility to parse base64 data string
function parseBase64Image(dataString: string) {
  if (!dataString) return null;
  const matches = dataString.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  if (matches) {
    return {
      mimeType: matches[1],
      data: matches[2],
    };
  }
  // If raw base64 without prefix
  return {
    mimeType: "image/jpeg",
    data: dataString,
  };
}

// 1. STATE 1 -> 2 -> 3: Analyze Room Photo & Build Quest
app.post("/api/analyze-room", async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: "No image provided for room scan." });
    }

    const parsedImage = parseBase64Image(image);
    if (!parsedImage) {
      return res.status(400).json({ error: "Invalid image format." });
    }

    const ai = getGenAI();

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: parsedImage.mimeType,
              data: parsedImage.data,
            },
          },
          {
            text: "Analyze this room photo. Pick 3 distinct physical objects visible in the room, and build a cohesive escape room quest narrative with clues for each object.",
          },
        ],
      },
      config: {
        systemInstruction:
          "You are an AI Gamemaster. Analyze the room photo, pick 3 physical objects, and return a JSON object with: 1) an opening narrative story, and 2) an array of 3 clues containing 'target_object_name', 'poetic_clue' (a rhyming riddle), and 'storyline_continuation'. Make the story mysterious, thrilling, and immersive, styled like a dark cyber-detective or sci-fi escape room.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            opening_narrative: {
              type: Type.STRING,
              description:
                "Atmospheric opening narrative establishing the escape room setting based on the scanned space.",
            },
            clues: {
              type: Type.ARRAY,
              description: "Array of exactly 3 clues corresponding to physical items in the room.",
              items: {
                type: Type.OBJECT,
                properties: {
                  target_object_name: {
                    type: Type.STRING,
                    description: "Specific name of the target physical object in the photo.",
                  },
                  poetic_clue: {
                    type: Type.STRING,
                    description:
                      "A rhyming 2-4 line riddle pointing towards the target object.",
                  },
                  storyline_continuation: {
                    type: Type.STRING,
                    description:
                      "Narrative progression unlocked once the player finds and verifies this item.",
                  },
                },
                required: [
                  "target_object_name",
                  "poetic_clue",
                  "storyline_continuation",
                ],
              },
            },
          },
          required: ["opening_narrative", "clues"],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No response generated from Gemini.");
    }

    const questData = JSON.parse(responseText.trim());
    return res.json({ success: true, data: questData });
  } catch (error: any) {
    console.error("Error in /api/analyze-room:", error);
    return res.status(500).json({
      error: error.message || "Failed to analyze room image.",
    });
  }
});

// 2. STATE 4 -> 5: Verify Solution Photo against target_object_name
app.post("/api/verify-solution", async (req, res) => {
  try {
    const { image, target_object_name } = req.body;
    if (!image || !target_object_name) {
      return res.status(400).json({
        error: "Missing image or target object name for verification.",
      });
    }

    const parsedImage = parseBase64Image(image);
    if (!parsedImage) {
      return res.status(400).json({ error: "Invalid solution image format." });
    }

    const ai = getGenAI();

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: parsedImage.mimeType,
              data: parsedImage.data,
            },
          },
          {
            text: `Target object is '${target_object_name}'. Does this submitted photo show that object? Return JSON: { 'is_correct': boolean, 'feedback_message': string }.`,
          },
        ],
      },
      config: {
        systemInstruction:
          "You are an AI Gamemaster verifying escape room solutions. Examine the photo carefully. Check if it clearly or reasonably depicts the requested target object. Be fair yet playful. If correct, confirm with an exciting short cyber-detective message. If incorrect, give a witty, subtle hint on why it doesn't match or what to look for.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            is_correct: {
              type: Type.BOOLEAN,
              description:
                "True if the submitted image shows the expected target object, false otherwise.",
            },
            feedback_message: {
              type: Type.STRING,
              description:
                "Gamemaster feedback detailing confirmation or gentle hints for retry.",
            },
          },
          required: ["is_correct", "feedback_message"],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No response generated from Gemini.");
    }

    const resultData = JSON.parse(responseText.trim());
    return res.json({ success: true, data: resultData });
  } catch (error: any) {
    console.error("Error in /api/verify-solution:", error);
    return res.status(500).json({
      error: error.message || "Failed to verify solution image.",
    });
  }
});

// 3. ElevenLabs TTS Voice Synthesis - deep, mysterious British narrator (similar to "Charon")
app.post("/api/tts", async (req, res) => {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return res.status(401).json({
        error: "ELEVENLABS_API_KEY is missing or unconfigured in .env file.",
      });
    }

    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "No text provided for speech synthesis." });
    }

    const voiceId = process.env.ELEVENLABS_VOICE_ID || "JBFqnCBsd6RMkjVDRZzb";

    const elevenResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          // eleven_multilingual_v2 gives the richest, most human narration
          model_id: "eleven_multilingual_v2",
          // Tuned for a slow, atmospheric, suspenseful mystery narrator
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.85,
            style: 0.55,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!elevenResponse.ok) {
      const errText = await elevenResponse.text();
      throw new Error(
        `ElevenLabs API error (${elevenResponse.status}): ${errText}`
      );
    }

    const arrayBuffer = await elevenResponse.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString("base64");
    const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;

    return res.json({ success: true, audioUrl });
  } catch (error: any) {
    console.error("Error in /api/tts:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate TTS audio with ElevenLabs voice.",
    });
  }
});

// Vite & Static file handler
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`RoomQuest Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
