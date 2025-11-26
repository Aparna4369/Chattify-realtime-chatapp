import express from 'express'
import User from '../model/userModel.js'
import {generateToken} from '../utils/generateToken.js'
import asyncHandler from '../middleware/asyncHandler.js'



 
 const registerUser=asyncHandler(async(req,res)=>{
    try{
    const{name,email,password}=req.body
    console.log(req.body)
    const userExist=await User.findOne({email})
    if(userExist){
        return res.status(400).json
       ( {message:"User already exist"}) }          //if the user exist....
       


       const user=await User.create({
        name,email,password
       })
       if(user){
        generateToken(res,user._id)
         return res.status(201).json({
            _id:user._id,
            name:user.name,
            email:user.email,
            password:user.password,

        })
       
       }else{
        res.status(400)
        throw new Error("Invalid user data")

       }
    }
    catch(error){
        console.error(error.message)
    }
})

const loginUser=asyncHandler(async(req,res)=>{
    try{
        const {email,password}=req.body
        const user=await User.findOne({email})
        if(user &&(await user.matchPassword(password))){
            generateToken(res,user._id)  
             res.json({
            _id:user._id,
            name:user.name,
            email:user.email,

        })         

        }else{
            res.status(401)
            throw new Error("Invalid email or Password")
        }}catch(error){
        console.error(error.message)
    }
       
    
   
} )

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
 
