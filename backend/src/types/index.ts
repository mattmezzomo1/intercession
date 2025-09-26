import { Request } from 'express';

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  password?: string; // Optional for authenticated requests where password is not selected
  latitude?: number | null;
  longitude?: number | null;
  city?: string | null;
  country?: string | null;
  timezone?: string | null;
  userType?: string;
  userMotivations?: string | null;
  bankAccount?: string | null;
  pixKey?: string | null;
  createdAt: Date;
  updatedAt: Date;
  languages?: UserLanguage[];
}

export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  avatar?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
  timezone?: string;
  languages?: string[]; // Array of language IDs
}

export interface LoginData {
  email: string;
  password: string;
}

// Prayer Request types
export interface PrayerRequest {
  id: string;
  title: string;
  content: string;
  urgent: boolean;
  privacy: 'PUBLIC' | 'PRIVATE' | 'FRIENDS';
  status: 'ACTIVE' | 'ANSWERED' | 'ARCHIVED';
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  categoryId: string;
  languageId: string;
  user: User;
  category: Category;
  language: Language;
  images: PrayerImage[];
  intercessions: Intercession[];
  comments: Comment[];
  distance?: number; // Calculated distance from user
  _count?: {
    intercessions: number;
    comments: number;
  };
}

export interface CreatePrayerRequestData {
  content: string;
  urgent?: boolean;
  privacy?: 'PUBLIC' | 'PRIVATE' | 'FRIENDS';
  categoryId: string;
  languageId: string;
  images?: string[];
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
}

export interface UpdatePrayerRequestData {
  content?: string;
  urgent?: boolean;
  privacy?: 'PUBLIC' | 'PRIVATE' | 'FRIENDS';
  status?: 'ACTIVE' | 'ANSWERED' | 'ARCHIVED';
  categoryId?: string;
}

// Category types
export interface Category {
  id: string;
  name: string;
  slug: string;
}

// Prayer Image types
export interface PrayerImage {
  id: string;
  url: string;
  prayerRequestId: string;
}

// Intercession types
export interface Intercession {
  id: string;
  comment?: string;
  createdAt: Date;
  userId: string;
  prayerRequestId: string;
  user: User;
}

export interface CreateIntercessionData {
  prayerRequestId: string;
  comment?: string;
}

// Comment types
export interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  prayerRequestId: string;
  user: User;
}

export interface CreateCommentData {
  prayerRequestId: string;
  content: string;
}

// Prayer Log types
export interface PrayerLog {
  id: string;
  date: Date;
  createdAt: Date;
  userId: string;
  prayerRequestId: string;
  user: User;
  prayerRequest?: PrayerRequest;
}

export interface CreatePrayerLogData {
  prayerRequestId: string;
  date?: string;
}

// Language types
export interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
}

export interface UserLanguage {
  id: string;
  isPrimary: boolean;
  userId: string;
  languageId: string;
  user: User;
  language: Language;
}

// Word of Day types
export interface WordOfDay {
  id: string;
  date: Date;
  word: string;
  verse: string;
  reference: string;
  devotionalTitle: string;
  devotionalContent: string;
  devotionalReflection: string;
  prayerTitle: string;
  prayerContent: string;
  prayerDuration: string;
  languageId: string;
  language: Language;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWordOfDayData {
  date: Date;
  word: string;
  verse: string;
  reference: string;
  devotionalTitle: string;
  devotionalContent: string;
  devotionalReflection: string;
  prayerTitle: string;
  prayerContent: string;
  prayerDuration: string;
  languageId: string;
}

// Auth types
export interface AuthenticatedRequest extends Request {
  user?: User;
  isPremium?: boolean;
  subscription?: any; // Subscription type from Prisma
}

export interface JWTPayload {
  userId: string;
  email: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Query types
export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface PrayerRequestQuery extends PaginationQuery {
  category?: string;
  urgent?: boolean;
  status?: string;
  userId?: string;
  language?: string;
  latitude?: number;
  longitude?: number;
  maxDistance?: number; // in kilometers
}

// User stats
export interface UserStats {
  prayersShared: number;
  intercessionsMade: number;
  commentsLeft: number;
  streak: number;
}
