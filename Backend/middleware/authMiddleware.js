import jwt from 'jsonwebtoken';
import asyncHandler from './asyncHandler.js';
import User from '../model/userModel.js';

const protect = asyncHandler(async(req, res, next) => {
  let token;
  token = req.cookies?.jwt;

  console.log('=== AUTH DEBUG ===');
  console.log('Cookie received:', req.cookies);
  console.log('JWT token exists:', !!token);

  if(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded JWT:', decoded);
      console.log('Decoded userId:', decoded.userId);
      
      req.user = await User.findById(decoded.userId).select("-password");
      console.log('Found user:', req.user?._id, req.user?.email);
      
      if(!req.user) {
        console.log('ERROR: User not found in DB');
        return res.status(401).json({ message: 'User not found' });
      }
      
      next();
    } catch(error) {
      console.log('JWT Error:', error.message);
      res.status(401).json({ message: "Not authorized, invalid token" });
    }
  } else {
    console.log('ERROR: No JWT token in cookies');
    res.status(401).json({ message: "Not Authorized, no token" });
  }
});

export {protect}