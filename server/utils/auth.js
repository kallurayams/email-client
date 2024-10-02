const jwt = require("jsonwebtoken");
const { logger } = require("./logger");

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const JWT_EXPIRY_TIME = process.env.JWT_EXPIRY_TIME;

const generateToken = (data) => {
  try {
    return jwt.sign(data, JWT_SECRET_KEY, { expiresIn: JWT_EXPIRY_TIME });
  } catch (error) {
    logger.error("Error generating token:", error);
    return null;
  }
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET_KEY);
  } catch (error) {
    logger.error("Error verifying token:", error);
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
