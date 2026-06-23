import { GoogleGenerativeAI, GenerationConfig } from '@google/generative-ai';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Activity {
  title: string;
  description: string;
  estimatedCostUSD: number;
  timeOfDay: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
}

interface DayItinerary {
  dayNumber: number;
  activities: Activity[];
}

interface Hotel {
  name: string;
  tier: 'Budget' | 'Mid-range' | 'Luxury';
  estimatedCostNightUSD: number;
  rating: number;
}

interface EstimatedBudget {
  transport: number;
  accommodation: number;
  food: number;
  activities: number;
  total: number;
}

interface PackingItem {
  item: string;
  category: 'Documents' | 'Clothing' | 'Gear' | 'Other';
  isPacked: boolean;
}

export interface GeneratedTripPlan {
  itinerary: DayItinerary[];
  hotels: Hotel[];
  estimatedBudget: EstimatedBudget;
  packingList: PackingItem[];
}

// ─── Retry helper ─────────────────────────────────────────────────────────────

const RETRY_DELAYS_MS = [1000, 2000, 4000, 8000, 16000];

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function withExponentialBackoff<T>(
  fn: () => Promise<T>,
  retries = 5
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastError = err;
      const isRetryable = isRetryableError(err);
      if (!isRetryable || attempt === retries - 1) break;
      const delay = RETRY_DELAYS_MS[attempt];
      console.warn(
        `[Gemini] Attempt ${attempt + 1} failed. Retrying in ${delay}ms…`
      );
      await sleep(delay);
    }
  }
  throw new GeminiServiceError(
    'The AI service is temporarily unavailable. Please try again in a moment.'
  );
}

function isRetryableError(err: unknown): boolean {
  if (err instanceof Error) {
    // Network-level errors
    if (
      err.message.includes('ECONNRESET') ||
      err.message.includes('ETIMEDOUT') ||
      err.message.includes('ENOTFOUND') ||
      err.message.includes('fetch failed')
    ) {
      return true;
    }
    // 429 rate limit from Gemini
    if (err.message.includes('429') || err.message.toLowerCase().includes('rate limit')) {
      return true;
    }
    // 500/503 transient server errors
    if (err.message.includes('500') || err.message.includes('503')) {
      return true;
    }
  }
  return false;
}

export class GeminiServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiServiceError';
  }
}

// ─── Client factory ───────────────────────────────────────────────────────────

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured.');
  return new GoogleGenerativeAI(apiKey);
}

const generationConfig: GenerationConfig = {
  responseMimeType: 'application/json',
  temperature: 0.7,
  topP: 0.9,
};

// ─── Full trip plan generation ────────────────────────────────────────────────

export async function generateTripPlan(
  destination: string,
  durationDays: number,
  budgetTier: 'Low' | 'Medium' | 'High',
  interests: string[]
): Promise<GeneratedTripPlan> {
  const client = getClient();
  const model = client.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig,
  });

  const interestsList = interests.length > 0 ? interests.join(', ') : 'general sightseeing';

  const budgetGuidance = {
    Low: 'budget backpacker (hostels ~$15–40/night, street food ~$5–15/meal, free/cheap attractions)',
    Medium: 'mid-range traveler (3-star hotels ~$60–150/night, casual restaurants ~$15–35/meal, paid attractions)',
    High: 'luxury traveler (4–5-star hotels ~$200–500+/night, fine dining ~$50–150/meal, premium experiences)',
  }[budgetTier];

  const prompt = `You are an expert travel planner AI. Generate a comprehensive, realistic trip plan for a ${budgetGuidance} traveling to ${destination} for ${durationDays} days with interests in: ${interestsList}.

Return ONLY a valid JSON object (no markdown, no extra text) matching this EXACT structure:

{
  "itinerary": [
    {
      "dayNumber": 1,
      "activities": [
        {
          "title": "string",
          "description": "string (2–3 sentences with practical tips)",
          "estimatedCostUSD": 0,
          "timeOfDay": "Morning" | "Afternoon" | "Evening" | "Night"
        }
      ]
    }
  ],
  "hotels": [
    {
      "name": "string (real or realistic hotel name)",
      "tier": "Budget" | "Mid-range" | "Luxury",
      "estimatedCostNightUSD": 0,
      "rating": 0.0
    }
  ],
  "estimatedBudget": {
    "transport": 0,
    "accommodation": 0,
    "food": 0,
    "activities": 0,
    "total": 0
  },
  "packingList": [
    {
      "item": "string",
      "category": "Documents" | "Clothing" | "Gear" | "Other",
      "isPacked": false
    }
  ]
}

Rules:
- Generate exactly ${durationDays} days in the itinerary array (dayNumber 1 through ${durationDays})
- Each day must have 3–4 activities spread across different times of day
- Generate exactly 3 hotels (one Budget, one Mid-range, one Luxury) with realistic pricing for ${destination}
- estimatedCostUSD values must use local-market pricing appropriate for ${destination} and the ${budgetTier} budget tier
- estimatedBudget must cover the full ${durationDays}-day trip; total must equal the sum of the four categories
- packingList must have 20–30 items cross-referencing the destination's climate, season (current month: June), and the planned activities
- Items must be specifically tailored to ${destination} (e.g., voltage adapters for the correct region, specific vaccines if required, local currency notes)
- All monetary values are in USD
- hotel rating must be between 1.0 and 5.0`;

  return withExponentialBackoff(async () => {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    try {
      const parsed = JSON.parse(text) as GeneratedTripPlan;
      return parsed;
    } catch {
      throw new GeminiServiceError('The AI returned an unexpected response format. Please try again.');
    }
  });
}

// ─── Single day regeneration ───────────────────────────────────────────────────

export async function regenerateDayActivities(
  destination: string,
  budgetTier: 'Low' | 'Medium' | 'High',
  dayNumber: number,
  totalDays: number,
  existingItinerarySummary: string,
  feedback: string
): Promise<Activity[]> {
  const client = getClient();
  const model = client.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig,
  });

  const prompt = `You are an expert travel planner. Regenerate ONLY the activities for Day ${dayNumber} of a ${totalDays}-day trip to ${destination} (budget tier: ${budgetTier}).

Existing trip context (other days):
${existingItinerarySummary}

User feedback for Day ${dayNumber}: "${feedback}"

Return ONLY a valid JSON array of activities (no wrapper object, no markdown):

[
  {
    "title": "string",
    "description": "string (2–3 sentences with practical tips)",
    "estimatedCostUSD": 0,
    "timeOfDay": "Morning" | "Afternoon" | "Evening" | "Night"
  }
]

Rules:
- Return exactly 3–4 activities for Day ${dayNumber} only
- Incorporate the user's feedback: "${feedback}"
- Do not duplicate activities from other days listed in the context
- Use realistic pricing for ${destination} and the ${budgetTier} budget tier
- Spread activities across different times of day`;

  return withExponentialBackoff(async () => {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    try {
      const parsed = JSON.parse(text) as Activity[];
      if (!Array.isArray(parsed)) {
        throw new Error('Expected an array');
      }
      return parsed;
    } catch {
      throw new GeminiServiceError('The AI returned an unexpected response format. Please try again.');
    }
  });
}
