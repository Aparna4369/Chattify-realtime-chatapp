import Chat from "../model/chatModel.js";
import asyncHandler from "../middleware/asyncHandler.js";
import mongoose from 'mongoose'
import User from "../model/userModel.js";
import Message from "../model/messageModel.js";

const createChat = asyncHandler(async (req, res) => {
 
  
  const { userId } = req.body;
  console.log(' Requested userId:', userId);
  
  if (!userId) {
    return res.status(400).json({ message: "UserId is required" });
  }

  try {
    console.log(' userId type:', typeof userId);

   
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    
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
      console.log(' Existing chat found:', existingChat._id);
      return res.status(200).json(existingChat);
    }

    console.log(' Creating new chat...');
    
    
    const chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
      unreadCounts: { 
        [req.user._id.toString()]: 0, 
        [userId]: 0 
      },
    
    };

    

    const createdChat = await Chat.create(chatData);
    const fullChat = await Chat.findById(createdChat._id).populate("users", "-password");

    console.log(' New chat created:', fullChat._id);
    console.log(' Participants:', fullChat.users.map(u => u.email));

    res.status(201).json(fullChat);
    
  } catch (error) {
    console.error(' CREATE CHAT ERROR:', error);
    console.error(' Error stack:', error.stack);
    res.status(500).json({ 
      message: "Failed to create chat", 
      error: error.message 
    });
  }
});

const getChat = asyncHandler(async (req, res) => {
  console.log('🔐 === GET CHAT ===');
  console.log('🔐 User:', req.user.email, req.user._id);
  
  const chats = await Chat.find({
    users: { $elemMatch: { $eq: req.user._id } },
  })
    .populate("users", "-password")
    .populate("groupAdmin", "-password")
    .populate("latestMessage")
    .sort({ updatedAt: -1 });

  console.log(`📊 Found ${chats.length} chats for ${req.user.email}`);
  
  // Log each chat
  chats.forEach(chat => {
    const participantEmails = chat.users.map(u => u.email);
    console.log(`   Chat ${chat._id}: ${participantEmails.join(', ')}`);
  });

  res.status(200).json(chats);
});


const createGroupChat = asyncHandler(async (req, res) => {
 

  const { users, name, adminSettings } = req.body; // ADD adminSettings

  if (!users || !name) {
    console.log(' Missing fields:', { users, name });
    return res.status(400).json({ 
      message: "Please provide all fields",
      required: ["users", "name"] 
    });
  }

  try {
    let allUsers;
    
    // Handle both array and string formats
    if (Array.isArray(users)) {
      console.log(' Users received as array');
      allUsers = users;
    } else if (typeof users === 'string') {
      console.log(' Users received as string, parsing JSON...');
      try {
        allUsers = JSON.parse(users);
      } catch (parseError) {
        console.error(' JSON parse error:', parseError);
        return res.status(400).json({ 
          message: "Invalid users format. Must be valid JSON array",
          error: parseError.message 
        });
      }
    } else {
      return res.status(400).json({ 
        message: "Users must be an array or JSON string" 
      });
    }

    
    if (allUsers.length < 2) {
      return res.status(400).json({ 
        message: "At least 2 users required to form a group" 
      });
    }

    
    const currentUserId = req.user._id.toString();
    const userStrings = allUsers.map(u => u.toString());
    
   
   
    if (!userStrings.includes(currentUserId)) {
      allUsers.push(currentUserId);
     
    }

    console.log('Final user list:', allUsers);

    
    const unreadCounts = {};
    allUsers.forEach(u => {
      unreadCounts[u.toString()] = 0;
    });

   

   
    const groupChat = await Chat.create({
      chatName: name,
      users: allUsers,
      isGroupChat: true,
      groupAdmin: req.user._id,
      unreadCounts,
      adminSettings: adminSettings || {  
        canAddMembers: true,
        onlyAdminCanDelete: true,
        adminPermissions: ['add_members', 'remove_members', 'delete_group']
      }
    });

    console.log(' Group chat created:', groupChat._id);
    console.log(' Admin settings:', groupChat.adminSettings);

    // Populate and return
    const fullGroupChat = await Chat.findById(groupChat._id)
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage");

    console.log('Group participants:', 
      fullGroupChat.users.map(u => `${u.name} (${u.email})`).join(', '));

    res.status(201).json({
      success: true,
      message: "Group chat created successfully",
      chat: fullGroupChat
    });
    
  } catch (error) {
    console.error('GROUP CREATION ERROR:', error.message);
    console.error(' Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      message: "Failed to create group chat", 
      error: error.message 
    });
  }
});


const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { chatName },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    return res.status(404).json({ message: "Group not found" });
  }

  res.json(updatedChat);
});

const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;
  


  try {
    
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({ 
        success: false,
        message: "Chat not found" 
      });
    }
    
    
    if (!chat.isGroupChat) {
      return res.status(400).json({ 
        success: false,
        message: "This is not a group chat" 
      });
    }
    
    // Check if user is admin
    if (chat.groupAdmin.toString() !== req.user._id.toString()) {
      console.log(' User is not admin');
      return res.status(403).json({ 
        success: false,
        message: "Only admin can add members to the group" 
      });
    }
    
    // Check if user already in group
    const isUserInGroup = chat.users.some(user => 
      user.toString() === userId.toString()
    );
    
    if (isUserInGroup) {
      return res.status(400).json({ 
        success: false,
        message: "User is already in the group" 
      });
    }
    
    // Check if user exists
    const userToAdd = await User.findById(userId);
    if (!userToAdd) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }
    
    // Add user to group
    chat.users.push(userId);
    
    // Initialize unread count for new user
    if (!chat.unreadCounts) chat.unreadCounts = {};
    chat.unreadCounts[userId.toString()] = 0;
    
    await chat.save();
    
    // Populate and return updated chat
    const updatedChat = await Chat.findById(chatId)
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    
    console.log(' User added to group:', userToAdd.email);
    
    res.status(200).json({
      success: true,
      message: "Member added successfully",
      chat: updatedChat
    });
    
  } catch (error) {
    console.error(' ADD TO GROUP ERROR:', error.message);
    res.status(500).json({ 
      success: false,
      message: "Failed to add member", 
      error: error.message 
    });
  }
});


const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;
  
 

  try {
   
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({ 
        success: false,
        message: "Chat not found" 
      });
    }
    
  
    if (!chat.isGroupChat) {
      return res.status(400).json({ 
        success: false,
        message: "This is not a group chat" 
      });
    }
    
    // Check if user is admin OR user is removing themselves
    const isAdmin = chat.groupAdmin.toString() === req.user._id.toString();
    const isRemovingSelf = userId.toString() === req.user._id.toString();
    
    if (!isAdmin && !isRemovingSelf) {
      
      return res.status(403).json({ 
        success: false,
        message: "Only admin can remove other members" 
      });
    }
    
   
    const isUserInGroup = chat.users.some(user => 
      user.toString() === userId.toString()
    );
    
    if (!isUserInGroup) {
      return res.status(400).json({ 
        success: false,
        message: "User is not in the group" 
      });
    }
    
   
    if (isRemovingSelf && isAdmin) {
     
      const otherMembers = chat.users.filter(user => 
        user.toString() !== userId.toString()
      );
      
      if (otherMembers.length === 0) {
        return res.status(400).json({ 
          success: false,
          message: "Admin cannot leave the group as the only member. Delete the group instead." 
        });
      }
    }
   
    await Chat.findByIdAndUpdate(
      chatId,
      { 
        $pull: { users: userId },
        $unset: { [`unreadCounts.${userId}`]: "" } // Remove unread count
      },
      { new: true }
    );
    
   
    if (userId.toString() === chat.groupAdmin.toString()) {
      const otherMembers = chat.users.filter(user => 
        user.toString() !== userId.toString()
      );
      
      if (otherMembers.length > 0) {
        await Chat.findByIdAndUpdate(
          chatId,
          { groupAdmin: otherMembers[0] },
          { new: true }
        );
      }
    }
    
    const updatedChat = await Chat.findById(chatId)
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    
    console.log(' User removed from group:', userId);
    
    res.status(200).json({
      success: true,
      message: isRemovingSelf ? "You left the group" : "Member removed successfully",
      chat: updatedChat
    });
    
  } catch (error) {
    console.error(' REMOVE FROM GROUP ERROR:', error.message);
    res.status(500).json({ 
      success: false,
      message: "Failed to remove member", 
      error: error.message 
    });
  }
});

const deleteChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  
 
  
  try {
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({ 
        success: false,
        message: "Chat not found" 
      });
    }
    
   
    const isUserInChat = chat.users.some(user => 
      user.toString() === req.user._id.toString()
    );
    
    if (!isUserInChat) {
      return res.status(403).json({ 
        success: false,
        message: "You don't have permission to delete this chat" 
      });
    }
    
    
    if (chat.isGroupChat) {
      const isAdmin = chat.groupAdmin.toString() === req.user._id.toString();
      
      if (!isAdmin) {
        return res.status(403).json({ 
          success: false,
          message: "Only group admin can delete the group" 
        });
      }
      
      
      if (chat.adminSettings?.onlyAdminCanDelete === false) {
        return res.status(403).json({ 
          success: false,
          message: "Group deletion is restricted by admin settings" 
        });
      }
    }
    
    
    await Chat.findByIdAndDelete(chatId);
    
    console.log(' Chat deleted successfully');
    
    res.status(200).json({ 
      success: true, 
      message: chat.isGroupChat ? "Group chat deleted" : "Chat deleted" 
    });
    
  } catch (error) {
    console.error(' DELETE CHAT ERROR:', error.message);
    res.status(500).json({ 
      success: false,
      message: "Failed to delete chat", 
      error: error.message 
    });
  }
});





export { createChat, getChat,createGroupChat,renameGroup,addToGroup,removeFromGroup ,deleteChat};
