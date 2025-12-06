import express from 'express'
import User from '../model/userModel.js'
import {generateToken} from '../utils/generateToken.js'
import asyncHandler from '../middleware/asyncHandler.js'




 
const registerUser = asyncHandler(async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log("REQ.BODY:", req.body);
    console.log("REQ.FILE:", req.file); // <-- image file

    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      image: req.file ? `/uploads/${req.file.filename}` : null,
    });

    if (user) {
      generateToken(res, user._id);

      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
      });
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error" });
  }
});


const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 LOGIN ATTEMPT for email:', email);
    
    const user = await User.findOne({ email });
    console.log('🔐 User found in DB:', user?._id, user?.email);
    
    if (user && (await user.matchPassword(password))) {
      console.log('✅ Password correct, generating token for user:', user._id);
      
      
      res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
        path: '/'
      });
      
      generateToken(res, user._id);
      
      console.log('Login successful, sending response');
      
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image || null,
         token: token, 
          message: 'Login successful'
      });
    } else {
      console.log(' Login failed - invalid credentials');
      res.status(401);
      throw new Error("Invalid email or Password");
    }
  } catch (error) {
    console.error(' Login error:', error.message);
    res.status(500).json({ message: "Server Error" });
  }
});



const logoutUser=asyncHandler(async(req,res)=>{
    res.cookie('jwt',"",{
        httpOnly:true,
        expires:new Date(0),

    })
    res.status(200).json({message:"Logged Out Successfully"})
})
const getAllUsers=asyncHandler(async(req,res)=>{
   try{
     const users=await User.find().select('-password')
    res.json(users)
   }catch(error){
    res.status(500).json({message:'Server Error'})
   }

})
 


 export {registerUser,loginUser,logoutUser,getAllUsers}
 
