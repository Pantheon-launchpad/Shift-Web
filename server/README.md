# Shift AI server

A small Express server that powers the AI features in the app using **Gemma 4**,
called through the Gemini API (same key/endpoint Google AI Studio uses).

## What it does

- `POST /v1/ai/tasks` — given the goal you just created in Plan, asks Gemma for a
  few small supporting to-dos. These show up on the **Tasks** page in the Daily
  To-Do list with a small "AI" badge, separate from the roadmap's own tasks.
- `POST /v1/ai/plan-reply` — powers the ongoing chat in **Plan** once a goal
  exists. If this fails or no key is configured, the frontend quietly falls
  back to the app's local canned replies, so the app still works without a key.
- `POST /v1/ai/build-in-public` — drafts platform-native posts (X, LinkedIn,
  Instagram, and a Medium opening paragraph) plus a shareable card headline,
  from a completed task or the active goal's roadmap. Powers both the Share
  Results screen and the "Generate post" / "Regenerate" actions on the Build
  in Public page. Falls back to local template variations if it fails.
- `GET /v1/ai/health` — quick check that the server is up and whether a key is configured.

## Setup

1. Get a free API key from Google AI Studio: https://aistudio.google.com/apikey
2. Copy the env template and add your key:
   ```bash
   cd server
   cp .env.example .env
   # then edit .env and paste your key into GEMMA_API_KEY
   ```
3. Install and run:
   ```bash
   npm install
   npm run dev   # or: npm start
   ```
   The server listens on `http://localhost:3000` by default — the same URL
   the frontend already expects via `VITE_API_URL` in the project root's `.env`.

## Model

Defaults to `gemma-4-26b-a4b-it` (the 26B mixture-of-experts Gemma 4 model —
fast and cheap, good quality). You can switch to the larger dense model by
setting `GEMMA_MODEL=gemma-4-31b-it` in `server/.env`. Check the model picker
in AI Studio if these ids ever change.

## Notes

- This server only implements the two AI routes above. Auth (`/v1/auth/...`)
  is expected to come from your existing backend — this doesn't replace it.
- Both AI calls are designed to fail soft on the frontend: a missing key,
  rate limit, or network error won't break Plan or the Tasks page, it just
  skips the AI-generated content for that action.
