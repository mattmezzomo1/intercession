import dotenv from 'dotenv';
import { wordOfDayService } from '../services/wordOfDayService';
import { screenshotService } from '../services/screenshotService';

// Load environment variables
dotenv.config();

async function testWordOfDayService() {
  console.log('🧪 Testing Word of Day Service with Screenshot + OpenAI Vision...\n');

  try {
    // Test screenshot functionality
    console.log('1. Testing screenshot capture...');
    const screenshotPath = await screenshotService.takeScreenshot('https://www.bible.com/pt/verse-of-the-day');
    console.log(`✅ Screenshot captured: ${screenshotPath}\n`);

    // Test OpenAI Vision extraction
    console.log('2. Testing OpenAI Vision extraction...');
    const extractedVerse = await screenshotService.extractVerseFromImage(screenshotPath);
    console.log('✅ Verse extracted from image:');
    console.log(`   📖 Verse: ${extractedVerse.verse.substring(0, 100)}...`);
    console.log(`   📍 Reference: ${extractedVerse.reference}\n`);

    // Test full scraping service
    console.log('3. Testing complete verse scraping service...');
    const verse = await wordOfDayService.scrapeVerseOfTheDay();
    console.log('✅ Verse scraped successfully:');
    console.log(`   📖 Verse: ${verse.verse.substring(0, 100)}...`);
    console.log(`   📍 Reference: ${verse.reference}\n`);

    // Test content generation
    console.log('4. Testing content generation with OpenAI...');
    const content = await wordOfDayService.generateContent(verse.verse, verse.reference);
    console.log('✅ Content generated successfully:');
    console.log(`   📝 Devotional Title: ${content.devotionalTitle}`);
    console.log(`   📖 Devotional Content: ${content.devotionalContent.substring(0, 100)}...`);
    console.log(`   🤔 Devotional Reflection: ${content.devotionalReflection.substring(0, 100)}...`);
    console.log(`   🙏 Prayer Title: ${content.prayerTitle}`);
    console.log(`   🙏 Prayer Content: ${content.prayerContent.substring(0, 100)}...`);
    console.log(`   ⏱️ Prayer Duration: ${content.prayerDuration}\n`);

    // Test cleanup
    console.log('5. Testing screenshot cleanup...');
    await screenshotService.cleanupOldScreenshots();
    console.log('✅ Screenshot cleanup completed\n');

    // Test full word of day creation
    console.log('6. Testing full word of day creation...');
    await wordOfDayService.createTodayWordOfDay();
    console.log('✅ Word of day created successfully!\n');

    console.log('🎉 All tests passed! The Word of Day service with Screenshot + OpenAI Vision is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('OpenAI API key')) {
        console.log('\n💡 Make sure to set your OPENAI_API_KEY in the .env file');
        console.log('   Get your API key from: https://platform.openai.com/api-keys');
      }
      
      if (error.message.includes('database') || error.message.includes('prisma')) {
        console.log('\n💡 Make sure your database is running and properly configured');
        console.log('   Run: npm run db:push');
      }
    }
    
    process.exit(1);
  }
}

// Run the test
testWordOfDayService();
