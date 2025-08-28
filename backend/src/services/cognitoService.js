const { CognitoJwtVerifier } = require('aws-jwt-verify');
const prisma = require('../config/database');
const { cognitoConfig } = require('../config/aws');

class CognitoService {
  constructor() {
    this.verifier = CognitoJwtVerifier.create({
      userPoolId: cognitoConfig.userPoolId,
      tokenUse: 'access',
      clientId: cognitoConfig.clientId,
    });
  }

  async verifyToken(token) {
    try {
      const payload = await this.verifier.verify(token);
      return payload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async getOrCreateUser(cognitoPayload) {
    const { sub: cognitoId, email, given_name, family_name } = cognitoPayload;
    
    let user = await prisma.user.findUnique({
      where: { cognitoId }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          cognitoId,
          email,
          firstName: given_name || null,
          lastName: family_name || null,
        }
      });
    }

    return user;
  }

  async getUserByCognitoId(cognitoId) {
    return await prisma.user.findUnique({
      where: { cognitoId }
    });
  }

  async updateUser(cognitoId, updateData) {
    return await prisma.user.update({
      where: { cognitoId },
      data: updateData,
    });
  }
}

module.exports = new CognitoService();
