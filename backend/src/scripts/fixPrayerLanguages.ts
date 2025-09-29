import dotenv from 'dotenv';
import prisma from '../utils/database';

// Load environment variables
dotenv.config();

async function fixPrayerLanguages() {
  console.log('🔧 Fixing prayer request languages to Portuguese...\n');

  try {
    // Get Portuguese language
    const ptLanguage = await prisma.language.findUnique({
      where: { code: 'pt' }
    });

    if (!ptLanguage) {
      console.error('❌ Portuguese language not found');
      return;
    }

    console.log(`🇧🇷 Portuguese Language: ${ptLanguage.name} (${ptLanguage.code})`);

    // Get all prayer requests that are not in Portuguese
    const nonPortuguesePrayers = await prisma.prayerRequest.findMany({
      where: {
        languageId: {
          not: ptLanguage.id
        }
      },
      include: {
        user: { select: { name: true, email: true } },
        language: true
      }
    });

    console.log(`\n📊 Found ${nonPortuguesePrayers.length} prayer requests not in Portuguese:`);
    
    nonPortuguesePrayers.forEach((prayer, index) => {
      console.log(`${index + 1}. "${prayer.title}" by ${prayer.user.name}`);
      console.log(`   Current language: ${prayer.language.name} (${prayer.language.code})`);
    });

    if (nonPortuguesePrayers.length > 0) {
      console.log('\n🔄 Updating all prayer requests to Portuguese...');
      
      // Update all prayer requests to Portuguese
      const updateResult = await prisma.prayerRequest.updateMany({
        where: {
          languageId: {
            not: ptLanguage.id
          }
        },
        data: {
          languageId: ptLanguage.id
        }
      });

      console.log(`✅ Updated ${updateResult.count} prayer requests to Portuguese`);
    } else {
      console.log('\n✅ All prayer requests are already in Portuguese');
    }

    // Verify the changes
    const allPrayers = await prisma.prayerRequest.findMany({
      include: {
        user: { select: { name: true, email: true } },
        language: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('\n📋 Final prayer request languages:');
    allPrayers.forEach((prayer, index) => {
      console.log(`${index + 1}. "${prayer.title}" by ${prayer.user.name}`);
      console.log(`   Language: ${prayer.language.name} (${prayer.language.code})`);
    });

    console.log('\n🎉 Prayer language fix completed!');

  } catch (error) {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixPrayerLanguages();
