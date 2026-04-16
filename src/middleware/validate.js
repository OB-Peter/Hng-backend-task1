/**
 * Validate the request body for POST /api/profiles
 */
export function validateCreateProfile(req, res, next) {
  const { name } = req.body;

  if (name === undefined || name === null) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing required field: name',
    });
  }

  if (typeof name !== 'string') {
    return res.status(422).json({
      status: 'error',
      message: 'Invalid type: name must be a string',
    });
  }

  if (name.trim() === '') {
    return res.status(400).json({
      status: 'error',
      message: 'Name cannot be empty',
    });
  }

  // Attach trimmed name for use in controller
  req.body.name = name.trim();

  next();
}