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

module.exports = { protect };
