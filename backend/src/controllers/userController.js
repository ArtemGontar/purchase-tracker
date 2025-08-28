const cognitoService = require('../services/cognitoService');
const prisma = require('../config/database');

class UserController {
  async getProfile(req, res) {
    try {
      const user = req.user;

      // Get additional user statistics
      const [purchaseStats, receiptStats] = await Promise.all([
        prisma.purchase.aggregate({
          where: { userId: user.id },
          _count: true,
          _sum: { amount: true },
        }),
        prisma.receipt.count({
          where: { userId: user.id },
        }),
      ]);

      const profile = {
        id: user.id,
        cognitoId: user.cognitoId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        stats: {
          totalPurchases: purchaseStats._count,
          totalSpent: purchaseStats._sum.amount || 0,
          totalReceipts: receiptStats,
        },
      };

      res.json({ profile });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        error: 'Failed to fetch profile',
        code: 'FETCH_FAILED'
      });
    }
  }

  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { firstName, lastName } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          firstName,
          lastName,
        },
        select: {
          id: true,
          cognitoId: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.json({
        message: 'Profile updated successfully',
        user: updatedUser,
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        error: 'Failed to update profile',
        code: 'UPDATE_FAILED'
      });
    }
  }

  async getDashboard(req, res) {
    try {
      const userId = req.user.id;
      const currentDate = new Date();
      const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);

      const [
        recentPurchases,
        monthlyStats,
        lastMonthStats,
        recentReceipts,
        categoryBreakdown
      ] = await Promise.all([
        // Recent purchases (last 10)
        prisma.purchase.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            title: true,
            amount: true,
            currency: true,
            category: true,
            purchaseDate: true,
            createdAt: true,
          },
        }),

        // Current month stats
        prisma.purchase.aggregate({
          where: {
            userId,
            purchaseDate: { gte: currentMonth },
          },
          _count: true,
          _sum: { amount: true },
        }),

        // Last month stats
        prisma.purchase.aggregate({
          where: {
            userId,
            purchaseDate: {
              gte: lastMonth,
              lt: currentMonth,
            },
          },
          _count: true,
          _sum: { amount: true },
        }),

        // Recent receipts (last 5)
        prisma.receipt.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            originalName: true,
            processed: true,
            createdAt: true,
          },
        }),

        // Category breakdown for current month
        prisma.purchase.groupBy({
          by: ['category'],
          where: {
            userId,
            purchaseDate: { gte: currentMonth },
          },
          _sum: { amount: true },
          _count: true,
        }),
      ]);

      const dashboard = {
        summary: {
          currentMonth: {
            totalSpent: monthlyStats._sum.amount || 0,
            totalPurchases: monthlyStats._count,
          },
          lastMonth: {
            totalSpent: lastMonthStats._sum.amount || 0,
            totalPurchases: lastMonthStats._count,
          },
          trends: {
            spentChange: monthlyStats._sum.amount && lastMonthStats._sum.amount 
              ? ((monthlyStats._sum.amount - lastMonthStats._sum.amount) / lastMonthStats._sum.amount) * 100 
              : 0,
            purchaseChange: monthlyStats._count && lastMonthStats._count 
              ? ((monthlyStats._count - lastMonthStats._count) / lastMonthStats._count) * 100 
              : 0,
          },
        },
        recentPurchases,
        recentReceipts,
        categoryBreakdown: categoryBreakdown.map(item => ({
          category: item.category || 'Uncategorized',
          amount: item._sum.amount,
          count: item._count,
        })),
      };

      res.json({ dashboard });
    } catch (error) {
      console.error('Get dashboard error:', error);
      res.status(500).json({
        error: 'Failed to fetch dashboard data',
        code: 'FETCH_FAILED'
      });
    }
  }

  async deleteAccount(req, res) {
    try {
      const userId = req.user.id;

      // This is a soft delete - we keep the user record but mark it as deleted
      // In a real app, you might want to also clean up S3 files, etc.
      
      // For now, we'll just return a message indicating the process would start
      res.json({
        message: 'Account deletion request received. This feature is not yet implemented.',
        code: 'DELETE_REQUESTED'
      });
    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({
        error: 'Failed to delete account',
        code: 'DELETE_FAILED'
      });
    }
  }
}

module.exports = new UserController();
