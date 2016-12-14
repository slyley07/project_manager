const LocalStrategy = require('passport-local').Strategy
const User = require('../app/models/user');
const config = require('./main.js');

module.exports = function(passport) {
  passport.use('local', new LocalStrategy({
      session: false
    },
    function(username, password, done) {
      User.findOne({username: username}, function(err, user) {
        if (err) {
          return done(err)
        }

        if (!user) {
          return done(null, false)
        } else {
          user.comparePassword(password, function(err, isMatch) {
            if (err) {
              console.log(err);
              return done(null, false)
            } else {
              return done(null, user)
            }
          })
        }
      })
    }
  ))

  passport.serializeUser(function(user, done) {
    done(null, user.id)
  })

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      return done(err, user)
    })
  })
}
