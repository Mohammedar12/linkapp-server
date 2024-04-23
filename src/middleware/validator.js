const AppError = require("../helpers/AppError");

const validator = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(", ");
    return res.status(400).json({ error: errorMessage });
  }
  Object.assign(req, { validatedData: value }); // Attach the validated data to the request object
  next();
};

module.exports = validator;
