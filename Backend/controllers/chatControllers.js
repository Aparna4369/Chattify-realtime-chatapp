import Chat from "../model/chatModel.js";
import asyncHandler from "../middleware/asyncHandler.js";

const createChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "UserId is required" });
  }

  // Check if a chat already exists between these two users
  let existingChat = await Chat.findOne({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  if (existingChat) {
    return res.status(200).json(existingChat);
  }

  // Create new chat
  const chatData = {
    chatName: "sender",
    isGroupChat: false,
    users: [req.user._id, userId],
  };

  try {
    const createdChat = await Chat.create(chatData);
    const fullChat = await Chat.findById(createdChat._id).populate(
      "users",
      "-password"
    );

    res.status(201).json({
      message: "Chat created successfully",
      chat: fullChat,
    });
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({ message: "Failed to create chat" });
  }
});

const getChat = asyncHandler(async (req, res) => {
  try {
    const chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      message: "Chats fetched successfully",
      chats,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});
export {createChat,getChat}

