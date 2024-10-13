// const AppError = require("../helpers/AppError");
import AppError from "../helpers/AppError.mjs";

const debugLog = (value) => {
  console.log("Incoming data:", value);
  return value;
};

const validator = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });
  debugLog(value);
  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(", ");
    return res.status(400).json({ error: errorMessage });
  }
  Object.assign(req, { validatedData: value }); // Attach the validated data to the request object
  next();
};

export default validator;
// module.exports = validator;
