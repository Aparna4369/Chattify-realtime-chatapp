import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  console.log('✅ Token generated:', token.substring(0, 20) + '...');
  
  // Cookie settings for cross-origin
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/',
  };
  
  res.cookie("jwt", token, cookieOptions);
  
  console.log('✅ Cookie set with sameSite: none, secure: true');
  
  // ✅ MUST RETURN THE TOKEN
  return token;
};

export { generateToken };