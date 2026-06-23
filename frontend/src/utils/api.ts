import { Trip, TripSummary, AuthResponse, CreateTripFormData, PackingItem, DayItinerary } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');

// ─── Generic fetch wrapper ────────────────────────────────────────────────────

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new ApiError(
      json?.error || `Request failed with status ${res.status}`,
      res.status
    );
  }

  return json as T;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (email: string, password: string): Promise<AuthResponse> =>
    apiFetch<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string): Promise<AuthResponse> =>
    apiFetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

// ─── Trips ────────────────────────────────────────────────────────────────────

export const tripsApi = {
  list: (token: string): Promise<{ success: boolean; data: TripSummary[] }> =>
    apiFetch('/api/trips', {}, token),

  get: (id: string, token: string): Promise<{ success: boolean; data: Trip }> =>
    apiFetch(`/api/trips/${id}`, {}, token),

  create: (
    data: CreateTripFormData,
    token: string
  ): Promise<{ success: boolean; data: Trip }> =>
    apiFetch(
      '/api/trips',
      { method: 'POST', body: JSON.stringify(data) },
      token
    ),

  update: (
    id: string,
    data: Partial<{ itinerary: DayItinerary[]; packingList: PackingItem[] }>,
    token: string
  ): Promise<{ success: boolean; data: Trip }> =>
    apiFetch(
      `/api/trips/${id}`,
      { method: 'PUT', body: JSON.stringify(data) },
      token
    ),

  regenerateDay: (
    id: string,
    dayNumber: number,
    feedback: string,
    token: string
  ): Promise<{ success: boolean; data: Trip }> =>
    apiFetch(
      `/api/trips/${id}/regenerate-day/${dayNumber}`,
      { method: 'PUT', body: JSON.stringify({ feedback }) },
      token
    ),

  delete: (id: string, token: string): Promise<{ success: boolean }> =>
    apiFetch(`/api/trips/${id}`, { method: 'DELETE' }, token),
};

export { ApiError };
