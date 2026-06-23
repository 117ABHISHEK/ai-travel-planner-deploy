// Trip-related types

export type BudgetTier = 'Low' | 'Medium' | 'High';
export type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening' | 'Night';
export type HotelTier = 'Budget' | 'Mid-range' | 'Luxury';
export type PackingCategory = 'Documents' | 'Clothing' | 'Gear' | 'Other';

export interface Activity {
  title: string;
  description: string;
  estimatedCostUSD: number;
  timeOfDay: TimeOfDay;
}

export interface DayItinerary {
  dayNumber: number;
  activities: Activity[];
}

export interface Hotel {
  name: string;
  tier: HotelTier;
  estimatedCostNightUSD: number;
  rating: number;
}

export interface EstimatedBudget {
  transport: number;
  accommodation: number;
  food: number;
  activities: number;
  total: number;
}

export interface PackingItem {
  item: string;
  category: PackingCategory;
  isPacked: boolean;
}

export interface Trip {
  _id: string;
  userId: string;
  destination: string;
  durationDays: number;
  budgetTier: BudgetTier;
  interests: string[];
  itinerary: DayItinerary[];
  hotels: Hotel[];
  estimatedBudget: EstimatedBudget;
  packingList: PackingItem[];
  createdAt: string;
  updatedAt: string;
}

export interface TripSummary {
  _id: string;
  destination: string;
  durationDays: number;
  budgetTier: BudgetTier;
  interests: string[];
  estimatedBudget: EstimatedBudget;
  createdAt: string;
}

// Auth types

export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
}

// API response type

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Form types

export interface CreateTripFormData {
  destination: string;
  durationDays: number;
  budgetTier: BudgetTier;
  interests: string[];
}
