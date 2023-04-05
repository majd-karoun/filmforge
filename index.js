const express = require("express");
const app = express();
const morgan = require("morgan");
const movies = require("./movies.json");

app.use(morgan("common"));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("Welcome! to FilmForge");
});

app.get("/movies", (req, res) => {
  res.json(movies);
});


app.use((err,req,res,next) => {
    console.log(err.stack)
    res.status(500).send('Something broke!')
})

app.listen(8080, () => {
  console.log("Your app is listening on port 8080.");
});
