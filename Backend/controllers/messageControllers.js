import Chat from "../model/chatModel.js";
import Message from "../model/messageModel.js";
import asyncHandler from "../middleware/asyncHandler.js";


const newMessage = asyncHandler(async (req, res) => {
  const { chatId, sender, text } = req.body;
  if (!chatId || !sender || !text) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // 1️⃣ Create the message
    let message = await Message.create({ chat: chatId, sender, text });

    // 2️⃣ Populate message sender info
    message = await message.populate("sender", "name image email");

    // 3️⃣ Find chat and populate users
    const chat = await Chat.findById(chatId).populate("users", "name image");
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // 4️⃣ Increment unread counts for all users except sender
    if (!chat.unreadCounts) chat.unreadCounts = {};
    chat.users.forEach(user => {
      if (user._id.toString() !== sender) {
        chat.unreadCounts[user._id.toString()] =
          (chat.unreadCounts[user._id.toString()] || 0) + 1;
      }
    });

    // 5️⃣ Update latest message
    chat.latestMessage = message._id;
    await chat.save();

    // 6️⃣ Emit new message to socket.io
    if (req.io) {
      req.io.to(chatId).emit("newMessageAlert", {
        savedMessage: message,
        chat,
        sender: message.sender,
      });
    }

    res.status(201).json({ savedMessage: message, chat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send message" });
  }
});


const getAllMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  
  
  
 
  const chat = await Chat.findOne({
    _id: chatId,
    users: { $elemMatch: { $eq: req.user._id } }
  });
  
  if (!chat) {
    console.log(' ACCESS DENIED: User not in chat', req.user._id, 'chat:', chatId);
    return res.status(403).json({ message: 'Access denied' });
  }
  
  console.log(' User has access to chat');
  
  const messages = await Message.find({ chat: chatId })
    .sort({ createdAt: 1 })
    .populate("sender", "name image email");

  console.log(` Found ${messages.length} messages`);
  
  res.status(200).json(messages);
});

const markMessagesAsRead = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user._id; 

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

   
    chat.unreadCounts[userId.toString()] = 0;
    await chat.save();

    res.status(200).json({ message: "Chat marked as read", chat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to mark chat as read" });
  }
});


const deleteMessage = asyncHandler(async (req, res) => {
  const msg = await Message.findById(req.params.id);

  if (!msg) {
    return res.status(404).json({ message: "Message not found" });
  }


  if (msg.sender.toString() !== req.user._id.toString()) {
    return res.status(401).json({ message: "Not authorized" });
  }

  await msg.deleteOne();

  res.json({ message: "Message deleted" });
});

export { newMessage, getAllMessages, markMessagesAsRead, deleteMessage };
