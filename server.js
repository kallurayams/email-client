require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const http = require("http");
const path = require("path");

const { logger } = require("./server/utils/logger");
const {
  initializeSocket,
  startEmailProcessing,
} = require("./server/config/socket");
const mongoInitiate = require("./server/config/mongoose");
const routes = require("./server/routes/routes");
const app = express();
const server = http.createServer(app);

// Initialize socket with CORS options
initializeSocket(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

// Connect to MongoDB
mongoInitiate();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Logging middleware
app.all("*/api*", (req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use(routes);

// Test route for email processing
app.get("/test-email-processing", (req, res) => {
  const userId = "d73fc3ac-f160-49c8-b4d7-41edba2d033c";
  startEmailProcessing(userId);
  res.send("Email processing started event emitted");
});

// Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
