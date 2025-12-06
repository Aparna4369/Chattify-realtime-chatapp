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

// Allowed frontend origins
const allowedOrigins = [
  "http://localhost:5173",                   // local frontend
  "https://chattify-frontend.vercel.app"    // replace with your actual Vercel URL
];

// Middleware: CORS
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // allow Postman / non-browser
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// Parse requests
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

// Attach io to each request
app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on("connection", (socket) => {
  console.log(" New user connected:", socket.id);

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    console.log("User joined personal room:", userData._id);
    socket.emit("connected");
  });

  socket.on("joinChat", (chatId) => socket.join(chatId));
  socket.on("typing", (chatId) => socket.to(chatId).emit("typing"));
  socket.on("stopTyping", (chatId) => socket.to(chatId).emit("stopTyping"));
  socket.on("join group", (chatId) => socket.join(chatId));
  socket.on("leave group", (chatId) => socket.leave(chatId));
  socket.on("disconnect", () => console.log(" User disconnected:", socket.id));
});

// Start server
server.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
