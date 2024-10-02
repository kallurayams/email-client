const router = require("express").Router();

const authRouter = require("./auth");
const syncingRouter = require("./sync");
const outlookRouter = require("./outlook");
const emailRouter = require("./email");

router.use(process.env.API_BASE_PATH + "/auth", authRouter);
router.use(process.env.API_BASE_PATH + "/sync", syncingRouter);
router.use(process.env.API_BASE_PATH + "/outlook", outlookRouter);
router.use(process.env.API_BASE_PATH + "/email", emailRouter);

module.exports = router;
