import { Router } from 'express';
import prisma from '../utils/database';

const router = Router();

// Public endpoint to get community stats for landing page
router.get('/stats', async (req, res) => {
  try {
    // Get total users count
    const totalUsers = await prisma.user.count();
    
    // Get intercessors count (users with INTERCESSOR type)
    const intercessors = await prisma.user.count({
      where: {
        userType: 'INTERCESSOR'
      }
    });
    
    // For now, we'll simulate pastors/leaders as a subset of intercessors
    // In the future, you can add more user types to the schema
    const pastors = Math.floor(intercessors * 0.3); // Assume 30% of intercessors are pastors/leaders

    // Calculate warriors (active users who are not intercessors)
    // We'll consider users who have made intercessions as "warriors"
    const warriors = await prisma.user.count({
      where: {
        AND: [
          { userType: 'USER' },
          {
            intercessions: {
              some: {}
            }
          }
        ]
      }
    });
    
    // Additional stats that might be useful
    const totalPrayerRequests = await prisma.prayerRequest.count();
    const totalIntercessions = await prisma.intercession.count();
    const activeUsersLast30Days = await prisma.user.count({
      where: {
        updatedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
        }
      }
    });
    
    res.json({
      success: true,
      data: {
        totalUsers,
        intercessors,
        pastors,
        warriors,
        totalPrayerRequests,
        totalIntercessions,
        activeUsersLast30Days
      }
    });
  } catch (error) {
    console.error('Error fetching public stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Public endpoint to get recent testimonies (without sensitive data)
router.get('/testimonies', async (req, res) => {
  try {
    const testimonies = await prisma.prayerRequest.findMany({
      where: {
        AND: [
          { status: 'ANSWERED' },
          { privacy: 'PUBLIC' }
        ]
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            name: true,
            city: true,
            country: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 10
    });
    
    res.json({
      success: true,
      data: testimonies
    });
  } catch (error) {
    console.error('Error fetching public testimonies:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;
