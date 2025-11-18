import jwt from "jsonwebtoken";

// Middleware to verify JWT token
export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user info to request
    req.user = {
      _id: decoded._id || decoded.id,  // Support both formats
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(500).json({ message: "Authentication failed" });
  }
};

// Middleware to check if user is admin
export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
  next();
};

// Middleware to check if user is authorized (either owner or admin)
export const isAuthorized = (req, res, next) => {
  const userId = req.params.id || req.params.userId;
  
  if (req.user.role === "admin" || req.user._id === userId) {
    return next();
  }
  
  return res.status(403).json({ message: "Access denied. Not authorized." });
};
