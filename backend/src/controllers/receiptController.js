const s3Service = require('../services/s3Service');
const textractService = require('../services/textractService');
const prisma = require('../config/database');

class ReceiptController {
  async uploadReceipt(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          error: 'No file uploaded',
          code: 'NO_FILE'
        });
      }

      const userId = req.user.id;
      const s3Key = s3Service.generateFileKey(userId, req.file.originalname);
      
      // Upload to S3
      const s3Url = await s3Service.uploadFile(req.file, s3Key);
      
      // Save receipt record
      const receipt = await prisma.receipt.create({
        data: {
          originalName: req.file.originalname,
          s3Key,
          s3Url,
          userId,
        },
      });

      // Process with Textract (async)
      this.processReceiptAsync(receipt.id, s3Key);

      res.status(201).json({
        message: 'Receipt uploaded successfully',
        receipt: {
          id: receipt.id,
          originalName: receipt.originalName,
          s3Url: receipt.s3Url,
          processed: receipt.processed,
          createdAt: receipt.createdAt,
        },
      });
    } catch (error) {
      console.error('Upload receipt error:', error);
      res.status(500).json({ 
        error: 'Failed to upload receipt',
        code: 'UPLOAD_FAILED'
      });
    }
  }

  async processReceiptAsync(receiptId, s3Key) {
    try {
      console.log(`Processing receipt ${receiptId} with Textract...`);
      
      const textractData = await textractService.analyzeExpense(s3Key);
      
      await prisma.receipt.update({
        where: { id: receiptId },
        data: {
          textractData,
          processed: true,
        },
      });

      console.log(`Receipt ${receiptId} processed successfully`);
    } catch (error) {
      console.error('Error processing receipt:', error);
      
      // Mark as processed with error info
      await prisma.receipt.update({
        where: { id: receiptId },
        data: {
          processed: true,
          textractData: {
            error: error.message,
            processedAt: new Date().toISOString(),
          },
        },
      });
    }
  }

  async getReceipts(req, res) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const [receipts, total] = await Promise.all([
        prisma.receipt.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          select: {
            id: true,
            originalName: true,
            s3Url: true,
            processed: true,
            createdAt: true,
            updatedAt: true,
            textractData: true,
          },
        }),
        prisma.receipt.count({
          where: { userId },
        }),
      ]);

      res.json({
        receipts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Get receipts error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch receipts',
        code: 'FETCH_FAILED'
      });
    }
  }

  async getReceiptById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const receipt = await prisma.receipt.findFirst({
        where: { id, userId },
        include: {
          purchase: {
            select: {
              id: true,
              title: true,
              amount: true,
              currency: true,
              category: true,
              purchaseDate: true,
            },
          },
        },
      });

      if (!receipt) {
        return res.status(404).json({ 
          error: 'Receipt not found',
          code: 'RECEIPT_NOT_FOUND'
        });
      }

      // Generate signed URL for secure access
      if (receipt.s3Key) {
        receipt.signedUrl = await s3Service.getSignedUrl(receipt.s3Key, 3600); // 1 hour expiry
      }

      res.json({ receipt });
    } catch (error) {
      console.error('Get receipt error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch receipt',
        code: 'FETCH_FAILED'
      });
    }
  }

  async deleteReceipt(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const receipt = await prisma.receipt.findFirst({
        where: { id, userId },
      });

      if (!receipt) {
        return res.status(404).json({ 
          error: 'Receipt not found',
          code: 'RECEIPT_NOT_FOUND'
        });
      }

      // Delete from S3
      if (receipt.s3Key) {
        await s3Service.deleteFile(receipt.s3Key);
      }

      // Delete from database
      await prisma.receipt.delete({
        where: { id },
      });

      res.json({ 
        message: 'Receipt deleted successfully',
        code: 'DELETED'
      });
    } catch (error) {
      console.error('Delete receipt error:', error);
      res.status(500).json({ 
        error: 'Failed to delete receipt',
        code: 'DELETE_FAILED'
      });
    }
  }

  async reprocessReceipt(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const receipt = await prisma.receipt.findFirst({
        where: { id, userId },
      });

      if (!receipt) {
        return res.status(404).json({ 
          error: 'Receipt not found',
          code: 'RECEIPT_NOT_FOUND'
        });
      }

      // Reset processing status
      await prisma.receipt.update({
        where: { id },
        data: {
          processed: false,
          textractData: null,
        },
      });

      // Reprocess with Textract
      this.processReceiptAsync(id, receipt.s3Key);

      res.json({ 
        message: 'Receipt reprocessing started',
        code: 'REPROCESSING'
      });
    } catch (error) {
      console.error('Reprocess receipt error:', error);
      res.status(500).json({ 
        error: 'Failed to reprocess receipt',
        code: 'REPROCESS_FAILED'
      });
    }
  }
}

module.exports = new ReceiptController();
