// Load environment variables first, before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import prayerRequestRoutes from './routes/prayerRequests';
import intercessionRoutes from './routes/intercessions';
import commentRoutes from './routes/comments';
import prayerLogRoutes from './routes/prayerLogs';
import prayerReminderRoutes from './routes/prayerReminders';
import wordOfDayRoutes from './routes/wordOfDay';
import categoryRoutes from './routes/categories';
import languageRoutes from './routes/languages';
import publicRoutes from './routes/public';
import uploadRoutes from './routes/upload';
import subscriptionRoutes from './routes/subscription';
import webhookRoutes from './routes/webhook';
import shareRoutes from './routes/share';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// Import jobs
import { startWordOfDayJob } from './jobs/wordOfDayJob';

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// CORS configuration
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : [
      'http://localhost:8080',  // Current frontend port
      'http://localhost:8081',  // Alternative port
      'http://localhost:3000',  // Create React App default
      'http://localhost:5173',  // Vite default
      'http://localhost:4173'   // Vite preview
    ];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Webhook routes (before body parsing middleware)
app.use('/api/webhook', express.raw({ type: 'application/json' }), webhookRoutes);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/prayer-requests', prayerRequestRoutes);
app.use('/api/intercessions', intercessionRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/prayer-logs', prayerLogRoutes);
app.use('/api/prayer-reminders', prayerReminderRoutes);
app.use('/api/word-of-day', wordOfDayRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/languages', languageRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/share', shareRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);

  // Start background jobs
  startWordOfDayJob();
});

export default app;
