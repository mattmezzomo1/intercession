import dotenv from 'dotenv';
import prisma from '../utils/database';

// Load environment variables
dotenv.config();

async function checkSpecificUserLanguages() {
  console.log('🔍 Checking specific user language settings...\n');

  try {
    // Check the new user
    const newUser = await prisma.user.findUnique({
      where: { email: 'mmportes@outlook.com' },
      include: {
        languages: {
          include: {
            language: true
          },
          orderBy: {
            isPrimary: 'desc'
          }
        }
      }
    });

    if (newUser) {
      console.log(`👤 New User: ${newUser.name} (${newUser.email})`);
      console.log('📋 Language settings:');
      
      if (newUser.languages.length === 0) {
        console.log('   ❌ No languages configured');
      } else {
        newUser.languages.forEach((userLang, index) => {
          const isPrimary = userLang.isPrimary ? '🟢 PRIMARY' : '⚪ Secondary';
          console.log(`   ${index + 1}. ${isPrimary} ${userLang.language.name} (${userLang.language.code})`);
        });
      }
    } else {
      console.log('❌ New user not found');
    }

    console.log('\n🎉 User language check completed!');

  } catch (error) {
    console.error('❌ Check failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkSpecificUserLanguages();
