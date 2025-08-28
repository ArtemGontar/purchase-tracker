const cognitoService = require('../services/cognitoService');

const cognitoAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.',
        code: 'NO_TOKEN' 
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify token with Cognito
    const cognitoPayload = await cognitoService.verifyToken(token);
    
    // Get or create user in our database
    const user = await cognitoService.getOrCreateUser(cognitoPayload);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'User not found.',
        code: 'USER_NOT_FOUND' 
      });
    }
    
    req.user = user;
    req.cognitoPayload = cognitoPayload;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    
    let errorMessage = 'Invalid token.';
    let errorCode = 'INVALID_TOKEN';
    
    if (error.message.includes('expired')) {
      errorMessage = 'Token expired.';
      errorCode = 'TOKEN_EXPIRED';
    } else if (error.message.includes('Invalid token')) {
      errorMessage = 'Invalid token format.';
      errorCode = 'INVALID_TOKEN_FORMAT';
    }
    
    res.status(401).json({ 
      error: errorMessage,
      code: errorCode 
    });
  }
};

module.exports = cognitoAuth;
