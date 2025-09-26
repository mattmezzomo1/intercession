import * as cron from 'node-cron';
import { wordOfDayService } from '../services/wordOfDayService';

/**
 * Daily job to create word of the day
 * Runs every day at 6:00 AM
 */
export function startWordOfDayJob() {
  console.log('🕐 Starting Word of the Day job scheduler...');
  
  // Run every day at 6:00 AM (0 6 * * *)
  cron.schedule('0 6 * * *', async () => {
    console.log('⏰ Running daily Word of the Day job...');

    try {
      await wordOfDayService.createTodayWordOfDay();
      console.log('✅ Daily Word of the Day job completed successfully');
    } catch (error) {
      console.error('❌ Daily Word of the Day job failed:', error);
    }
  }, {
    timezone: "America/Sao_Paulo" // Brazilian timezone
  });

  // Also run immediately on startup if today's word doesn't exist
  setTimeout(async () => {
    console.log('🚀 Running initial Word of the Day check...');
    try {
      await wordOfDayService.createTodayWordOfDay();
      console.log('✅ Initial Word of the Day check completed');
    } catch (error) {
      console.error('❌ Initial Word of the Day check failed:', error);
    }
  }, 5000); // Wait 5 seconds after startup

  console.log('✅ Word of the Day job scheduler started');
}
