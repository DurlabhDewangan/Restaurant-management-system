const errorMiddleware = (err, req, res, next) => {
  // If the error is an instance of ApiError (your custom error)
  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message: err.message || "Something went wrong",
    errors: err.errors || [],
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    data: null,
  });
};

export { errorMiddleware };
