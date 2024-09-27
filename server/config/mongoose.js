const mongoose = require("mongoose");
const mongoString = process.env.MONGODB_STRING;
const { logger } = require("../utils/logger");

init = async () => {
    await mongoose
        .connect(mongoString, {
            socketTimeoutMS: 36000,
            connectTimeoutMS: 36000,
        })
        .then(() => {
            logger.info("Successfully connected to the mongodb database.");
        })
        .catch((err) => {
            logger.error("Could not connect to the database. Exiting now...");
            logger.error(err);
            process.exit(1);
        });
};

module.exports = init;