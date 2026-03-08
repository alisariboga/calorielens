import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../prisma';
import { AuthResponse } from '../shared-types';

const router = express.Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = registerSchema.parse(req.body);
    
    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash
      }
    });
    
    // Generate token
    const secret = process.env.JWT_SECRET || 'default-secret';
    const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '30d' });
    
    const response: AuthResponse = {
      token,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt
      }
    };
    
    res.status(201).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const valid = await bcrypt.compare(password, user.passwordHash);
    
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate token
    const secret = process.env.JWT_SECRET || 'default-secret';
    const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '30d' });
    
    const response: AuthResponse = {
      token,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt
      },
      profile: user.profile ? {
        userId: user.profile.userId,
        sex: user.profile.sex as 'male' | 'female',
        age: user.profile.age,
        heightCm: user.profile.heightCm,
        weightKg: user.profile.weightKg,
        activityLevel: user.profile.activityLevel as any,
        goalRateKgPerWeek: user.profile.goalRateKgPerWeek,
        bmr: user.profile.bmr,
        tdee: user.profile.tdee,
        baseTargetCalories: user.profile.baseTargetCalories,
        updatedAt: user.profile.updatedAt
      } : undefined
    };
    
    res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
