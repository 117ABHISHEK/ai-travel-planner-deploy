import { Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import Trip from '../models/Trip';
import { AuthRequest } from '../middleware/auth';
import {
  generateTripPlan,
  regenerateDayActivities,
  GeminiServiceError,
} from '../utils/geminiClient';

// ─── Helper: validate ObjectId ────────────────────────────────────────────────

const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id);

// ─── POST /api/trips ──────────────────────────────────────────────────────────

const createTripSchema = z.object({
  destination: z.string().min(2, 'Destination must be at least 2 characters').max(100),
  durationDays: z.number().int().min(1).max(30),
  budgetTier: z.enum(['Low', 'Medium', 'High']),
  interests: z.array(z.string()).default([]),
});

export const createTrip = async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = createTripSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ success: false, error: parsed.error.errors[0].message });
    return;
  }

  const { destination, durationDays, budgetTier, interests } = parsed.data;
  const userId = req.user!.id;

  try {
    const plan = await generateTripPlan(destination, durationDays, budgetTier, interests);

    const trip = await Trip.create({
      userId,
      destination,
      durationDays,
      budgetTier,
      interests,
      itinerary: plan.itinerary,
      hotels: plan.hotels,
      estimatedBudget: plan.estimatedBudget,
      packingList: plan.packingList,
    });

    res.status(201).json({ success: true, data: trip });
  } catch (err) {
    if (err instanceof GeminiServiceError) {
      res.status(503).json({ success: false, error: err.message });
    } else {
      throw err;
    }
  }
};

// ─── GET /api/trips ───────────────────────────────────────────────────────────

export const listTrips = async (req: AuthRequest, res: Response): Promise<void> => {
  const trips = await Trip.find({ userId: req.user!.id })
    .select('destination durationDays budgetTier interests estimatedBudget createdAt')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: trips });
};

// ─── GET /api/trips/:id ───────────────────────────────────────────────────────

export const getTrip = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res.status(404).json({ success: false, error: 'Trip not found.' });
    return;
  }

  // Filter by both _id AND userId — returns null if owned by another user (404, not 403)
  const trip = await Trip.findOne({ _id: id, userId: req.user!.id });

  if (!trip) {
    res.status(404).json({ success: false, error: 'Trip not found.' });
    return;
  }

  res.status(200).json({ success: true, data: trip });
};

// ─── PUT /api/trips/:id ───────────────────────────────────────────────────────

export const updateTrip = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res.status(404).json({ success: false, error: 'Trip not found.' });
    return;
  }

  const trip = await Trip.findOne({ _id: id, userId: req.user!.id });
  if (!trip) {
    res.status(404).json({ success: false, error: 'Trip not found.' });
    return;
  }

  // Allowlist updatable fields for partial merge
  const allowedFields = ['itinerary', 'packingList', 'hotels', 'estimatedBudget'];
  const updates: Record<string, unknown> = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  const updated = await Trip.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  res.status(200).json({ success: true, data: updated });
};

// ─── PUT /api/trips/:id/regenerate-day/:dayNumber ─────────────────────────────

const regenerateSchema = z.object({
  feedback: z.string().min(3, 'Please provide more specific feedback').max(500),
});

export const regenerateDay = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id, dayNumber } = req.params;
  const dayNum = parseInt(dayNumber, 10);

  if (!isValidObjectId(id) || isNaN(dayNum)) {
    res.status(404).json({ success: false, error: 'Trip not found.' });
    return;
  }

  const parsed = regenerateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ success: false, error: parsed.error.errors[0].message });
    return;
  }

  const trip = await Trip.findOne({ _id: id, userId: req.user!.id });
  if (!trip) {
    res.status(404).json({ success: false, error: 'Trip not found.' });
    return;
  }

  const dayIndex = trip.itinerary.findIndex((d) => d.dayNumber === dayNum);
  if (dayIndex === -1) {
    res.status(404).json({ success: false, error: `Day ${dayNum} not found in this itinerary.` });
    return;
  }

  // Build context summary of other days for the AI
  const otherDaysSummary = trip.itinerary
    .filter((d) => d.dayNumber !== dayNum)
    .map((d) => `Day ${d.dayNumber}: ${d.activities.map((a) => a.title).join(', ')}`)
    .join('\n');

  try {
    const newActivities = await regenerateDayActivities(
      trip.destination,
      trip.budgetTier,
      dayNum,
      trip.durationDays,
      otherDaysSummary,
      parsed.data.feedback
    );

    trip.itinerary[dayIndex].activities = newActivities as typeof trip.itinerary[0]['activities'];
    await trip.save();

    res.status(200).json({ success: true, data: trip });
  } catch (err) {
    if (err instanceof GeminiServiceError) {
      res.status(503).json({ success: false, error: err.message });
    } else {
      throw err;
    }
  }
};

// ─── DELETE /api/trips/:id ────────────────────────────────────────────────────

export const deleteTrip = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res.status(404).json({ success: false, error: 'Trip not found.' });
    return;
  }

  const trip = await Trip.findOneAndDelete({ _id: id, userId: req.user!.id });
  if (!trip) {
    res.status(404).json({ success: false, error: 'Trip not found.' });
    return;
  }

  res.status(200).json({ success: true, data: { message: 'Trip deleted successfully.' } });
};
