const jwt = require("jsonwebtoken");
const config = require("../config/config");
const { logger } = require("./logger");

module.exports = {
    generateToken: async (data) => {
        try {
            const key = config.jwtSecretKey;
            const expiry = config.jwtExpiryTime;
            return jwt.sign(data, key, { expiresIn: expiry });
        } catch (error) {
            logger.error(error);
            return false;
        }
    },
    verifyToken: async (token) => {
        try {
            const key = config.jwtSecretKey;
            let decoded = jwt.verify(token, key);
            if (!decoded) {
                return false;
            }
            return decoded;
        } catch (error) {
            logger.error(error);
            return false;
        }
    }
};