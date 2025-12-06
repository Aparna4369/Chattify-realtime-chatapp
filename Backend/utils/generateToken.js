import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  console.log('Token generated, setting cookie. NODE_ENV:', process.env.NODE_ENV);
  
  const isProduction = process.env.NODE_ENV === 'production';
  
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  };
  
  // In production, ensure sameSite: 'none' and secure: true
  if (isProduction) {
    cookieOptions.sameSite = 'none';
    cookieOptions.secure = true;
  }
  
  console.log('Cookie options:', cookieOptions);
  
  res.cookie("jwt", token, cookieOptions);

  return token;
};

export { generateToken };