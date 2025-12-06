import express from 'express'
import User from '../model/userModel.js'
import {generateToken} from '../utils/generateToken.js'
import asyncHandler from '../middleware/asyncHandler.js'




 
const registerUser = asyncHandler(async (req, res) => {
  try {
    const { name, email, password } = req.body;

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
      // ✅ IMPORTANT: Get the token AND include it in response
      const token = generateToken(res, user._id);
      
      console.log('✅ Token generated for user:', user._id);

      // ✅ RETURN TOKEN IN RESPONSE BODY
      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        token: token, // ← THIS IS MISSING! ADD IT
        message: "Registration successful"
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
    
    const user = await User.findOne({ email });
    
    if (user && (await user.matchPassword(password))) {
      // ✅ Get token
      const token = generateToken(res, user._id);
      
      console.log('✅ Login token generated');
      
      // ✅ RETURN TOKEN IN RESPONSE BODY
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image || null,
        token: token, // ← ADD THIS
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
 
