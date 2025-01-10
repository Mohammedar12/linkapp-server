import AppError from "../helpers/AppError.mjs";

const errorHandler = (err, req, res, next) => {
  // Check if headers have already been sent
  if (res.headersSent) {
    return next(err);
  }

  // Log the error for debugging
  console.error("Error:", err);

  // Handle different types of errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      status: "error",
      message: "Validation Error",
      details: err.message,
    });
  }

  if (err.name === "UnauthorizedError") {
    return res.status(401).json({
      status: "error",
      message: "Unauthorized Access",
    });
  }

  if (err.name === "NotFoundError") {
    return res.status(404).json({
      status: "error",
      message: "Resource Not Found",
    });
  }

  // Default error response
  return res.status(500).json({
    status: "error",
    message: "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { details: err.message }),
  });
};

export default errorHandler;
