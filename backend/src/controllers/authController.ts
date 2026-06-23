import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User from '../models/User';

const signToken = (id: string, email: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured.');
  return jwt.sign({ id, email }, secret, { expiresIn: '7d' });
};

// ─── Register ─────────────────────────────────────────────────────────────────

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const register = async (req: Request, res: Response): Promise<void> => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({
      success: false,
      error: parsed.error.errors[0].message,
    });
    return;
  }

  const { email, password } = parsed.data;

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409).json({
      success: false,
      error: 'An account with that email already exists.',
    });
    return;
  }

  const user = await User.create({ email, password });
  const token = signToken(user._id.toString(), user.email);

  res.status(201).json({
    success: true,
    data: {
      token,
      user: { id: user._id, email: user.email },
    },
  });
};

// ─── Login ────────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const login = async (req: Request, res: Response): Promise<void> => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({
      success: false,
      error: parsed.error.errors[0].message,
    });
    return;
  }

  const { email, password } = parsed.data;

  // Explicitly select password (excluded by default)
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    res.status(401).json({ success: false, error: 'Invalid email or password.' });
    return;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    res.status(401).json({ success: false, error: 'Invalid email or password.' });
    return;
  }

  const token = signToken(user._id.toString(), user.email);

  res.status(200).json({
    success: true,
    data: {
      token,
      user: { id: user._id, email: user.email },
    },
  });
};
