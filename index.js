const express = require("express");
const app = express();
const morgan = require("morgan");
const uuid = require("uuid");
const bodyParser = require("body-parser")
const mongoose = require("mongoose");
const Models = require("./models.js");

const Movies = Models.Movie;
const Users = Models.User;
const Director = Models.Director;
const Genre = Models.Genre;


app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(morgan("common"));
app.use(express.static("public"));


let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

mongoose
  .connect("mongodb://127.0.0.1:27017/cfDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected to db");
  });

// get all movies
app.get("/movies",passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const movies = await Movies.find()
    res.status(200).json(movies)
  } catch (error) {
    console.error(error)
    res.status(404).send('No movies found!')
  }
});

//get data about a single movie by title
app.get("/movies/:title",passport.authenticate('jwt', { session: false }), async (req, res) => {
 try {
   const movie = await Movies.findOne({
    title: req.params.title
   })
   if (!movie){
    res.status(404).send('Movie not found!')
   }else{
    res.status(200).json(movie)
   }
 } catch (error) {
  console.error(error)
  res.status(500).send(error)
 }
});


// return data about a genre by /title
app.get("/genres/:genre",passport.authenticate('jwt', { session: false }), async (req, res) => {
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
});

// return data about director by  
app.get('/directors/:director',passport.authenticate('jwt', { session: false }), async (req,res) =>{
  try {
    const director = await Director.find({name: req.params.director})

    if(!director){
      res.status(404).send("Director not found!")
    }else{
      res.status(200).json(director)
    }
  } catch (error) {
    console.error(error)
    res.status(500).send("Error: " + error)
  }
})





//create a new user
app.post("/users", async (req, res) => {
  try {
    const user = await Users.findOne({ Username: req.body.Username });
    if (user) {
      return res.status(400).send(req.body.Username + " already exists");
    }

    const newUser = await Users.create({
      Username: req.body.Username,
      Password: req.body.Password,
      email: req.body.email,
      birthday: req.body.birthday,
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error: " + error);
  }
});



// update a user's info, by name 
app.put("/users/:Username",passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const updatedUser = await Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
         Username: req.body.Username,
          Password: req.body.Password,
          email: req.body.email,
          birthday: req.body.birthday
        },
      },
      { new: true } // This line makes sure that the updated document is returned
    );

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error: " + error);
  }
});

//add a movie to a user's list of favorites
app.post("/users/:/movies/:movieId",passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const updatedUser = await Users.findOneAndUpdate(
      { Username: req.params.Username },
      { $addToSet: { favoriteMovies: req.params.movieId } },
      { new: true }
    );
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error: " + error);
  }
});

//remove a movie from user's favorites
app.delete("/users/:/movies/:movieId",passport.authenticate('jwt', { session: false }), async (req, res) => {
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
});

//delete a user
app.delete("/users/:Username",passport.authenticate('jwt', { session: false }), async (req, res) => {
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
});

app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(8080, () => {
  console.log("Your app is listening on port 8080.");
});
