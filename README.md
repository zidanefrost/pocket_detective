# RoomQuest

RoomQuest turns a photo of a physical room into a three-stage AI escape-room
game. The React frontend handles the camera and game state; the Node/Express
server keeps the Gemini API key private and performs multimodal quest generation
and solution verification with `gemini-3.6-flash`.

## Live app

Play RoomQuest at [pocket-detective.vercel.app](https://pocket-detective.vercel.app/).

## Run locally

Prerequisites: Node.js 20 or newer and a Gemini API key.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and set:

   ```dotenv
   GEMINI_API_KEY="your-key"
   ```

3. Start the React and Node development server:

   ```bash
   npm run dev
   ```

4. Open <http://localhost:3000>.

## Validation and production

```bash
npm run lint
npm run build
npm start
```

The browser never receives `GEMINI_API_KEY`. It calls `/api/analyze-room` and
`/api/verify-solution`, and the Express server makes the Gemini requests.
