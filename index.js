const express = require("express");
const app = express();
const morgan = require("morgan");
const uuid = require("uuid");
const mongoose = require("mongoose");
const Models = require("./models.js");

const Movies = Models.Movie;
const Users = Models.User;
const Director = Models.Director;
const Genre = Models.Genre;

app.use(express.json());
app.use(morgan("common"));
app.use(express.static("public"));

mongoose
  .connect("mongodb://127.0.0.1:27017/cfDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected to db");
  });

// get all movies
app.get("/movies", async (req, res) => {
  try {
    const movies = await Movies.find()
    res.status(200).json(movies)
  } catch (error) {
    console.error(error)
    res.status(404).send('No movies found!')
  }
});

//get data about a single movie by title
app.get("/movies/:title", async (req, res) => {
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


// return data about a genre by name/title
app.get("/genres/:genreName", async (req, res) => {
  try {
    const genre = await Genre.findOne({ name: req.params.genreName });
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

// return data about director by name 
app.get('/directors/:directorName', async (req,res) =>{
  try {
    const director = await Director.find({name: req.params.directorName})

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


//return info about the genre of a movie
app.get("/movies/directors/:directorName", (req, res) => {
  const { directorName } = req.params;
  const director = movies.find(
    (movie) => movie.director.name === directorName
  ).director;

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(404).send("Genre not found");
  }
});

//get all users
app.get("/users", (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Error: " + err);
    });
});

//create a new user
app.post("/users", async (req, res) => {
  try {
    const user = await Users.findOne({ Name: req.body.name });
    if (user) {
      return res.status(400).send(req.body.Name + " already exists");
    }

    const newUser = await Users.create({
      name: req.body.name,
      password: req.body.password,
      email: req.body.email,
      birthday: req.body.birthday,
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error: " + error);
  }
});


//get a user by Name
app.get("/users/:Name", async (req, res, next) => {
  try {
    const user = await Users.findOne({ Name: req.params.Name });
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error: " + error);
  }
});

// update a user's info, by Name
app.put("/users/:name", async (req, res) => {
  try {
    const updatedUser = await Users.findOneAndUpdate(
      { name: req.params.name },
      {
        $set: {
          name: req.body.name,
          password: req.body.password,
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
app.post("/users/:name/movies/:movieId", async (req, res) => {
  try {
    const updatedUser = await Users.findOneAndUpdate(
      { name: req.params.name },
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
app.delete("/users/:name/movies/:movieId", async (req, res) => {
  try {
    const updatedUser = await Users.findOneAndUpdate(
      { name: req.params.name },
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
app.delete("/users/:name", async (req, res) => {
  try {
    const userToDelete = await Users.findOneAndDelete({
      name: req.params.name,
    });
    if (!userToDelete) {
      res.status(400).send(`user ${req.params.name} was not found`);
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
