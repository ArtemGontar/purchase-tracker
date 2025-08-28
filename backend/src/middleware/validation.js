const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
        code: 'VALIDATION_ERROR'
      });
    }
    next();
  };
};

const purchaseSchema = Joi.object({
  title: Joi.string().required().min(1).max(255),
  amount: Joi.number().required().min(0),
  currency: Joi.string().optional().default('USD').length(3),
  category: Joi.string().optional().max(100),
  description: Joi.string().optional().max(1000),
  purchaseDate: Joi.date().optional().default(new Date()),
});

const updatePurchaseSchema = Joi.object({
  title: Joi.string().optional().min(1).max(255),
  amount: Joi.number().optional().min(0),
  currency: Joi.string().optional().length(3),
  category: Joi.string().optional().max(100),
  description: Joi.string().optional().max(1000),
  purchaseDate: Joi.date().optional(),
});

const updateUserSchema = Joi.object({
  firstName: Joi.string().optional().min(1).max(100),
  lastName: Joi.string().optional().min(1).max(100),
});

module.exports = {
  validateRequest,
  validatePurchase: validateRequest(purchaseSchema),
  validateUpdatePurchase: validateRequest(updatePurchaseSchema),
  validateUpdateUser: validateRequest(updateUserSchema),
};
