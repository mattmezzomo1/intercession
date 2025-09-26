import { Response } from 'express';
import prisma from '../utils/database';
import { z } from 'zod';
import { AuthenticatedRequest } from '../types';

// Validation schemas
const createPrayerReminderSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(100, 'Título deve ter no máximo 100 caracteres'),
  content: z.string().optional(),
});

const updatePrayerReminderSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(100, 'Título deve ter no máximo 100 caracteres').optional(),
  content: z.string().optional(),
});

// Create prayer reminder
export const createPrayerReminder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const validatedData = createPrayerReminderSchema.parse(req.body);

    const prayerReminder = await prisma.prayerReminder.create({
      data: {
        ...validatedData,
        userId,
      },
    });

    return res.status(201).json({
      success: true,
      data: prayerReminder,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.errors,
      });
    }

    console.error('Error creating prayer reminder:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Get user's prayer reminders
export const getUserPrayerReminders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const skip = (page - 1) * limit;

    const [prayerReminders, total] = await Promise.all([
      prisma.prayerReminder.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.prayerReminder.count({
        where: { userId },
      }),
    ]);

    res.json({
      success: true,
      data: prayerReminders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching prayer reminders:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Update prayer reminder
export const updatePrayerReminder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const { id } = req.params;
    const validatedData = updatePrayerReminderSchema.parse(req.body);

    // Check if reminder exists and belongs to user
    const existingReminder = await prisma.prayerReminder.findFirst({
      where: { id, userId },
    });

    if (!existingReminder) {
      return res.status(404).json({ error: 'Lembrete não encontrado' });
    }

    const updatedReminder = await prisma.prayerReminder.update({
      where: { id },
      data: validatedData,
    });

    return res.json({
      success: true,
      data: updatedReminder,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.errors,
      });
    }

    console.error('Error updating prayer reminder:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Delete prayer reminder
export const deletePrayerReminder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const { id } = req.params;

    // Check if reminder exists and belongs to user
    const existingReminder = await prisma.prayerReminder.findFirst({
      where: { id, userId },
    });

    if (!existingReminder) {
      return res.status(404).json({ error: 'Lembrete não encontrado' });
    }

    await prisma.prayerReminder.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: 'Lembrete excluído com sucesso',
    });
  } catch (error) {
    console.error('Error deleting prayer reminder:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
