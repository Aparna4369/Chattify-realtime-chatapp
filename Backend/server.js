import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

dotenv.config();

const PORT = process.env.PORT || 5001;
connectDB();

const app = express();

// ✅ Add ALL your real frontend URLs here
const allowedOrigins = [
  "http://localhost:5173",
  "https://chattify-realtime-chatapp.vercel.app",
  "https://chattify-realtime-chatapp-2gteo70gc-aparna-a-ss-projects.vercel.app"
];

// ✅ CORS Middleware (fixes all errors)
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow Postman / server-to-server
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS blocked for this origin: " + origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API routes
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

// Create server
const server = http.createServer(app);
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Attach io
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket.io
io.on("connection", (socket) => {
  console.log(" New user connected:", socket.id);

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("joinChat", (chatId) => socket.join(chatId));
  socket.on("typing", (chatId) => socket.to(chatId).emit("typing"));
  socket.on("stopTyping", (chatId) => socket.to(chatId).emit("stopTyping"));

  socket.on("join group", (chatId) => socket.join(chatId));
  socket.on("leave group", (chatId) => socket.leave(chatId));

  socket.on("disconnect", () =>
    console.log(" User disconnected:", socket.id)
  );
});

// Start server
server.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
