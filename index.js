const express = require("express");
const app = express();
const morgan = require("morgan");
const uuid = require("uuid");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Models = require("./models.js");
const cors = require("cors");
const { check, validationResult } = require("express-validator");

const Movies = Models.Movie;
const Users = Models.User;
const Director = Models.Director;
const Genre = Models.Genre;

let allowedOrigins = [
  "https://filmforge.herokuapp.com",
  "http://localhost:1234",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        let message =
          "The CORS policy for this application doesn’t allow access from origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan("common"));
app.use(express.static("public"));

let auth = require("./auth")(app);
const passport = require("passport");
require("./passport");

mongoose
  .connect("mongodb+srv://karoun:mK%407.wrlwro@cluster0.8taly.mongodb.net/FilmForgeDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected to db");
  });

app.get("/", (req, res) => {
  res.send("Welcome to FilmForge");
});

// get all movies
app.get("/movies",  passport.authenticate("jwt", { session: false }),async (req, res) => {
  try {
    const movies = await Movies.find({}).populate("director").populate("genre");
    res.status(200).json(movies);
  } catch (error) {
    console.error(error);
    res.status(404).send("No movies found!");
  }
});

// get data about a single movie by id
app.get(
  "/movies/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const movie = await Movies.findById(req.params.id);
      if (!movie) {
        res.status(404).send("Movie not found!");
      } else {
        res.status(200).json(movie);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send(error);
    }
  }
);

// return data about a genre by /title
app.get(
  "/genres/:genre",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const genre = await Genre.findOne({ name: req.params.genre });
      if (!genre) {
        res.status(404).send("Genre not found!");
      } else {
        res.status(200).json(genre);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Error: " + error);
    }
  }
);

// return data about director by
app.get(
  "/directors/:director",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const director = await Director.find({ name: req.params.director });

      if (!director) {
        res.status(404).send("Director not found!");
      } else {
        res.status(200).json(director);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Error: " + error);
    }
  }

);



// Get a single user by username
app.get("/users/:Username", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await Users.findOne({ Username: req.params.Username }).populate('favoriteMovies');
    if (!user) {
      res.status(404).send("User not found!");
    } else {
      res.status(200).json(user);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error: " + error);
  }
});



//create a new user
app.post(
  "/users",
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  async (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    try {
      const user = await Users.findOne({ Username: req.body.Username });
      if (user) {
        return res.status(400).send(req.body.Username + " already exists");
      }

      const newUser = await Users.create({
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
      });

      res.status(201).json(newUser);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error: " + error);
    }
  }
);

// update a user's info, by name
app.put(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  async (req, res) => {
    let hashedPassword = Users.hashPassword(req.body.Password);
    try {
      const updatedUser = await Users.findOneAndUpdate(
        { Username: req.params.Username },
        {
          $set: {
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          },
        },
        { new: true } // This line makes sure that the updated document is returned
      );

      res.json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error: " + error);
    }
  }
);


// Add a movie to a user's list of favorites
app.post(
  "/users/:Username/movies/:movieId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const user = await Users.findOne({ Username: req.params.Username });
      if (!user) {
        return res.status(400).send(`User ${req.params.Username} was not found`);
      }

      const movie = await Movies.findOne({ _id: req.params.movieId });
      if (!movie) {
        return res.status(400).send(`Movie with id ${req.params.movieId} was not found`);
      }

      // Check if the movie is already in the user's list of favorites
      if (user.favoriteMovies.includes(movie._id)) {
        return res.status(400).send("Movie is already in the user's list of favorites");
      }

      // Add the movie to the user's list of favorites
      user.favoriteMovies.push(movie._id);
      await user.save();
      
      res.status(200).send(`Movie with id ${req.params.movieId} was added to the list of favorites of user ${req.params.Username}`);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error: " + error);
    }
  }
);

//remove a movie from user's favorites
app.delete(
  "/users/:Username/movies/:movieId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const updatedUser = await Users.findOneAndUpdate(
        { Username: req.params.Username },
        { $pull: { favoriteMovies: req.params.movieId } },
        { new: true }
      );
      res.json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).send(error);
    }
  }
);

//delete a user
app.delete(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const userToDelete = await Users.findOneAndDelete({
        Username: req.params.Username,
      });
      if (!userToDelete) {
        res.status(400).send(`user ${req.params.Username} was not found`);
      } else {
        res.status(200).json(userToDelete);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Error: " + error);
    }
  }
);

app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).send("Something broke!");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Listening on port " + PORT);
});
