const { TextractClient, DetectDocumentTextCommand, AnalyzeDocumentCommand } = require('@aws-sdk/client-textract');
const { awsConfig } = require('../config/aws');

class TextractService {
  constructor() {
    this.textractClient = new TextractClient(awsConfig);
    this.bucketName = process.env.AWS_S3_BUCKET;
  }

  async extractText(s3Key) {
    const command = new DetectDocumentTextCommand({
      Document: {
        S3Object: {
          Bucket: this.bucketName,
          Name: s3Key,
        },
      },
    });

    const response = await this.textractClient.send(command);
    return this.parseTextractResponse(response);
  }

  async analyzeExpense(s3Key) {
    const command = new AnalyzeDocumentCommand({
      Document: {
        S3Object: {
          Bucket: this.bucketName,
          Name: s3Key,
        },
      },
      FeatureTypes: ['FORMS', 'TABLES'],
    });

    const response = await this.textractClient.send(command);
    return this.parseExpenseData(response);
  }

  parseTextractResponse(response) {
    const lines = response.Blocks
      .filter(block => block.BlockType === 'LINE')
      .map(block => block.Text);

    return {
      fullText: lines.join('\n'),
      lines: lines,
      confidence: this.calculateAverageConfidence(response.Blocks),
    };
  }

  parseExpenseData(response) {
    const extractedData = {
      merchantName: this.extractMerchantName(response.Blocks),
      totalAmount: this.extractTotalAmount(response.Blocks),
      date: this.extractDate(response.Blocks),
      items: this.extractItems(response.Blocks),
      rawText: this.extractAllText(response.Blocks),
      confidence: this.calculateAverageConfidence(response.Blocks),
    };

    return extractedData;
  }

  extractMerchantName(blocks) {
    // Look for merchant name patterns
    const textBlocks = blocks.filter(block => block.BlockType === 'LINE');
    
    // Common merchant indicators
    const merchantPatterns = [
      /^[A-Z\s&]+$/,  // All caps company names
      /(?:store|shop|market|restaurant|cafe|bar)/i,
    ];

    for (const block of textBlocks.slice(0, 5)) { // Check first 5 lines
      if (block.Text && merchantPatterns.some(pattern => pattern.test(block.Text))) {
        return block.Text.trim();
      }
    }

    return textBlocks[0]?.Text || null;
  }

  extractTotalAmount(blocks) {
    const textBlocks = blocks.filter(block => block.BlockType === 'LINE');
    
    // Patterns for total amount
    const totalPatterns = [
      /total.*?[\$]?(\d+\.\d{2})/i,
      /amount.*?[\$]?(\d+\.\d{2})/i,
      /[\$](\d+\.\d{2})/,
    ];

    for (const block of textBlocks) {
      if (block.Text) {
        for (const pattern of totalPatterns) {
          const match = block.Text.match(pattern);
          if (match) {
            return parseFloat(match[1]);
          }
        }
      }
    }

    return null;
  }

  extractDate(blocks) {
    const textBlocks = blocks.filter(block => block.BlockType === 'LINE');
    
    // Date patterns
    const datePatterns = [
      /(\d{1,2}\/\d{1,2}\/\d{2,4})/,
      /(\d{1,2}-\d{1,2}-\d{2,4})/,
      /(\d{4}-\d{2}-\d{2})/,
      /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{1,2},?\s+\d{4}/i,
    ];

    for (const block of textBlocks) {
      if (block.Text) {
        for (const pattern of datePatterns) {
          const match = block.Text.match(pattern);
          if (match) {
            const dateStr = match[1] || match[0];
            const parsedDate = new Date(dateStr);
            if (!isNaN(parsedDate.getTime())) {
              return parsedDate.toISOString();
            }
          }
        }
      }
    }

    return null;
  }

  extractItems(blocks) {
    const textBlocks = blocks.filter(block => block.BlockType === 'LINE');
    const items = [];

    // Look for item patterns (simple implementation)
    for (const block of textBlocks) {
      if (block.Text) {
        const itemMatch = block.Text.match(/(.+?)\s+[\$]?(\d+\.\d{2})/);
        if (itemMatch && itemMatch[1].length > 2) {
          items.push({
            name: itemMatch[1].trim(),
            price: parseFloat(itemMatch[2]),
          });
        }
      }
    }

    return items;
  }

  extractAllText(blocks) {
    return blocks
      .filter(block => block.BlockType === 'LINE')
      .map(block => block.Text)
      .join('\n');
  }

  calculateAverageConfidence(blocks) {
    const confidenceValues = blocks
      .filter(block => block.Confidence)
      .map(block => block.Confidence);

    if (confidenceValues.length === 0) return 0;

    const sum = confidenceValues.reduce((acc, conf) => acc + conf, 0);
    return sum / confidenceValues.length;
  }
}

module.exports = new TextractService();
