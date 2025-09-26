import dotenv from 'dotenv';
import prisma from '../utils/database';

// Load environment variables
dotenv.config();

async function checkEnglishWords() {
  console.log('🔍 Checking English Word of Day records...\n');

  try {
    // Get English language
    const enLanguage = await prisma.language.findUnique({
      where: { code: 'en' }
    });

    if (!enLanguage) {
      console.log('❌ English language not found');
      return;
    }

    console.log('🌍 English Language:', enLanguage.name, `(${enLanguage.code})`);

    // Get all English word of day records
    const enWords = await prisma.wordOfDay.findMany({
      where: {
        languageId: enLanguage.id
      },
      orderBy: { date: 'desc' },
      take: 5
    });

    console.log(`\n📊 Found ${enWords.length} English word of day records:`);
    
    enWords.forEach((word, index) => {
      console.log(`\n${index + 1}. ${word.date.toISOString().split('T')[0]}`);
      console.log(`   📝 Word: ${word.word}`);
      console.log(`   📖 Verse: ${word.verse.substring(0, 80)}...`);
      console.log(`   📍 Reference: ${word.reference}`);
    });

    // Check if there's a "HOPE" record
    const hopeRecord = await prisma.wordOfDay.findFirst({
      where: {
        word: 'HOPE'
      },
      include: {
        language: true
      }
    });

    if (hopeRecord) {
      console.log('\n🔍 Found "HOPE" record:');
      console.log(`   📅 Date: ${hopeRecord.date.toISOString().split('T')[0]}`);
      console.log(`   🌍 Language: ${hopeRecord.language.name} (${hopeRecord.language.code})`);
      console.log(`   📖 Verse: ${hopeRecord.verse}`);
      console.log(`   📍 Reference: ${hopeRecord.reference}`);
    } else {
      console.log('\n❌ No "HOPE" record found');
    }

    console.log('\n🎉 English words check completed!');

  } catch (error) {
    console.error('❌ Check failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkEnglishWords();
