import express from 'express';
import { 
  createChat,
  getChat,
  createGroupChat,
  removeFromGroup,
  addToGroup,
  renameGroup,
  deleteChat  
} from '../controllers/chatControllers.js';

import { 
  newMessage,
  getAllMessages,
  markMessagesAsRead,
  deleteMessage 
} from '../controllers/messageControllers.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// CHAT ROUTES
router.post('/create-chat', protect, createChat);
router.get('/get-chat', protect, getChat);
router.post('/group', protect, createGroupChat);
router.put('/rename', protect, renameGroup);
router.put('/addToGroup', protect, addToGroup);
router.put('/removeFromGroup', protect, removeFromGroup);
router.delete('/chat/:chatId', protect, deleteChat); 


router.put('/:chatId/read', protect, markMessagesAsRead);


router.post('/new-message', protect, newMessage);
router.get('/get-all-messages/:chatId', protect, getAllMessages);
router.delete('/message/:id', protect, deleteMessage); 

export default router;