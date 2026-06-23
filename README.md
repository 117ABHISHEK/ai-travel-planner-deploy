# AI Travel Planner

A production-ready, multi-user AI travel planning web application that generates complete trip itineraries, hotel recommendations, budget breakdowns, and weather-aware packing lists using Google Gemini 2.5 Flash.

---

## Project Overview

AI Travel Planner lets users describe a trip (destination, duration, budget, interests) and receive a fully AI-generated travel plan in seconds. All plans are private to each user account and can be refined interactively — regenerate any single day with targeted feedback, add/remove activities, and track packing progress.

### Key Capabilities

| Feature | Description |
|---|---|
| **AI Itinerary Generation** | Day-by-day plans with activities, times, descriptions, and estimated costs |
| **Hotel Recommendations** | Three tiers (Budget / Mid-range / Luxury) per destination |
| **Budget Intelligence** | Full trip cost breakdown across transport, accommodation, food, activities |
| **AI Packing Assistant** | Climate- and activity-aware packing checklist with toggle tracking |
| **Day Regeneration** | Replace a single day's activities using natural-language feedback |
| **User Isolation** | JWT auth; users can never access each other's trips |

---

## Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | Next.js 14 (App Router) + TypeScript | SSR-capable, file-based routing, great DX |
| **Styling** | Tailwind CSS | Utility-first, consistent dark design system |
| **Backend** | Node.js + Express + TypeScript | Lightweight, familiar, great ecosystem |
| **Database** | MongoDB + Mongoose | Schema-flexible for nested trip documents |
| **Auth** | JWT + bcryptjs | Stateless, scalable, no session storage |
| **AI** | Google Gemini 2.5 Flash | Fast, JSON-mode output, cost-effective |
| **Deployment** | Vercel (frontend) + Render/Railway (backend) | Zero-config deploys, free tiers available |

---

## Local Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB Atlas cluster (or local MongoDB)
- Google Gemini API key

### 1. Clone & set up environment

```bash
git clone <repo-url>
cd ai-travel-planner
```

#### Backend

```bash
cd backend
cp .env.example .env
# Fill in: PORT, MONGO_URI, JWT_SECRET, GEMINI_API_KEY, ALLOWED_ORIGIN
npm install
npm run dev       # starts on http://localhost:5000
```

#### Frontend

```bash
cd frontend
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:5000
npm install
npm run dev       # starts on http://localhost:3000
```

### 2. Open in browser

Navigate to `http://localhost:3000`. Register an account, then create your first trip.

---

## Deployment

### Backend → Render or Railway

1. Create a new Web Service pointing at the `backend/` directory.
2. Set the **build command**: `npm install && npm run build`
3. Set the **start command**: `npm start`
4. Add environment variables in the Render/Railway dashboard:

| Variable | Value |
|---|---|
| `PORT` | `5000` (or leave blank — platform sets it) |
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A long random secret (e.g., `openssl rand -base64 64`) |
| `GEMINI_API_KEY` | Your Google AI Studio API key |
| `ALLOWED_ORIGIN` | Your Vercel frontend URL (e.g., `https://your-app.vercel.app`) |
| `NODE_ENV` | `production` |

### Frontend → Vercel

1. Import the `frontend/` directory to Vercel.
2. Add one environment variable:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | Your Render/Railway backend URL (e.g., `https://your-api.onrender.com`) |

3. Deploy. Vercel handles the Next.js build automatically.

---

## Architecture

```
Browser (Next.js App)
        │
        │ HTTPS / REST
        ▼
Express API  ──── JWT Auth Middleware ─── Protected Routes
        │                                       │
        │                                       ▼
  MongoDB Atlas                        Trip Controller
  (Users, Trips)                              │
        ▲                                      │ Gemini API call
        │                           ┌──────────┘
        └── save / query ──────────►│ geminiClient.ts
                                    │   - Full plan generation
                                    │   - Single-day regeneration
                                    │   - Exponential backoff retry
                                    └────────────────────────────
```

### Request Flow (Create Trip)

1. User fills `CreateTripForm` → frontend calls `POST /api/trips` with JWT
2. `auth.ts` middleware verifies JWT, attaches `req.user`
3. `tripController.createTrip` validates body with Zod
4. `geminiClient.generateTripPlan` sends a structured prompt to Gemini requesting JSON output
5. Gemini returns `{ itinerary, hotels, estimatedBudget, packingList }` as strict JSON
6. Controller saves the document to MongoDB with `userId = req.user.id`
7. Response returned to frontend; dashboard updates

---

## Authentication & Authorization

- **Passwords** are hashed with bcryptjs (12 salt rounds) before storage; raw passwords are never stored or logged.
- **JWTs** are signed with `JWT_SECRET` (HS256), expire after 7 days, and are stored in `localStorage` on the client.
- **Every trip query** uses `{ _id: <id>, userId: req.user.id }` — if the trip exists but belongs to another user, the query returns `null` and a `404` is returned. This prevents leaking trip existence to unauthorized users (no `403` that would confirm the resource exists).
- **CORS** is locked to the `ALLOWED_ORIGIN` env var; requests from other origins are rejected.

---

## AI Agent Design

### Prompt Engineering

The system prompt instructs Gemini to:
- Return **only** valid JSON (no markdown fences, no prose)
- Use `responseMimeType: "application/json"` to enforce JSON output mode
- Apply realistic local pricing for the destination and selected budget tier
- Generate activities specific to the user's stated interests
- Produce a packing list cross-referenced against destination climate, current month, and planned activities

### Retry & Backoff Strategy

`geminiClient.ts` implements an exponential backoff helper:

```
Attempt 1 → 1 s delay on failure
Attempt 2 → 2 s delay
Attempt 3 → 4 s delay
Attempt 4 → 8 s delay
Attempt 5 → 16 s delay → final failure → clean 503 response
```

Retried conditions: HTTP 429 (rate limit), 500/503 (transient server errors), network-level errors (ECONNRESET, ETIMEDOUT, fetch failed).

Raw Gemini errors are never leaked to the client — only a sanitized user-facing message is returned on exhaustion.

### Day Regeneration

A smaller, targeted prompt is used for single-day regeneration:
- Includes context of other days' activity titles (to avoid duplication)
- Requests only the `activities[]` array for the specified day
- Incorporates user feedback verbatim in the prompt

---

## Creative Feature: AI Weather-Aware Packing Assistant

### Problem It Solves

Travelers frequently forget activity- or climate-specific gear — a hiker who forgets insect repellent in the Amazon, a beach traveler who doesn't bring reef-safe sunscreen, or a European city-tripper who doesn't pack a universal power adapter. Generic packing apps give you the same list regardless of destination or plan.

### Our Solution

The packing list is generated **as part of the same Gemini call** as the itinerary (no extra API cost). The AI cross-references:

- **Destination climate** (tropical, temperate, arctic, desert)
- **Current season** (month of travel)
- **Planned activities** (hiking → trekking poles, snorkeling → dry bag, fine dining → formal shoes)
- **Regional specifics** (Japan → IC card, India → stomach medication, Europe → EHIC card)

Each item is categorized into **Documents / Clothing / Gear / Other** and has an `isPacked` boolean that the user toggles from the UI, persisted via `PUT /api/trips/:id`. A progress bar tracks completion.

---

## Design Decisions & Trade-offs

| Decision | Rationale | Trade-off |
|---|---|---|
| Single Gemini call for full plan | Reduces latency and API cost | Larger prompt; occasional JSON parse errors mitigated by retry |
| JWT in localStorage | Simpler for SPA assessment scope | HttpOnly cookie would be more XSS-resistant in production |
| 404 on ownership mismatch | Prevents resource existence leakage | Slightly less informative error for debugging |
| Mongoose subdocuments | Natural nesting for trip data | Updates require replacing full arrays (no granular array ops exposed) |
| Zod validation on both ends | Type safety + runtime safety | Minor duplication of schema rules |

---

## Known Limitations

- **No real-time pricing**: All cost estimates are AI-generated approximations, not live data.
- **No image assets**: Hotel and destination imagery would require an image search API.
- **JWT not refreshed**: Tokens expire after 7 days with no silent refresh; users must log in again.
- **No rate limiting** on the backend: A production deployment should add `express-rate-limit`.
- **Gemini quota**: Free-tier Gemini API has per-minute request limits; heavy usage may hit 429s temporarily.
- **No email verification**: Account creation does not send a confirmation email.
