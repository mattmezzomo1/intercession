import { Request, Response } from 'express';
import prisma from '../utils/database';
import { AuthenticatedRequest } from '../types';
import { createWordOfDaySchema } from '../utils/validation';
import { createError } from '../middleware/errorHandler';
import { wordOfDayService } from '../services/wordOfDayService';

export const getTodayWordOfDay = async (req: AuthenticatedRequest, res: Response) => {
  const { language = 'pt' } = req.query;

  // Get user's primary language if authenticated
  let languageCode = language as string;
  if (req.user && !language) {
    const userLanguage = await prisma.userLanguage.findFirst({
      where: {
        userId: req.user.id,
        isPrimary: true
      },
      include: { language: true }
    });

    if (userLanguage) {
      languageCode = userLanguage.language.code;
    }
  }

  // Get today's date (start of day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find the language
  const languageRecord = await prisma.language.findUnique({
    where: { code: languageCode }
  });

  if (!languageRecord) {
    throw createError('Language not found', 404);
  }

  // Try to find today's word of day
  let wordOfDay = await prisma.wordOfDay.findUnique({
    where: {
      date_languageId: {
        date: today,
        languageId: languageRecord.id
      }
    },
    include: {
      language: true
    }
  });

  // If not found, get the most recent word of day for this language
  if (!wordOfDay) {
    wordOfDay = await prisma.wordOfDay.findFirst({
      where: {
        languageId: languageRecord.id,
        date: { lte: today }
      },
      orderBy: { date: 'desc' },
      include: {
        language: true
      }
    });
  }

  // If still not found, get any word of day for this language
  if (!wordOfDay) {
    wordOfDay = await prisma.wordOfDay.findFirst({
      where: {
        languageId: languageRecord.id
      },
      orderBy: { date: 'desc' },
      include: {
        language: true
      }
    });
  }

  if (!wordOfDay) {
    throw createError('No word of day found for this language', 404);
  }

  res.json({
    success: true,
    data: wordOfDay
  });
};

export const getWordOfDayByDate = async (req: AuthenticatedRequest, res: Response) => {
  const { date } = req.params;
  const { language = 'pt' } = req.query;

  // Parse and validate date
  const targetDate = new Date(date);
  if (isNaN(targetDate.getTime())) {
    throw createError('Invalid date format', 400);
  }
  
  targetDate.setHours(0, 0, 0, 0);

  // Get user's primary language if authenticated
  let languageCode = language as string;
  if (req.user && !language) {
    const userLanguage = await prisma.userLanguage.findFirst({
      where: { 
        userId: req.user.id,
        isPrimary: true
      },
      include: { language: true }
    });
    
    if (userLanguage) {
      languageCode = userLanguage.language.code;
    }
  }

  // Find the language
  const languageRecord = await prisma.language.findUnique({
    where: { code: languageCode }
  });

  if (!languageRecord) {
    throw createError('Language not found', 404);
  }

  const wordOfDay = await prisma.wordOfDay.findUnique({
    where: {
      date_languageId: {
        date: targetDate,
        languageId: languageRecord.id
      }
    },
    include: {
      language: true
    }
  });

  if (!wordOfDay) {
    throw createError('Word of day not found for this date and language', 404);
  }

  res.json({
    success: true,
    data: wordOfDay
  });
};

export const getAvailableWordOfDayDates = async (req: Request, res: Response) => {
  const { language = 'pt' } = req.query;

  // Find the language
  const languageRecord = await prisma.language.findUnique({
    where: { code: language as string }
  });

  if (!languageRecord) {
    throw createError('Language not found', 404);
  }

  const dates = await prisma.wordOfDay.findMany({
    where: {
      languageId: languageRecord.id
    },
    select: {
      date: true
    },
    orderBy: { date: 'desc' }
  });

  res.json({
    success: true,
    data: dates.map(d => d.date)
  });
};

export const createWordOfDay = async (req: AuthenticatedRequest, res: Response) => {
  const validatedData = createWordOfDaySchema.parse(req.body);

  // Check if word of day already exists for this date and language
  const existingWordOfDay = await prisma.wordOfDay.findUnique({
    where: {
      date_languageId: {
        date: new Date(validatedData.date),
        languageId: validatedData.languageId
      }
    }
  });

  if (existingWordOfDay) {
    throw createError('Word of day already exists for this date and language', 409);
  }

  const wordOfDay = await prisma.wordOfDay.create({
    data: {
      date: new Date(validatedData.date),
      word: validatedData.word,
      verse: validatedData.verse,
      reference: validatedData.reference,
      devotionalTitle: validatedData.devotionalTitle,
      devotionalContent: validatedData.devotionalContent,
      devotionalReflection: validatedData.devotionalReflection,
      prayerTitle: validatedData.prayerTitle,
      prayerContent: validatedData.prayerContent,
      prayerDuration: validatedData.prayerDuration,
      languageId: validatedData.languageId
    },
    include: {
      language: true
    }
  });

  res.status(201).json({
    success: true,
    data: wordOfDay,
    message: 'Word of day created successfully'
  });
};

export const generateTodayWordOfDay = async (req: Request, res: Response) => {
  try {
    await wordOfDayService.createTodayWordOfDay();

    res.json({
      success: true,
      message: 'Today\'s word of day generated successfully'
    });
  } catch (error) {
    console.error('Error generating today\'s word of day:', error);
    throw createError('Failed to generate today\'s word of day', 500);
  }
};
