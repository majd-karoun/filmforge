const jwtSecret = 'your_jwt_secret'; // This has to be the same key used in the JWTStrategy

const jwt = require('jsonwebtoken'),
  passport = require('passport');

require('./passport'); // Your local passport file


let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username, // This is the username you’re encoding in the JWT
    expiresIn: '7d', // This specifies that the token will expire in 7 days
    algorithm: 'HS256' // This is the algorithm used to “sign” or encode the values of the JWT
  });
}


/* POST login. */
module.exports = (router) => {
  router.post('/login', (req, res) => {
    console.log('Received login request:', req.body); // Add this line to log the request body
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error) {
        console.log('Error:', error);
        return res.status(400).json({
          message: 'Something is not right',
          user: user,
        });
      }
  
      if (!user) {
        console.log('User not found:', info);
        return res.status(400).json({
          message: 'Incorrect username or password.',
          user: user,
        });
      }
  
      req.login(user, { session: false }, (error) => {
        if (error) {
          console.log('Login error:', error);
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
  
}