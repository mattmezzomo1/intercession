import { Request, Response } from 'express';
import prisma from '../utils/database';
import { AuthenticatedRequest } from '../types';
import { createError } from '../middleware/errorHandler';

export const getLanguages = async (req: Request, res: Response) => {
  const languages = await prisma.language.findMany({
    orderBy: { name: 'asc' }
  });

  res.json({
    success: true,
    data: languages
  });
};

export const getUserLanguages = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  const userLanguages = await prisma.userLanguage.findMany({
    where: { userId },
    include: {
      language: true
    },
    orderBy: [
      { isPrimary: 'desc' },
      { language: { name: 'asc' } }
    ]
  });

  res.json({
    success: true,
    data: userLanguages
  });
};

export const updateUserLanguages = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { languages } = req.body; // Array of { languageId: string, isPrimary?: boolean }

  if (!Array.isArray(languages) || languages.length === 0) {
    throw createError('At least one language is required', 400);
  }

  // Validate that all language IDs exist
  const languageIds = languages.map(l => l.languageId);
  const existingLanguages = await prisma.language.findMany({
    where: { id: { in: languageIds } }
  });

  if (existingLanguages.length !== languageIds.length) {
    throw createError('One or more invalid language IDs', 400);
  }

  // Ensure only one primary language
  const primaryLanguages = languages.filter(l => l.isPrimary);
  if (primaryLanguages.length > 1) {
    throw createError('Only one primary language is allowed', 400);
  }

  // Delete existing user languages
  await prisma.userLanguage.deleteMany({
    where: { userId }
  });

  // Create new user languages
  const userLanguages = await prisma.userLanguage.createMany({
    data: languages.map(l => ({
      userId,
      languageId: l.languageId,
      isPrimary: l.isPrimary || false
    }))
  });

  // Fetch the created records with language details
  const updatedUserLanguages = await prisma.userLanguage.findMany({
    where: { userId },
    include: {
      language: true
    },
    orderBy: [
      { isPrimary: 'desc' },
      { language: { name: 'asc' } }
    ]
  });

  res.json({
    success: true,
    data: updatedUserLanguages,
    message: 'User languages updated successfully'
  });
};
