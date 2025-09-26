import dotenv from 'dotenv';
import prisma from '../utils/database';

// Load environment variables
dotenv.config();

async function checkWordOfDayDB() {
  console.log('🔍 Checking Word of Day records in database...\n');

  try {
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    console.log('📅 Today:', today.toISOString());

    // Get Portuguese language
    const language = await prisma.language.findUnique({
      where: { code: 'pt' }
    });

    if (!language) {
      console.error('❌ Portuguese language not found');
      return;
    }

    console.log('🌍 Language:', language.name, `(${language.code})`);

    // Get all word of day records for Portuguese
    const allWords = await prisma.wordOfDay.findMany({
      where: {
        languageId: language.id
      },
      orderBy: { date: 'desc' },
      take: 10,
      include: {
        language: true
      }
    });

    console.log(`\n📊 Found ${allWords.length} word of day records:`);
    
    allWords.forEach((word, index) => {
      const isToday = word.date.toISOString().split('T')[0] === today.toISOString().split('T')[0];
      console.log(`\n${index + 1}. ${isToday ? '🟢 TODAY' : '⚪'} ${word.date.toISOString().split('T')[0]}`);
      console.log(`   📝 Word: ${word.word}`);
      console.log(`   📖 Verse: ${word.verse.substring(0, 80)}...`);
      console.log(`   📍 Reference: ${word.reference}`);
      console.log(`   📚 Devotional: ${word.devotionalTitle}`);
      console.log(`   🙏 Prayer: ${word.prayerTitle}`);
      console.log(`   ⏱️ Duration: ${word.prayerDuration}`);
      console.log(`   🕐 Created: ${word.createdAt.toISOString()}`);
      console.log(`   🕐 Updated: ${word.updatedAt.toISOString()}`);
    });

    // Check what the API would return
    console.log('\n🔍 Testing API logic...');
    
    // Try to find today's word of day
    let wordOfDay = await prisma.wordOfDay.findUnique({
      where: {
        date_languageId: {
          date: today,
          languageId: language.id
        }
      },
      include: {
        language: true
      }
    });

    if (wordOfDay) {
      console.log('✅ Found today\'s word of day:', wordOfDay.word);
    } else {
      console.log('❌ No word of day found for today, checking fallback...');
      
      // Get the most recent word of day for this language
      wordOfDay = await prisma.wordOfDay.findFirst({
        where: {
          languageId: language.id,
          date: { lte: today }
        },
        orderBy: { date: 'desc' },
        include: {
          language: true
        }
      });

      if (wordOfDay) {
        console.log('✅ Found fallback word of day:', wordOfDay.word, 'from', wordOfDay.date.toISOString().split('T')[0]);
      } else {
        console.log('❌ No fallback word of day found');
      }
    }

    console.log('\n🎉 Database check completed!');

  } catch (error) {
    console.error('❌ Database check failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkWordOfDayDB();
