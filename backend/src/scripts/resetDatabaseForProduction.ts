import dotenv from 'dotenv';
import prisma from '../utils/database';

// Load environment variables
dotenv.config();

async function resetDatabaseForProduction() {
  console.log('🚀 Starting database reset for production...\n');
  console.log('This will clean all data except for Mateus Mezzomo\'s data.\n');

  try {
    // Find the user Mateus Mezzomo
    console.log('🔍 Looking for user Mateus Mezzomo...');
    
    let mateusUser = await prisma.user.findFirst({
      where: {
        name: {
          contains: 'Mateus'
        }
      }
    });

    if (!mateusUser) {
      console.error('❌ User Mateus not found!');
      console.log('📋 Available users:');
      
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      allUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email}) - ID: ${user.id}`);
      });
      
      return;
    }

    console.log(`✅ Found user: ${mateusUser.name} (${mateusUser.email}) - ID: ${mateusUser.id}\n`);

    // Get initial statistics
    console.log('📊 Initial database statistics:');
    
    const initialStats = {
      users: await prisma.user.count(),
      prayerRequests: await prisma.prayerRequest.count(),
      comments: await prisma.comment.count(),
      intercessions: await prisma.intercession.count(),
      prayerLogs: await prisma.prayerLog.count(),
      prayerImages: await prisma.prayerImage.count(),
      userLanguages: await prisma.userLanguage.count(),
      prayerReminders: await prisma.prayerReminder.count(),
      subscriptions: await prisma.subscription.count(),
      payments: await prisma.payment.count(),
      sharedContent: await prisma.sharedContent.count()
    };
    
    console.log(`   👥 Users: ${initialStats.users}`);
    console.log(`   📝 Prayer Requests: ${initialStats.prayerRequests}`);
    console.log(`   💬 Comments: ${initialStats.comments}`);
    console.log(`   🙏 Intercessions: ${initialStats.intercessions}`);
    console.log(`   📊 Prayer Logs: ${initialStats.prayerLogs}`);
    console.log(`   🖼️  Prayer Images: ${initialStats.prayerImages}`);
    console.log(`   🌍 User Languages: ${initialStats.userLanguages}`);
    console.log(`   ⏰ Prayer Reminders: ${initialStats.prayerReminders}`);
    console.log(`   💳 Subscriptions: ${initialStats.subscriptions}`);
    console.log(`   💰 Payments: ${initialStats.payments}`);
    console.log(`   📤 Shared Content: ${initialStats.sharedContent}\n`);

    const mateusPrayerRequests = await prisma.prayerRequest.count({
      where: { userId: mateusUser.id }
    });
    
    const otherPrayerRequests = initialStats.prayerRequests - mateusPrayerRequests;
    const otherUsers = initialStats.users - 1;

    console.log(`📋 Data to be cleaned:`);
    console.log(`   🗑️  Other Users: ${otherUsers}`);
    console.log(`   🗑️  Other Prayer Requests: ${otherPrayerRequests}`);
    console.log(`   ✅ Mateus's Prayer Requests to keep: ${mateusPrayerRequests}\n`);

    if (otherPrayerRequests === 0 && otherUsers === 0) {
      console.log('✅ Database is already clean! Only Mateus\'s data exists.');
      return;
    }

    // Safety check for production
    if (process.env.NODE_ENV === 'production') {
      console.log('🛑 PRODUCTION SAFETY CHECK');
      console.log('   This script is running in production mode.');
      console.log('   Set CONFIRM_PRODUCTION_RESET=true to proceed.\n');
      
      if (process.env.CONFIRM_PRODUCTION_RESET !== 'true') {
        console.log('❌ Reset cancelled for safety.');
        console.log('   To proceed, set: CONFIRM_PRODUCTION_RESET=true');
        return;
      }
    }

    console.log('🗑️  Starting cleanup process...\n');

    // Step 1: Delete prayer requests from other users
    console.log('1️⃣  Deleting prayer requests from other users...');
    const deletedPrayerRequests = await prisma.prayerRequest.deleteMany({
      where: {
        userId: {
          not: mateusUser.id
        }
      }
    });
    console.log(`   ✅ Deleted ${deletedPrayerRequests.count} prayer requests\n`);

    // Step 2: Delete comments from other users
    console.log('2️⃣  Deleting comments from other users...');
    const deletedComments = await prisma.comment.deleteMany({
      where: {
        userId: {
          not: mateusUser.id
        }
      }
    });
    console.log(`   ✅ Deleted ${deletedComments.count} comments\n`);

    // Step 3: Delete intercessions from other users
    console.log('3️⃣  Deleting intercessions from other users...');
    const deletedIntercessions = await prisma.intercession.deleteMany({
      where: {
        userId: {
          not: mateusUser.id
        }
      }
    });
    console.log(`   ✅ Deleted ${deletedIntercessions.count} intercessions\n`);

    // Step 4: Delete prayer logs from other users
    console.log('4️⃣  Deleting prayer logs from other users...');
    const deletedPrayerLogs = await prisma.prayerLog.deleteMany({
      where: {
        userId: {
          not: mateusUser.id
        }
      }
    });
    console.log(`   ✅ Deleted ${deletedPrayerLogs.count} prayer logs\n`);

    // Step 5: Delete other user-related data
    console.log('5️⃣  Deleting other user-related data...');
    
    const deletedUserLanguages = await prisma.userLanguage.deleteMany({
      where: { userId: { not: mateusUser.id } }
    });
    
    const deletedPrayerReminders = await prisma.prayerReminder.deleteMany({
      where: { userId: { not: mateusUser.id } }
    });
    
    const deletedSubscriptions = await prisma.subscription.deleteMany({
      where: { userId: { not: mateusUser.id } }
    });
    
    const deletedPayments = await prisma.payment.deleteMany({
      where: { userId: { not: mateusUser.id } }
    });
    
    const deletedSharedContent = await prisma.sharedContent.deleteMany({
      where: { userId: { not: mateusUser.id } }
    });
    
    console.log(`   ✅ Deleted ${deletedUserLanguages.count} user language records`);
    console.log(`   ✅ Deleted ${deletedPrayerReminders.count} prayer reminders`);
    console.log(`   ✅ Deleted ${deletedSubscriptions.count} subscriptions`);
    console.log(`   ✅ Deleted ${deletedPayments.count} payments`);
    console.log(`   ✅ Deleted ${deletedSharedContent.count} shared content records\n`);

    // Step 6: Delete other users
    console.log('6️⃣  Deleting other users...');
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        id: {
          not: mateusUser.id
        }
      }
    });
    console.log(`   ✅ Deleted ${deletedUsers.count} users\n`);

    // Get final statistics
    console.log('📊 Final database statistics:');
    
    const finalStats = {
      users: await prisma.user.count(),
      prayerRequests: await prisma.prayerRequest.count(),
      comments: await prisma.comment.count(),
      intercessions: await prisma.intercession.count(),
      prayerLogs: await prisma.prayerLog.count(),
      prayerImages: await prisma.prayerImage.count(),
      userLanguages: await prisma.userLanguage.count(),
      prayerReminders: await prisma.prayerReminder.count(),
      subscriptions: await prisma.subscription.count(),
      payments: await prisma.payment.count(),
      sharedContent: await prisma.sharedContent.count()
    };
    
    console.log(`   👥 Users: ${finalStats.users}`);
    console.log(`   📝 Prayer Requests: ${finalStats.prayerRequests}`);
    console.log(`   💬 Comments: ${finalStats.comments}`);
    console.log(`   🙏 Intercessions: ${finalStats.intercessions}`);
    console.log(`   📊 Prayer Logs: ${finalStats.prayerLogs}`);
    console.log(`   🖼️  Prayer Images: ${finalStats.prayerImages}`);
    console.log(`   🌍 User Languages: ${finalStats.userLanguages}`);
    console.log(`   ⏰ Prayer Reminders: ${finalStats.prayerReminders}`);
    console.log(`   💳 Subscriptions: ${finalStats.subscriptions}`);
    console.log(`   💰 Payments: ${finalStats.payments}`);
    console.log(`   📤 Shared Content: ${finalStats.sharedContent}\n`);

    console.log('🎉 Database reset completed successfully!');
    console.log('   The database is now ready for production launch.');
    console.log(`   Only ${mateusUser.name}'s data has been preserved.`);

  } catch (error) {
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the reset
resetDatabaseForProduction();
