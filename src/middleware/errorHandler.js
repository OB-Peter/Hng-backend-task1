/**
 * 404 handler — must come after all routes
 */
export function notFound(req, res) {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
}

/**
 * Global error handler — catches anything thrown in routes
 */
export function errorHandler(err, req, res, _next) {
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err.message);

  res.status(err.status ?? 500).json({
    status: 'error',
    message: err.message ?? 'Internal server error',
  });
}