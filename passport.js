const passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  Models = require('./models.js'),
  passportJWT = require('passport-jwt');

let Users = Models.User,
  JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;

  
  passport.use(new LocalStrategy({
    usernameField: 'Username',
    passwordField: 'Password'
  }, async (username, password, callback) => {
    try {
      console.log(username + '  ' + password);
      const user = await Users.findOne({ Username: username });
  
      if (!user) {
        console.log('incorrect username');
        return callback(null, false, { message: 'Incorrect username.' });
      }
  
      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        console.log('incorrect password');
        return callback(null, false, { message: 'Incorrect password.' });
      }
  
      console.log('finished');
      return callback(null, user);
    } catch (error) {
      console.log(error);
      return callback(error);
    }
  }));
  

passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'your_jwt_secret'
}, (jwtPayload, callback) => {
  return Users.findById(jwtPayload._id)
    .then((user) => {
      return callback(null, user);
    })
    .catch((error) => {
      return callback(error)
    });
}));