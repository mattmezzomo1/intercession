import dotenv from 'dotenv';
import prisma from '../utils/database';

// Load environment variables
dotenv.config();

async function checkPrayerLanguages() {
  console.log('🔍 Checking prayer request languages...\n');

  try {
    const prayers = await prisma.prayerRequest.findMany({
      include: {
        user: { select: { name: true, email: true } },
        language: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📊 Found ${prayers.length} prayer requests:\n`);
    
    prayers.forEach((prayer, index) => {
      console.log(`${index + 1}. ${prayer.title}`);
      console.log(`   User: ${prayer.user.name} (${prayer.user.email})`);
      console.log(`   Language: ${prayer.language.name} (${prayer.language.code})`);
      console.log(`   Created: ${prayer.createdAt.toISOString().split('T')[0]}`);
      console.log(`   Location: ${prayer.latitude ? 'Yes' : 'No'}`);
      console.log('');
    });

    console.log('🎉 Prayer language check completed!');

  } catch (error) {
    console.error('❌ Check failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkPrayerLanguages();
