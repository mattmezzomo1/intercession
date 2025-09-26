import dotenv from 'dotenv';
import prisma from '../utils/database';

// Load environment variables
dotenv.config();

async function cleanOrphanedData() {
  console.log('🧹 Starting orphaned data cleanup...\n');

  try {
    // Find the user Mateus Mezzomo
    const mateusUser = await prisma.user.findFirst({
      where: {
        name: {
          contains: 'Mateus'
        }
      }
    });

    if (!mateusUser) {
      console.error('❌ User Mateus not found!');
      return;
    }

    console.log(`✅ Found user: ${mateusUser.name} (${mateusUser.email})\n`);

    // Get current statistics
    console.log('📊 Current database statistics:');
    
    const totalComments = await prisma.comment.count();
    const totalIntercessions = await prisma.intercession.count();
    const totalPrayerLogs = await prisma.prayerLog.count();
    const totalUsers = await prisma.user.count();
    
    console.log(`   👥 Total Users: ${totalUsers}`);
    console.log(`   💬 Total Comments: ${totalComments}`);
    console.log(`   🙏 Total Intercessions: ${totalIntercessions}`);
    console.log(`   📊 Total Prayer Logs: ${totalPrayerLogs}\n`);

    // Clean orphaned comments (comments from users other than Mateus)
    console.log('🗑️  Cleaning comments from other users...');
    const deletedComments = await prisma.comment.deleteMany({
      where: {
        userId: {
          not: mateusUser.id
        }
      }
    });
    console.log(`✅ Deleted ${deletedComments.count} comments from other users`);

    // Clean orphaned intercessions (intercessions from users other than Mateus)
    console.log('🗑️  Cleaning intercessions from other users...');
    const deletedIntercessions = await prisma.intercession.deleteMany({
      where: {
        userId: {
          not: mateusUser.id
        }
      }
    });
    console.log(`✅ Deleted ${deletedIntercessions.count} intercessions from other users`);

    // Clean orphaned prayer logs (prayer logs from users other than Mateus)
    console.log('🗑️  Cleaning prayer logs from other users...');
    const deletedPrayerLogs = await prisma.prayerLog.deleteMany({
      where: {
        userId: {
          not: mateusUser.id
        }
      }
    });
    console.log(`✅ Deleted ${deletedPrayerLogs.count} prayer logs from other users`);

    // Clean other users (keep only Mateus)
    console.log('🗑️  Cleaning other users...');
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        id: {
          not: mateusUser.id
        }
      }
    });
    console.log(`✅ Deleted ${deletedUsers.count} other users`);

    // Clean orphaned user languages (languages from deleted users)
    console.log('🗑️  Cleaning orphaned user languages...');
    const deletedUserLanguages = await prisma.userLanguage.deleteMany({
      where: {
        userId: {
          not: mateusUser.id
        }
      }
    });
    console.log(`✅ Deleted ${deletedUserLanguages.count} orphaned user language records`);

    // Clean orphaned prayer reminders (reminders from deleted users)
    console.log('🗑️  Cleaning orphaned prayer reminders...');
    const deletedPrayerReminders = await prisma.prayerReminder.deleteMany({
      where: {
        userId: {
          not: mateusUser.id
        }
      }
    });
    console.log(`✅ Deleted ${deletedPrayerReminders.count} orphaned prayer reminders`);

    // Clean orphaned subscriptions (subscriptions from deleted users)
    console.log('🗑️  Cleaning orphaned subscriptions...');
    const deletedSubscriptions = await prisma.subscription.deleteMany({
      where: {
        userId: {
          not: mateusUser.id
        }
      }
    });
    console.log(`✅ Deleted ${deletedSubscriptions.count} orphaned subscriptions`);

    // Clean orphaned payments (payments from deleted users)
    console.log('🗑️  Cleaning orphaned payments...');
    const deletedPayments = await prisma.payment.deleteMany({
      where: {
        userId: {
          not: mateusUser.id
        }
      }
    });
    console.log(`✅ Deleted ${deletedPayments.count} orphaned payments`);

    // Clean orphaned shared content (shared content from deleted users)
    console.log('🗑️  Cleaning orphaned shared content...');
    const deletedSharedContent = await prisma.sharedContent.deleteMany({
      where: {
        userId: {
          not: mateusUser.id
        }
      }
    });
    console.log(`✅ Deleted ${deletedSharedContent.count} orphaned shared content records`);

    // Get final statistics
    console.log('\n📊 Final database statistics:');
    
    const finalUsers = await prisma.user.count();
    const finalComments = await prisma.comment.count();
    const finalIntercessions = await prisma.intercession.count();
    const finalPrayerLogs = await prisma.prayerLog.count();
    const finalPrayerRequests = await prisma.prayerRequest.count();
    const finalUserLanguages = await prisma.userLanguage.count();
    const finalPrayerReminders = await prisma.prayerReminder.count();
    const finalSubscriptions = await prisma.subscription.count();
    const finalPayments = await prisma.payment.count();
    const finalSharedContent = await prisma.sharedContent.count();
    
    console.log(`   👥 Remaining Users: ${finalUsers}`);
    console.log(`   📝 Remaining Prayer Requests: ${finalPrayerRequests}`);
    console.log(`   💬 Remaining Comments: ${finalComments}`);
    console.log(`   🙏 Remaining Intercessions: ${finalIntercessions}`);
    console.log(`   📊 Remaining Prayer Logs: ${finalPrayerLogs}`);
    console.log(`   🌍 Remaining User Languages: ${finalUserLanguages}`);
    console.log(`   ⏰ Remaining Prayer Reminders: ${finalPrayerReminders}`);
    console.log(`   💳 Remaining Subscriptions: ${finalSubscriptions}`);
    console.log(`   💰 Remaining Payments: ${finalPayments}`);
    console.log(`   📤 Remaining Shared Content: ${finalSharedContent}\n`);

    console.log('🎉 Orphaned data cleanup completed successfully!');
    console.log('   The database now contains only Mateus\'s data and is ready for production.');

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanOrphanedData();
