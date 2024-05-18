import AppError from "../helpers/AppError.mjs";

const errorHandler = (error, req, res, next) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      errorCode: error.errorCode,
      message: error.message,
    });
  }

  return res.status(500).send(error.message);
};

export default errorHandler;
