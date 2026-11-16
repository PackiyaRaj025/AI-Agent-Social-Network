// Centralised error handling. Every response uses { success, data, error }.

export function notFound(req, res) {
  res.status(404).json({
    success: false,
    data: null,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose validation errors -> 400
  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join('; ');
  }
  // Bad ObjectId -> 400
  if (err.name === 'CastError') {
    status = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }
  // Duplicate key -> 409
  if (err.code === 11000) {
    status = 409;
    message = 'Duplicate record';
  }

  if (status >= 500) console.error(err);

  res.status(status).json({ success: false, data: null, error: message });
}

// Small helper for throwing HTTP errors from controllers.
export function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}
