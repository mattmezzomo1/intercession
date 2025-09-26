import { Request, Response } from 'express';
import prisma from '../utils/database';
import { createCategorySchema } from '../utils/validation';
import { createError } from '../middleware/errorHandler';

export const getCategories = async (req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: {
          prayerRequests: true
        }
      }
    }
  });

  res.json({
    success: true,
    data: categories
  });
};

export const getCategory = async (req: Request, res: Response) => {
  const { slug } = req.params;

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      _count: {
        select: {
          prayerRequests: true
        }
      }
    }
  });

  if (!category) {
    throw createError('Category not found', 404);
  }

  res.json({
    success: true,
    data: category
  });
};

export const createCategory = async (req: Request, res: Response) => {
  const validatedData = createCategorySchema.parse(req.body);

  // Check if category with this slug already exists
  const existingCategory = await prisma.category.findUnique({
    where: { slug: validatedData.slug }
  });

  if (existingCategory) {
    throw createError('Category with this slug already exists', 409);
  }

  const category = await prisma.category.create({
    data: validatedData
  });

  res.status(201).json({
    success: true,
    data: category,
    message: 'Category created successfully'
  });
};

export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const validatedData = createCategorySchema.parse(req.body);

  // Check if category exists
  const existingCategory = await prisma.category.findUnique({
    where: { id }
  });

  if (!existingCategory) {
    throw createError('Category not found', 404);
  }

  // Check if another category with this slug exists
  if (validatedData.slug !== existingCategory.slug) {
    const categoryWithSlug = await prisma.category.findUnique({
      where: { slug: validatedData.slug }
    });

    if (categoryWithSlug) {
      throw createError('Category with this slug already exists', 409);
    }
  }

  const updatedCategory = await prisma.category.update({
    where: { id },
    data: validatedData
  });

  res.json({
    success: true,
    data: updatedCategory,
    message: 'Category updated successfully'
  });
};

export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;

  // Check if category exists
  const existingCategory = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          prayerRequests: true
        }
      }
    }
  });

  if (!existingCategory) {
    throw createError('Category not found', 404);
  }

  // Check if category has prayer requests
  if (existingCategory._count.prayerRequests > 0) {
    throw createError('Cannot delete category with existing prayer requests', 400);
  }

  await prisma.category.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'Category deleted successfully'
  });
};
