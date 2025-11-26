import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import cookieParser from 'cookie-parser';
import chatRoutes from './routes/chatRoutes.js';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

dotenv.config();

const port = process.env.PORT || 3000;
connectDB();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

// ✅ Create HTTP server and Socket.IO instance
const server = http.createServer(app);
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// ✅ Handle socket connections
io.on("connection", (socket) => {
  console.log(" New user connected:", socket.id);

  // When user joins a chat
  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log(` User joined chat: ${chatId}`);
  });

  socket.on("newMessage", (messageData) => {
  const chatId = messageData.chatId;
  console.log("New message received:", messageData.text);
  socket.to(chatId).emit("messageReceived", messageData);
});

socket.on("notifyNewMessage", (msg) => {
  socket.broadcast.emit("newMessageAlert", msg);
});
socket.on("clearNotifications", () => {
  socket.emit("notificationsCleared");
});




  // When someone is typing
  socket.on("typing", (chatId) => {
    console.log(` Typing in chat: ${chatId}`);
    socket.to(chatId).emit("typing");
  });

  // When typing stopped
  socket.on("stopTyping", (chatId) => {
    console.log(` Stop typing in chat: ${chatId}`);
    socket.to(chatId).emit("stopTyping");
  });

  // When user disconnects
  socket.on("disconnect", () => {
    console.log(" User disconnected:", socket.id);
  });
});

// ✅ Start server
server.listen(port, '::', () => {
  console.log('Listening request on the port', port);
});
