import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity {
  title: string;
  description: string;
  estimatedCostUSD: number;
  timeOfDay: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
}

export interface IDayItinerary {
  dayNumber: number;
  activities: IActivity[];
}

export interface IHotel {
  name: string;
  tier: 'Budget' | 'Mid-range' | 'Luxury';
  estimatedCostNightUSD: number;
  rating: number;
}

export interface IEstimatedBudget {
  transport: number;
  accommodation: number;
  food: number;
  activities: number;
  total: number;
}

export interface IPackingItem {
  item: string;
  category: 'Documents' | 'Clothing' | 'Gear' | 'Other';
  isPacked: boolean;
}

export interface ITrip extends Document {
  userId: mongoose.Types.ObjectId;
  destination: string;
  durationDays: number;
  budgetTier: 'Low' | 'Medium' | 'High';
  interests: string[];
  itinerary: IDayItinerary[];
  hotels: IHotel[];
  estimatedBudget: IEstimatedBudget;
  packingList: IPackingItem[];
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    estimatedCostUSD: { type: Number, required: true, min: 0 },
    timeOfDay: {
      type: String,
      enum: ['Morning', 'Afternoon', 'Evening', 'Night'],
      required: true,
    },
  },
  { _id: false }
);

const DayItinerarySchema = new Schema<IDayItinerary>(
  {
    dayNumber: { type: Number, required: true },
    activities: { type: [ActivitySchema], default: [] },
  },
  { _id: false }
);

const HotelSchema = new Schema<IHotel>(
  {
    name: { type: String, required: true },
    tier: { type: String, enum: ['Budget', 'Mid-range', 'Luxury'], required: true },
    estimatedCostNightUSD: { type: Number, required: true, min: 0 },
    rating: { type: Number, required: true, min: 0, max: 5 },
  },
  { _id: false }
);

const EstimatedBudgetSchema = new Schema<IEstimatedBudget>(
  {
    transport: { type: Number, required: true, min: 0 },
    accommodation: { type: Number, required: true, min: 0 },
    food: { type: Number, required: true, min: 0 },
    activities: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const PackingItemSchema = new Schema<IPackingItem>(
  {
    item: { type: String, required: true },
    category: {
      type: String,
      enum: ['Documents', 'Clothing', 'Gear', 'Other'],
      required: true,
    },
    isPacked: { type: Boolean, default: false },
  },
  { _id: false }
);

const TripSchema = new Schema<ITrip>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    destination: { type: String, required: true, trim: true },
    durationDays: { type: Number, required: true, min: 1, max: 30 },
    budgetTier: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: true,
    },
    interests: { type: [String], default: [] },
    itinerary: { type: [DayItinerarySchema], default: [] },
    hotels: { type: [HotelSchema], default: [] },
    estimatedBudget: { type: EstimatedBudgetSchema, required: true },
    packingList: { type: [PackingItemSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

const Trip = mongoose.model<ITrip>('Trip', TripSchema);
export default Trip;
