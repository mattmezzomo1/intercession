import dotenv from 'dotenv';
import prisma from '../utils/database';

// Load environment variables
dotenv.config();

async function fixUserLanguage() {
  console.log('🔧 Fixing user language settings...\n');

  try {
    // Get the user Mateus Mezzomo
    const user = await prisma.user.findUnique({
      where: { email: 'm@m.com' },
      include: {
        languages: {
          include: {
            language: true
          }
        }
      }
    });

    if (!user) {
      console.error('❌ User not found');
      return;
    }

    console.log(`👤 User: ${user.name} (${user.email})`);
    console.log('📋 Current language settings:');
    
    user.languages.forEach((userLang, index) => {
      const isPrimary = userLang.isPrimary ? '🟢 PRIMARY' : '⚪ Secondary';
      console.log(`   ${index + 1}. ${isPrimary} ${userLang.language.name} (${userLang.language.code})`);
    });

    // Find English and Portuguese language records
    const englishUserLang = user.languages.find(ul => ul.language.code === 'en');
    const portugueseUserLang = user.languages.find(ul => ul.language.code === 'pt');

    if (!englishUserLang || !portugueseUserLang) {
      console.error('❌ English or Portuguese language not found for user');
      return;
    }

    console.log('\n🔄 Updating language settings...');
    
    // Update English to secondary
    await prisma.userLanguage.update({
      where: { id: englishUserLang.id },
      data: { isPrimary: false }
    });
    
    // Update Portuguese to primary
    await prisma.userLanguage.update({
      where: { id: portugueseUserLang.id },
      data: { isPrimary: true }
    });

    console.log('✅ English set to secondary');
    console.log('✅ Portuguese set to primary');

    // Verify the changes
    const updatedUser = await prisma.user.findUnique({
      where: { email: 'm@m.com' },
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

    console.log('\n📋 Updated language settings:');
    updatedUser?.languages.forEach((userLang, index) => {
      const isPrimary = userLang.isPrimary ? '🟢 PRIMARY' : '⚪ Secondary';
      console.log(`   ${index + 1}. ${isPrimary} ${userLang.language.name} (${userLang.language.code})`);
    });

    console.log('\n🎉 User language fix completed!');

  } catch (error) {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixUserLanguage();
