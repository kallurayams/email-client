// socket.js
const socketIo = require("socket.io");
let io;

const initializeSocket = (server, corsOptions) => {
  try {
    io = socketIo(server, { cors: corsOptions });

    io.on("connection", (socket) => {
      console.log("New client connected");

      const userId = socket.handshake.query.userId;
      console.log(`User ID: ${userId}`);
      socket.join(userId);

      socket.on("disconnect", () => {
        console.log("Client disconnected");
      });

      socket.on("error", (err) => {
        console.error("Socket error:", err);
      });
    });

    io.on("error", (err) => {
      console.error("Socket.IO error:", err);
    });

    console.log("Socket.IO initialized");
  } catch (err) {
    console.error("Error initializing socket:", err);
  }
};

const startEmailProcessing = (userId) => {
  try {
    if (io) {
      console.log(`Emitting emailProcessingStarted event to user: ${userId}`);
      io.to(userId).emit("emailProcessingStarted");
    } else {
      throw new Error("Socket.IO not initialized");
    }
  } catch (err) {
    console.error("Error starting email processing:", err);
  }
};

module.exports = {
  initializeSocket,
  startEmailProcessing,
};
