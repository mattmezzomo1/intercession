import dotenv from 'dotenv';
import prisma from '../utils/database';

// Load environment variables
dotenv.config();

async function cleanPrayerRequests() {
  console.log('🧹 Starting prayer requests cleanup...\n');

  try {
    // First, let's find the user Mateus Mezzomo
    console.log('🔍 Looking for user Mateus Mezzomo...');
    
    // Try to find by name first
    let mateusUser = await prisma.user.findFirst({
      where: {
        name: {
          contains: 'Mateus Mezzomo'
        }
      }
    });

    // If not found by full name, try just "Mateus"
    if (!mateusUser) {
      mateusUser = await prisma.user.findFirst({
        where: {
          name: {
            contains: 'Mateus'
          }
        }
      });
    }

    // If still not found, try by email patterns that might be yours
    if (!mateusUser) {
      const possibleEmails = ['m@m.com', 'mateus@', 'mezzomo@'];

      for (const emailPattern of possibleEmails) {
        mateusUser = await prisma.user.findFirst({
          where: {
            email: {
              contains: emailPattern
            }
          }
        });

        if (mateusUser) break;
      }
    }

    if (!mateusUser) {
      console.error('❌ User Mateus Mezzomo not found!');
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
      
      console.log('\n❗ Please update the script with the correct user identification.');
      return;
    }

    console.log(`✅ Found user: ${mateusUser.name} (${mateusUser.email}) - ID: ${mateusUser.id}\n`);

    // Get current statistics
    console.log('📊 Current database statistics:');
    
    const totalPrayerRequests = await prisma.prayerRequest.count();
    const mateusPrayerRequests = await prisma.prayerRequest.count({
      where: { userId: mateusUser.id }
    });
    const otherPrayerRequests = totalPrayerRequests - mateusPrayerRequests;
    
    const totalComments = await prisma.comment.count();
    const totalIntercessions = await prisma.intercession.count();
    const totalPrayerLogs = await prisma.prayerLog.count();
    const totalPrayerImages = await prisma.prayerImage.count();
    
    console.log(`   📝 Total Prayer Requests: ${totalPrayerRequests}`);
    console.log(`   👤 Mateus's Prayer Requests: ${mateusPrayerRequests}`);
    console.log(`   🗑️  Other Prayer Requests: ${otherPrayerRequests}`);
    console.log(`   💬 Total Comments: ${totalComments}`);
    console.log(`   🙏 Total Intercessions: ${totalIntercessions}`);
    console.log(`   📊 Total Prayer Logs: ${totalPrayerLogs}`);
    console.log(`   🖼️  Total Prayer Images: ${totalPrayerImages}\n`);

    if (otherPrayerRequests === 0) {
      console.log('✅ No prayer requests to clean! Only Mateus\'s requests exist.');
      return;
    }

    // Confirm deletion
    console.log(`⚠️  This will DELETE ${otherPrayerRequests} prayer requests and all related data!`);
    console.log('   This includes comments, intercessions, prayer logs, and images.');
    console.log('   Only Mateus Mezzomo\'s prayer requests will be preserved.\n');

    // In a real scenario, you might want to add a confirmation prompt
    // For now, we'll proceed with a safety check
    if (process.env.NODE_ENV === 'production') {
      console.log('🛑 SAFETY CHECK: This script is running in production mode.');
      console.log('   Please confirm this is intentional by setting CONFIRM_CLEANUP=true');
      
      if (process.env.CONFIRM_CLEANUP !== 'true') {
        console.log('❌ Cleanup cancelled for safety. Set CONFIRM_CLEANUP=true to proceed.');
        return;
      }
    }

    console.log('🗑️  Starting cleanup process...\n');

    // Delete prayer requests that are NOT from Mateus
    // The onDelete: Cascade will automatically delete related records
    const deleteResult = await prisma.prayerRequest.deleteMany({
      where: {
        userId: {
          not: mateusUser.id
        }
      }
    });

    console.log(`✅ Deleted ${deleteResult.count} prayer requests and all related data!\n`);

    // Get final statistics
    console.log('📊 Final database statistics:');
    
    const finalPrayerRequests = await prisma.prayerRequest.count();
    const finalComments = await prisma.comment.count();
    const finalIntercessions = await prisma.intercession.count();
    const finalPrayerLogs = await prisma.prayerLog.count();
    const finalPrayerImages = await prisma.prayerImage.count();
    
    console.log(`   📝 Remaining Prayer Requests: ${finalPrayerRequests}`);
    console.log(`   💬 Remaining Comments: ${finalComments}`);
    console.log(`   🙏 Remaining Intercessions: ${finalIntercessions}`);
    console.log(`   📊 Remaining Prayer Logs: ${finalPrayerLogs}`);
    console.log(`   🖼️  Remaining Prayer Images: ${finalPrayerImages}\n`);

    console.log('🎉 Prayer requests cleanup completed successfully!');
    console.log('   The database is now ready for production with only Mateus\'s data.');

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanPrayerRequests();
