const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const User = require("../models/User");
const BlacklistedToken = require('../models/BlacklistedToken');

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extracts JWT from the Authorization header
  secretOrKey: process.env.JWT_SECRET,
  passReqToCallback: true // Allows access to the req object in the callback
};

module.exports = passport => {
  passport.use(
    new JwtStrategy(opts, async(req,jwt_payload, done) => {
      try {
        // Extract the token from the request header
        const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
  
        // Check if the token is blacklisted
        const isBlacklisted = await BlacklistedToken.findOne({ token });
        if (isBlacklisted) {
          return done(null, false, { message: 'Token is blacklisted' });
        }
  
        // Find the user in the database
        const user = await User.findById(jwt_payload.id);
        if (user) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'User not found' });
        }
      } catch (err) {
        return done(err, false);
      }
    })
  );
};