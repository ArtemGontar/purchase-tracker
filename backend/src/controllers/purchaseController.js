const prisma = require('../config/database');

class PurchaseController {
  async createPurchase(req, res) {
    try {
      const userId = req.user.id;
      const { title, amount, currency, category, description, purchaseDate, receiptId } = req.body;

      // Validate receipt belongs to user if provided
      if (receiptId) {
        const receipt = await prisma.receipt.findFirst({
          where: { id: receiptId, userId },
        });

        if (!receipt) {
          return res.status(400).json({
            error: 'Receipt not found or does not belong to user',
            code: 'INVALID_RECEIPT'
          });
        }

        // Check if receipt is already linked to another purchase
        const existingPurchase = await prisma.purchase.findUnique({
          where: { receiptId },
        });

        if (existingPurchase) {
          return res.status(400).json({
            error: 'Receipt is already linked to another purchase',
            code: 'RECEIPT_ALREADY_LINKED'
          });
        }
      }

      const purchase = await prisma.purchase.create({
        data: {
          title,
          amount,
          currency: currency || 'USD',
          category,
          description,
          purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
          userId,
          receiptId,
        },
        include: {
          receipt: {
            select: {
              id: true,
              originalName: true,
              s3Url: true,
              processed: true,
            },
          },
        },
      });

      res.status(201).json({
        message: 'Purchase created successfully',
        purchase,
      });
    } catch (error) {
      console.error('Create purchase error:', error);
      res.status(500).json({
        error: 'Failed to create purchase',
        code: 'CREATE_FAILED'
      });
    }
  }

  async getPurchases(req, res) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const category = req.query.category;
      const startDate = req.query.startDate;
      const endDate = req.query.endDate;
      const skip = (page - 1) * limit;

      // Build where clause
      const where = { userId };
      
      if (category) {
        where.category = category;
      }

      if (startDate || endDate) {
        where.purchaseDate = {};
        if (startDate) {
          where.purchaseDate.gte = new Date(startDate);
        }
        if (endDate) {
          where.purchaseDate.lte = new Date(endDate);
        }
      }

      const [purchases, total] = await Promise.all([
        prisma.purchase.findMany({
          where,
          orderBy: { purchaseDate: 'desc' },
          skip,
          take: limit,
          include: {
            receipt: {
              select: {
                id: true,
                originalName: true,
                s3Url: true,
                processed: true,
              },
            },
          },
        }),
        prisma.purchase.count({ where }),
      ]);

      // Calculate total amount for the filtered purchases
      const totalAmount = await prisma.purchase.aggregate({
        where,
        _sum: {
          amount: true,
        },
      });

      res.json({
        purchases,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        summary: {
          totalAmount: totalAmount._sum.amount || 0,
          count: total,
        },
      });
    } catch (error) {
      console.error('Get purchases error:', error);
      res.status(500).json({
        error: 'Failed to fetch purchases',
        code: 'FETCH_FAILED'
      });
    }
  }

  async getPurchaseById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const purchase = await prisma.purchase.findFirst({
        where: { id, userId },
        include: {
          receipt: {
            select: {
              id: true,
              originalName: true,
              s3Url: true,
              processed: true,
              textractData: true,
            },
          },
        },
      });

      if (!purchase) {
        return res.status(404).json({
          error: 'Purchase not found',
          code: 'PURCHASE_NOT_FOUND'
        });
      }

      res.json({ purchase });
    } catch (error) {
      console.error('Get purchase error:', error);
      res.status(500).json({
        error: 'Failed to fetch purchase',
        code: 'FETCH_FAILED'
      });
    }
  }

  async updatePurchase(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      // Convert purchaseDate to Date object if provided
      if (updateData.purchaseDate) {
        updateData.purchaseDate = new Date(updateData.purchaseDate);
      }

      const purchase = await prisma.purchase.findFirst({
        where: { id, userId },
      });

      if (!purchase) {
        return res.status(404).json({
          error: 'Purchase not found',
          code: 'PURCHASE_NOT_FOUND'
        });
      }

      const updatedPurchase = await prisma.purchase.update({
        where: { id },
        data: updateData,
        include: {
          receipt: {
            select: {
              id: true,
              originalName: true,
              s3Url: true,
              processed: true,
            },
          },
        },
      });

      res.json({
        message: 'Purchase updated successfully',
        purchase: updatedPurchase,
      });
    } catch (error) {
      console.error('Update purchase error:', error);
      res.status(500).json({
        error: 'Failed to update purchase',
        code: 'UPDATE_FAILED'
      });
    }
  }

  async deletePurchase(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const purchase = await prisma.purchase.findFirst({
        where: { id, userId },
      });

      if (!purchase) {
        return res.status(404).json({
          error: 'Purchase not found',
          code: 'PURCHASE_NOT_FOUND'
        });
      }

      await prisma.purchase.delete({
        where: { id },
      });

      res.json({
        message: 'Purchase deleted successfully',
        code: 'DELETED'
      });
    } catch (error) {
      console.error('Delete purchase error:', error);
      res.status(500).json({
        error: 'Failed to delete purchase',
        code: 'DELETE_FAILED'
      });
    }
  }

  async getPurchaseCategories(req, res) {
    try {
      const userId = req.user.id;

      const categories = await prisma.purchase.findMany({
        where: { 
          userId,
          category: {
            not: null,
          },
        },
        select: {
          category: true,
        },
        distinct: ['category'],
      });

      const categoryList = categories
        .map(item => item.category)
        .filter(Boolean)
        .sort();

      res.json({ categories: categoryList });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        error: 'Failed to fetch categories',
        code: 'FETCH_FAILED'
      });
    }
  }

  async getPurchaseStats(req, res) {
    try {
      const userId = req.user.id;
      const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(new Date().getFullYear(), 0, 1);
      const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

      const where = {
        userId,
        purchaseDate: {
          gte: startDate,
          lte: endDate,
        },
      };

      const [totalStats, categoryStats] = await Promise.all([
        prisma.purchase.aggregate({
          where,
          _sum: { amount: true },
          _count: true,
          _avg: { amount: true },
        }),
        prisma.purchase.groupBy({
          by: ['category'],
          where,
          _sum: { amount: true },
          _count: true,
        }),
      ]);

      res.json({
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        total: {
          amount: totalStats._sum.amount || 0,
          count: totalStats._count,
          average: totalStats._avg.amount || 0,
        },
        byCategory: categoryStats.map(stat => ({
          category: stat.category || 'Uncategorized',
          amount: stat._sum.amount,
          count: stat._count,
        })),
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({
        error: 'Failed to fetch statistics',
        code: 'FETCH_FAILED'
      });
    }
  }
}

module.exports = new PurchaseController();
