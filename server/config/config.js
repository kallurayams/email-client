require('dotenv').config({path: "./.env"});
const { logger } = require("../utils/logger");

const requiredVars = [
    "PORT",
    "MONGODB_STRING",
    "SERVER_BASE_URL",
    "API_PATH",
    "OAUTH_CLIENT_ID",
    "OAUTH_CLIENT_SECRET",
    "OAUTH_AUTHORITY",
    "JWT_SECRET_KEY",
    "JWT_EXPIRY_TIME",
    "CLIENT_BASE_PATH",
    "CLIENT_REDIRECTION_PATH",
];

for (const varName of requiredVars) {
    if (!process.env[varName]) {
        logger.error(`Missing required environment variable: ${varName}`);
        process.exit(1);
    }
}

module.exports = {
    port: process.env.PORT,
    mongodbString: process.env.MONGODB_STRING,
    oauthClientId: process.env.OAUTH_CLIENT_ID,
    oauthClientSecret: process.env.OAUTH_CLIENT_SECRET,
    serverBaseUrl: process.env.SERVER_BASE_URL,
    apiPath: process.env.API_PATH,
    oauthAuthority: process.env.OAUTH_AUTHORITY,
    jwtSecretKey: process.env.JWT_SECRET_KEY,
    jwtExpiryTime: process.env.JWT_EXPIRY_TIME,
    clientBasePath: process.env.CLIENT_BASE_PATH,
    clientRedirectionPath: process.env.CLIENT_REDIRECTION_PATH,
};