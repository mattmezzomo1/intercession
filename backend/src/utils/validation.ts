import { z } from 'zod';

// Auth validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password must be less than 100 characters'),
  avatar: z.string().url().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  timezone: z.string().max(50).optional(),
  languages: z.array(z.string().cuid('Invalid language ID')).min(1, 'At least one language is required').optional(),
  userType: z.enum(['USER', 'INTERCESSOR']).optional(),
  userMotivations: z.string().optional() // JSON string of motivations array
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters').optional(),
  avatar: z.string().url().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  timezone: z.string().max(50).optional(),
  bankAccount: z.string().max(200).optional(),
  pixKey: z.string().max(100).optional()
});

// Prayer Request validation schemas
export const createPrayerRequestSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(10, 'Prayer request must be at least 10 characters').max(1000, 'Prayer request must be less than 1000 characters'),
  urgent: z.boolean().optional().default(false),
  privacy: z.enum(['PUBLIC', 'PRIVATE', 'FRIENDS']).optional().default('PUBLIC'),
  categoryId: z.string().cuid('Invalid category ID'),
  languageId: z.string().cuid('Invalid language ID'),
  images: z.array(z.string().url()).max(5, 'Maximum 5 images allowed').optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional()
});

export const updatePrayerRequestSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must be less than 200 characters').optional(),
  content: z.string().min(10, 'Prayer request must be at least 10 characters').max(1000, 'Prayer request must be less than 1000 characters').optional(),
  urgent: z.boolean().optional(),
  privacy: z.enum(['PUBLIC', 'PRIVATE', 'FRIENDS']).optional(),
  status: z.enum(['ACTIVE', 'ANSWERED', 'ARCHIVED']).optional(),
  categoryId: z.string().cuid('Invalid category ID').optional(),
  languageId: z.string().cuid('Invalid language ID').optional()
});

// Comment validation schemas
export const createCommentSchema = z.object({
  prayerRequestId: z.string().cuid('Invalid prayer request ID'),
  content: z.string().min(1, 'Comment cannot be empty').max(300, 'Comment must be less than 300 characters')
});

// Intercession validation schemas
export const createIntercessionSchema = z.object({
  prayerRequestId: z.string().cuid('Invalid prayer request ID'),
  comment: z.string().max(300, 'Comment must be less than 300 characters').optional()
});

// Prayer Log validation schemas
export const createPrayerLogSchema = z.object({
  prayerRequestId: z.string().cuid('Invalid prayer request ID'),
  date: z.string().optional() // If not provided, will use today
});

// Word of Day validation schemas
export const createWordOfDaySchema = z.object({
  date: z.string().datetime('Invalid date format'),
  word: z.string().min(1, 'Word is required').max(50, 'Word must be less than 50 characters'),
  verse: z.string().min(1, 'Verse is required').max(1000, 'Verse must be less than 1000 characters'),
  reference: z.string().min(1, 'Reference is required').max(100, 'Reference must be less than 100 characters'),
  devotionalTitle: z.string().min(1, 'Devotional title is required').max(100, 'Title must be less than 100 characters'),
  devotionalContent: z.string().min(1, 'Devotional content is required').max(2000, 'Content must be less than 2000 characters'),
  devotionalReflection: z.string().min(1, 'Devotional reflection is required').max(1000, 'Reflection must be less than 1000 characters'),
  prayerTitle: z.string().min(1, 'Prayer title is required').max(100, 'Title must be less than 100 characters'),
  prayerContent: z.string().min(1, 'Prayer content is required').max(1000, 'Content must be less than 1000 characters'),
  prayerDuration: z.string().min(1, 'Prayer duration is required').max(20, 'Duration must be less than 20 characters'),
  languageId: z.string().cuid('Invalid language ID')
});

// Query validation schemas
export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/, 'Page must be a number').transform(Number).refine(n => n > 0, 'Page must be greater than 0').optional().default('1'),
  limit: z.string().regex(/^\d+$/, 'Limit must be a number').transform(Number).refine(n => n > 0 && n <= 100, 'Limit must be between 1 and 100').optional().default('10')
});

export const prayerRequestQuerySchema = paginationSchema.extend({
  category: z.string().optional(),
  urgent: z.string().transform(val => val === 'true').optional(),
  status: z.enum(['ACTIVE', 'ANSWERED', 'ARCHIVED']).optional(),
  userId: z.string().cuid().optional(),
  language: z.string().optional(),
  latitude: z.string().regex(/^-?\d+\.?\d*$/, 'Invalid latitude').transform(Number).optional(),
  longitude: z.string().regex(/^-?\d+\.?\d*$/, 'Invalid longitude').transform(Number).optional(),
  maxDistance: z.string().regex(/^\d+\.?\d*$/, 'Invalid distance').transform(Number).optional()
});

// Category validation schemas
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50, 'Name must be less than 50 characters'),
  slug: z.string().min(1, 'Category slug is required').max(50, 'Slug must be less than 50 characters').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
});
