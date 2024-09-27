const router = require("express").Router();
const config = require("../config/config");

const authRouter = require("./authenticate");
const syncingRouter = require("./syncing");

router.use(config.apiPath + "/authenticate", authRouter);
router.use(config.apiPath + "/sync", syncingRouter);


module.exports = router;