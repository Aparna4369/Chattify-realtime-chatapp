import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  console.log('Token generated, setting cookie.');
  
  // ALWAYS use these settings for cross-origin
  const cookieOptions = {
    httpOnly: true,
    secure: true, // ✅ ALWAYS true for HTTPS
    sameSite: 'none', // ✅ MUST be 'none' for cross-origin
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/', // ✅ Important: Set path to root
    domain: '.onrender.com' // ✅ Try with leading dot
  };
  
  console.log('Cookie options:', cookieOptions);
  
  res.cookie("jwt", token, cookieOptions);
  
  return token;
};

export { generateToken };