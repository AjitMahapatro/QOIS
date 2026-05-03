import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BE_BASE_URL}/api/auth/google/callback`
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

          // Link googleId if missing
          if (!user.googleId) user.googleId = profile.id;

          // Update profile picture
          if (!user.profilePicture) user.profilePicture = picture;

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
        done(error, null);
      }

    }
  )
);


passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});
