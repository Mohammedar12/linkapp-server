import express from "express";
import cors from "cors";
import passport from "passport";
import { createServer } from "http";
import { Server } from "socket.io";
import dbConnect from "./config/db.mjs";
import "./auth/passport.mjs";
import user from "./route/user.mjs";
import userSite from "./route/user_site.mjs";
import links from "./route/links.mjs";
import headers from "./route/headers.mjs";
import errorHandler from "./middleware/middleware.mjs";
import auth from "./middleware/passport.mjs";
import cookieParser from "cookie-parser";
import "./services/redis.mjs";
import limiter from "./utils/limiter.mjs";

const app = express();
const server = createServer(app);

// Socket.IO setup with CORS
const io = new Server(server, {
  cors: {
    origin: [process.env.ALLOWED_ORIGIN],
    credentials: true,
  },
});

// Store user socket connections
const userSockets = new Map();

// Socket.IO connection handler
io.on("connection", (socket) => {
  // Add more comprehensive logging
  console.log(
    `New client connected: ${socket.id} at ${new Date().toISOString()}`
  );

  socket.on("authenticate", (userId) => {
    try {
      // Validate userId
      if (!userId) {
        return socket.emit("authentication_error", {
          message: "Invalid User ID",
        });
      }

      console.log(`User authenticated: ${userId}`);
      userSockets.set(userId, socket.id);
      socket.join(`user_${userId}`);

      // Send more detailed authentication response
      socket.emit("authenticated", {
        status: "connected",
        socketId: socket.id,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error(`Authentication error for user ${userId}:`, error);
      socket.emit("authentication_error", { message: "Authentication failed" });
    }
  });

  socket.on("disconnect", (reason) => {
    console.log(`Client disconnected: ${socket.id} Reason: ${reason}`);

    // More robust socket removal
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        break;
      }
    }
  });

  // Add ping mechanism to detect connection health
  socket.on("ping", () => {
    socket.emit("pong");
  });
});

// Make Socket.IO instance available to routes
app.set("io", io);
app.set("userSockets", userSockets);

const corsOptions = {
  origin: [process.env.ALLOWED_ORIGIN],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use("/", user);

app.use("/sites", userSite);
app.use("/links", links);
app.use("/headers", headers);

app.use(errorHandler);

server.listen(process.env.PORT || 8080, () => {
  dbConnect();
  console.log("Server running with Socket.IO support!");
});

// Utility functions for routes
export const emitToUser = (io, userId, event, data) => {
  io.to(`user_${userId}`).emit(event, data);
};

export const broadcastToAll = (io, event, data) => {
  io.emit(event, data);
};
