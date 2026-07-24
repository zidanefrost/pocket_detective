import "dotenv/config";

import express, { type NextFunction, type Request, type Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

import {
  generateQuest,
  normalizePublicError,
  parseImageDataUrl,
  PublicError,
  verifySolution,
} from "./src/server/roomQuest";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

function sendRouteError(error: unknown, response: Response): void {
  const publicError = normalizePublicError(error);
  console.error("RoomQuest API request failed", {
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

// Support base64 image payloads up to 20 MB
app.use(express.json({ limit: "20mb" }));

app.post("/api/analyze-room", async (request, response) => {
  try {
    const rawImages = Array.isArray(request.body?.images)
      ? request.body.images
      : request.body?.image
        ? [request.body.image]
        : [];

    if (rawImages.length === 0) {
      throw new PublicError(400, "At least one room photo is required.");
    }

    const imagesToParse = rawImages.slice(0, 3);
    const parsedImages = imagesToParse.map((img: unknown) =>
      parseImageDataUrl(img),
    );

    const questData = await generateQuest(parsedImages);
    response.json({ success: true, data: questData });
  } catch (error) {
    sendRouteError(error, response);
  }
});

app.post("/api/verify-solution", async (request, response) => {
  try {
    const image = parseImageDataUrl(request.body?.image);
    const targetObjectName = request.body?.target_object_name;
    if (typeof targetObjectName !== "string") {
      throw new PublicError(400, "A target object is required.");
    }
    const verification = await verifySolution(image, targetObjectName);
    response.json({ success: true, data: verification });
  } catch (error) {
    sendRouteError(error, response);
  }
});

app.use(
  (
    error: Error & { type?: string },
    _request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    if (error.type === "entity.too.large") {
      response.status(413).json({
        error: "The processed image is too large. Choose a smaller image and retry.",
      });
      return;
    }
    if (error instanceof SyntaxError) {
      response.status(400).json({ error: "The request body is not valid JSON." });
      return;
    }
    next(error);
  },
);

async function startServer(): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_request, response) => {
      response.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`RoomQuest server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error: unknown) => {
  console.error("RoomQuest server failed to start", {
    errorType: error instanceof Error ? error.name : "UnknownError",
  });
  process.exitCode = 1;
});
