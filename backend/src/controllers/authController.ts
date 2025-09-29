import { Request, Response } from 'express';
import prisma from '../utils/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { registerSchema, loginSchema } from '../utils/validation';
import { createError } from '../middleware/errorHandler';
import { ApiResponse } from '../types';

export const register = async (req: Request, res: Response) => {
  console.log('Registration request body:', req.body);

  const validatedData = registerSchema.parse(req.body);
  console.log('Validated data:', validatedData);

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: validatedData.email }
  });

  if (existingUser) {
    throw createError('User already exists with this email', 409);
  }

  // Hash password
  const hashedPassword = await hashPassword(validatedData.password);

  // Prepare user data for creation
  const userData = {
    email: validatedData.email,
    name: validatedData.name,
    password: hashedPassword,
    avatar: validatedData.avatar,
    latitude: validatedData.latitude,
    longitude: validatedData.longitude,
    city: validatedData.city,
    country: validatedData.country,
    timezone: validatedData.timezone,
    userType: validatedData.userType || 'USER',
    userMotivations: validatedData.userMotivations
  };

  console.log('User data to be created:', userData);

  // Create user
  const user = await prisma.user.create({
    data: userData,
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      latitude: true,
      longitude: true,
      city: true,
      country: true,
      timezone: true,
      userType: true,
      userMotivations: true,
      createdAt: true,
      updatedAt: true
    }
  });

  // Create user languages if provided
  if (validatedData.languages && validatedData.languages.length > 0) {
    await prisma.userLanguage.createMany({
      data: validatedData.languages.map((languageId, index) => ({
        userId: user.id,
        languageId,
        isPrimary: index === 0 // First language is primary
      }))
    });
  }

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    email: user.email
  });

  const response: ApiResponse = {
    success: true,
    data: {
      user,
      token
    },
    message: 'User registered successfully'
  };

  res.status(201).json(response);
};

export const login = async (req: Request, res: Response) => {
  const validatedData = loginSchema.parse(req.body);

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: validatedData.email }
  });

  if (!user) {
    throw createError('Invalid email or password', 401);
  }

  // Verify password
  const isValidPassword = await comparePassword(validatedData.password, user.password);
  if (!isValidPassword) {
    throw createError('Invalid email or password', 401);
  }

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    email: user.email
  });

  const response: ApiResponse = {
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        latitude: user.latitude,
        longitude: user.longitude,
        city: user.city,
        country: user.country,
        timezone: user.timezone,
        userType: user.userType,
        userMotivations: user.userMotivations,
        bankAccount: user.bankAccount,
        pixKey: user.pixKey,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      token
    },
    message: 'Login successful'
  };

  res.json(response);
};

export const me = async (req: Request, res: Response) => {
  // This will be called with authentication middleware
  // so req.user will be available
  const response: ApiResponse = {
    success: true,
    data: (req as any).user,
    message: 'User profile retrieved successfully'
  };

  res.json(response);
};
