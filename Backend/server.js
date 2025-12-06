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

// ✅ Updated: Add pattern matching for Vercel preview URLs
const allowedOrigins = [
  "http://localhost:5173",
  "https://chattify-realtime-chatapp.vercel.app",
  /^https:\/\/chattify-realtime-chatapp-.*\.vercel\.app$/ // Pattern for all preview deployments
];

// ✅ CORS Middleware - FIXED (remove duplicate app.options)
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      
      // Check if origin matches any allowed origin (string or regex)
      const isAllowed = allowedOrigins.some(allowedOrigin => {
        if (typeof allowedOrigin === 'string') {
          return allowedOrigin === origin;
        } else if (allowedOrigin instanceof RegExp) {
          return allowedOrigin.test(origin);
        }
        return false;
      });
      
      if (isAllowed) {
        return callback(null, true);
      } else {
        console.log("CORS blocked for origin:", origin);
        return callback(new Error("Not allowed by CORS"), false);
      }
    },
    credentials: true,
    exposedHeaders: ['set-cookie'],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"]
  })
);

// ✅ REMOVED: app.options('*', cors({...})) - NOT NEEDED

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ ADD Debug Route (important for testing)
app.get('/api/debug/cookies', (req, res) => {
  console.log('Cookies received:', req.cookies);
  console.log('Headers:', req.headers);
  res.json({
    cookies: req.cookies,
    headers: req.headers,
    message: 'Cookie debug info'
  });
});

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
  console.log(`Allowed origins:`, allowedOrigins);
});