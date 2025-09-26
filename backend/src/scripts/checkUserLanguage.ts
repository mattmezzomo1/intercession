import dotenv from 'dotenv';
import prisma from '../utils/database';

// Load environment variables
dotenv.config();

async function checkUserLanguage() {
  console.log('🔍 Checking user language settings...\n');

  try {
    // Get all users and their language settings
    const users = await prisma.user.findMany({
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

    console.log(`📊 Found ${users.length} users:`);
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. User: ${user.name} (${user.email})`);
      console.log(`   ID: ${user.id}`);
      
      if (user.languages.length === 0) {
        console.log('   ❌ No languages configured');
      } else {
        user.languages.forEach((userLang, langIndex) => {
          const isPrimary = userLang.isPrimary ? '🟢 PRIMARY' : '⚪ Secondary';
          console.log(`   ${langIndex + 1}. ${isPrimary} ${userLang.language.name} (${userLang.language.code})`);
        });
      }
    });

    // Check if there are any users with English as primary language
    const englishPrimaryUsers = await prisma.user.findMany({
      where: {
        languages: {
          some: {
            isPrimary: true,
            language: {
              code: 'en'
            }
          }
        }
      },
      include: {
        languages: {
          include: {
            language: true
          }
        }
      }
    });

    if (englishPrimaryUsers.length > 0) {
      console.log('\n🔍 Users with English as primary language:');
      englishPrimaryUsers.forEach(user => {
        console.log(`   - ${user.name} (${user.email})`);
      });
    } else {
      console.log('\n✅ No users have English as primary language');
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
checkUserLanguage();
