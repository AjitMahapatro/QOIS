import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,

      callbackURL:
        process.env.NODE_ENV === "production"
          ? "https://qois-backend.onrender.com/auth/google/callback"
          : "http://localhost:5000/auth/google/callback",
    },

    async (accessToken, refreshToken, profile, done) => {
      try {

        const email = profile.emails[0].value;
        const picture = profile.photos[0].value;

        let user = await User.findOne({
          $or: [
            { googleId: profile.id },
            { email }
          ]
        });

        if (user) {

          if (!user.googleId)
            user.googleId = profile.id;

          if (!user.profilePicture)
            user.profilePicture = picture;

          await user.save();

          return done(null, user);

        } else {

          const newUser = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email,
            profilePicture: picture
          });

          return done(null, newUser);
        }

      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
