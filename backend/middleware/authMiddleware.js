const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized - No token provided',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach userId to request (JWT contains 'id' field)
    req.user = decoded.id;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized - Invalid token',
    });
  }
};

/**
 * Optional auth — sets req.user if a valid Bearer token is present,
 * but never blocks the request if there is no token or it is invalid.
 */
const optionalProtect = (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (auth && auth.startsWith('Bearer ')) {
      const token = auth.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded.id;
    }
  } catch {
    // ignore invalid / expired tokens — just proceed as unauthenticated
  }
  next();
};

module.exports = { protect, optionalProtect };
