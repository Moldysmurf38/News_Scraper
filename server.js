//Requried npm packages and files for app
require("dotenv").config();
var express = require("express");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("./models");
var path = require("path");
//Port for app
var port = process.env.PORT || 8080;

var app = express();

//Express data handling
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(__dirname + "/public"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Handlebars layout
app.engine("handlebars",
  exphbs({ defaultLayout: "main" })
);
app.set("views", path.join(__dirname, 'views'));
app.set("view engine", "handlebars");

// Renders home page
app.get("/", function (req, res) {
  res.render("home");
});

// Renders articles page
app.get("/articles", function (req, res) {
    res.render("articles");
});

// Renders json packets of each article
app.get("/api/articles", function(req, res) {
  db.article.find({})
  .then(function(dbArticle) {
    res.json(dbArticle);
  });
});

// Renders scraper page
app.get("/scraper", function (req, res) {
  res.render("scraper");
});

app.get("/articles/:id", function(req, res) {
  db.article.findOne({ _id: req.params.id })
    .populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.note.create(req.body)
    .then(function(dbNote) {
      return db.article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Post method that scrapes the webpage for article titles
app.post("/scraper", function(req,res) {
    axios.get("https://www.danielstechblog.io/")
    .then(function (response) {
      var $ = cheerio.load(response.data);

      $(".entry-title").each(function (i, element) {
        // Save an empty result object
        var result = {};

        // Add the text and href of every link, and save them as properties of the result object
        result.title = $(this)
          .children("a")
          .text();
        result.link = $(this)
          .children("a")
          .attr("href");

        //Adds articles to the mongodb
        db.article.create(result)
          .then(function (dbarticle) {
            console.log(dbarticle);
          })
          .catch(function (err) {
            console.log(err);
          });    
      });
    });
    res.send("scrape complete");
});

// Catch all error page for any non-specified pages
app.get("*", function(req, res) {
  res.send("Error: Page not Found");
});

//Listener for the port
app.listen(port, function () {
  console.log('----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ')
  console.log(
    "==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.",
    port,
    port
  );
  console.log('----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ')
});

module.exports = app;