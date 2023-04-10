const express = require("express");
const app = express();
const morgan = require("morgan");
const uuid = require("uuid");

app.use(express.json());
app.use(morgan("common"));
app.use(express.static("public"));

let movies = [
  {
    title: "Inception",
    description:
      "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    director: {
      name: "Christopher Nolan",
      bio: "Christopher Nolan is an English-American film director, producer, and screenwriter. He is best known for directing several highly acclaimed films, including Inception, The Dark Knight trilogy, and Dunkirk.",
      birth: "July 30, 1970",
    },
    genre: {
      name: "Sci-Fi",
      description:
        "A genre that typically deals with imaginative and futuristic concepts, such as advanced science and technology, space exploration, time travel, parallel universes, and extraterrestrial life.",
    },
  },
  {
    title: "Mad Max: Fury Road",
    description:
      "In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler in search for her homeland with the aid of a group of female prisoners, a psychotic worshiper, and a drifter named Max.",
    director: {
      name: "George Miller",
      bio: "George Miller is an Australian film director, producer, and screenwriter. He is best known for directing several films in the Mad Max franchise, including Mad Max, Mad Max: Fury Road, and Mad Max: The Wasteland.",
      birth: "March 3, 1945",
    },
    genre: {
      name: "Action",
      description:
        "A genre that typically involves a protagonist who engages in physical or violent confrontations with antagonists, usually involving car chases, shootouts, explosions, and other high-energy scenes.",
    },
  },
  {
    title: "The Avengers",
    description:
      "Earth's mightiest heroes must come together and learn to fight as a team if they are to stop the mischievous Loki and his alien army from enslaving humanity.",
    director: {
      name: "Joss Whedon",
      bio: "Joss Whedon is an American film and television writer, director, and producer. He is best known for creating several popular TV series, including Buffy the Vampire Slayer and Firefly, and for directing several films in the Marvel Cinematic Universe, including The Avengers and Avengers: Age of Ultron.",
      birth: "June 23, 1964",
    },
    genre: {
      name: "Action",
      description:
        "A genre that typically involves a protagonist who engages in physical or violent confrontations with antagonists, usually involving car chases, shootouts, explosions, and other high-energy scenes.",
    },
  },
];

let users = [
  {
    name: "John Doe",
    id: 1,
    favoriteMovies: [],
  },
  {
    name: "Jane Smith",
    id: 2,
    favoriteMovies: [],
  },
  {
    name: "Bob Johnson",
    id: 3,
    favoriteMovies: [],
  },
  {
    name: "Emily Davis",
    id: 4,
    favoriteMovies: [],
  },
  {
    name: "Mike Wilson",
    id: 5,
    favoriteMovies: [],
  },
];

// get all movies
app.get("/movies", (req, res) => {
  res.status(200).json(movies);
});

//get data about a single movie by title
app.get("/movies/:title", (req, res) => {
  const { title } = req.params;
  const movie = movies.find((movie) => movie.title === title);

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(404).send("Movie not found");
  }
});

//return info about the genre of a movie
app.get("/movies/genre/:genreName", (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find((movie) => movie.genre.name === genreName).genre;

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(404).send("Genre not found");
  }
});

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

//create a new user
app.post("/users", (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser);
  } else {
    res.status(400).send("users need names");
  }
});

// update a users name
app.put("/users/:id", (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send("user not find");
  }
});

//add a movie to a user's favorites
app.post("/users/:id/:movieTitle", (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.favoriteMovies.push(movieTitle);
    res
      .status(200)
      .send(`${movieTitle} has been added to user:${id} favorites`);
  } else {
    res.status(400).send("user not find");
  }
});

//remove a movie from user's favorites
app.delete("/users/:id/:movieTitle", (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter(
      (title) => title !== movieTitle
    );
    res
      .status(200)
      .send(`${movieTitle} has been removed from user:${id} favorites`);
  } else {
    res.status(400).send("user not find");
  }
});

//delete a user
app.delete("/users/:id/", (req, res) => {
  const { id } = req.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    users = users.filter((user) => user.id != id);
    res.status(200).send(`user:${id} has been deleted`);
  } else {
    res.status(400).send("user not find");
  }
});

app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(8080, () => {
  console.log("Your app is listening on port 8080.");
});
