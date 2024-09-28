const router = require("express").Router();
const config = require("../config/config");

const authRouter = require("./authenticate");
const syncingRouter = require("./syncing");
const webhookRouter = require("./webhook");

router.use(config.apiPath + "/authenticate", authRouter);
router.use(config.apiPath + "/sync", syncingRouter);
router.use(config.apiPath + "/webhook", webhookRouter);


module.exports = router;