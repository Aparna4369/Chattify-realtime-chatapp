import express from 'express';
import { createChat,getChat } from '../controllers/chatControllers.js';
import { newMessage,getAllMessages } from '../controllers/messageControllers.js';
import { protect } from '../middleware/authMiddleware.js';


const router=express.Router();
//chat routes
router.post('/create-chat',protect,createChat)
router.get('/get-chat',protect,getChat)

//message routes
router.post('/new-message',protect,newMessage)
router.get('/get-all-messages/:chatId',protect,getAllMessages)


export default router;
