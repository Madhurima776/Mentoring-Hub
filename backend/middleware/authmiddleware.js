const jwt  = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }
    const token   = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      return res.status(401).json({ msg: "User not found" });
    }
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Token invalid or expired" });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        msg: `Access denied. Required: ${roles.join(" or ")}`,
      });
    }
    next();
  };
};

const blockFirstLogin = (req, res, next) => {
  if (req.user.isFirstLogin) {
    return res.status(403).json({
      msg:          "Please change your password before continuing.",
      isFirstLogin: true,
    });
  }
  next();
};

module.exports = { protect, authorize, blockFirstLogin };