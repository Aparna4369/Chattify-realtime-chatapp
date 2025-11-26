import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.cookie("jwt", token, {
    httpOnly: true,       // cannot be accessed via JavaScript
    secure: false,        // set true only for HTTPS (production)
    sameSite: "lax",      // helps with cross-site cookies
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  return token;
};

export { generateToken };
