import jwt from 'jsonwebtoken';

const generateToken = (user) => {

  return jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '30d'
    }
  );

};

const sendTokenResponse = (user, statusCode, res) => {

  const token = generateToken(user);

  res.status(statusCode).json({

    success: true,
    token,

    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture
    }

  });

};

export { sendTokenResponse };
