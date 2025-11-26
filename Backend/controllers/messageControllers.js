import Chat from "../model/chatModel.js";
import Message from "../model/messageModel.js";
import asyncHandler from "../middleware/asyncHandler.js";

const newMessage=asyncHandler(async(req,res)=>{
    try{
       
       const {chatId, sender, text}=req.body;
       if(!chatId ||!sender||!text){
        return res.status(400).json({message:"Missing required fields"})
       }
    const message=new Message(req.body)
    const savedMessage=await message.save()


    const currentChat=await Chat.findByIdAndUpdate(
        {_id:chatId},
        {
            latestMessage:savedMessage._id,
            $inc:{unreadMessageCount:1},
        },
        {new:true}
    );
    res.status(201).json({
        message:"Message sent successfully",
        savedMessage,
        currentChat,
    })
       

    }catch(error){
        res.status(400).json({
            message:error.message,
           
        })

    }
})


const getAllMessages=asyncHandler(async(req,res)=>{
    try{
    const allMessages=await Message.find({chatId:req.params.chatId})
    .sort({createdAt:1})
    .populate("sender","name pic email")
    res.status(201).json({
        message:"Message fetched successfully",
        allMessages,
    })
    }catch(error){
        res.status(400).json({
            message:error.message
        })
    }

})

export {newMessage,getAllMessages}