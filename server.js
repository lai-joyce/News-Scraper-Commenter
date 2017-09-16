/* Showing Mongoose's "Populated" Method
* =============================================== */

// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
// Requiring our Note and Article models
var Comment = require("./models/Comment.js");
var Article = require("./models/Article.js");

var headlinesController = require("./controllers/headlines");
var notesController = require("./controllers/notes");
// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

var handlebars = require("express-handlebars");


// Initialize Express
var app = express();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Setup engine for Handlebars
app.engine('handlebars', handlebars({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Database configuration with mongoose
// mongoose.connect("mongodb://localhost/news-scraper");
//for Heroku deployment:
mongoose.connect("mongodb://heroku_4273jblh:2ts62sicm93fq10k4gn5b2l8at@ds129024.mlab.com:29024/heroku_4273jblh");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});


// Routes
// ======

// A GET request to scrape the nature website
app.get("/api/fetch", function(req, res) {

  // First, we grab the body of the html with request
  request("http://www.nature.com/news/newsandviews", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);

    var numOfArticles = $("p.standfirst.truncate").length;

    // Now, we grab every h3 within an article tag, and do the following:
    $("h3").each(function(i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");
      result.summary = $(this).parent().find("p.standfirst.truncate").text();
      result.isSaved = false;

      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)
      var entry = new Article(result);

      // Now, save that entry to the db
      entry.save(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        // Or log the doc
        else {
          console.log(doc);
        }
      });

    });

    // Tell the browser that we finished scraping the text
    res.send("Scrape completed with any new articles.");
  });
  
});

// This will get the articles we scraped from the mongoDB
app.get("/api/headlines", function(req, res) {
  // Grab every doc in the Articles array
  Article.find({"isSaved": req.query.saved}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});

app.delete("/api/headlines/:id", function(req, res) {
  // Grab every doc in the Articles array
  Article.find({"_id": req.params.id}).remove(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});

app.put("/api/saved/:id", function(req, res) {
  Article.findOneAndUpdate({"_id": req.params.id}, { "isSaved": true })
      // Execute the above query
      .exec(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        else {
          // Or send the document to the browser
          res.send(doc);
        }
      });
    });

// Grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ "_id": req.params.id })
  // ..and populate all of the notes associated with it
  .populate("comment")
  // now, execute our query
  .exec(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise, send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});


// Grab all the comments associated with a particular article
app.get("/api/comments/:id", function(req, res) {
  // res.send("trues");
  Comment.find({ "articleId": req.params.id })
  // ..and populate all of the notes associated with it
  .populate("comment")
  // now, execute our query
  .exec(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise, send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });

  
});

app.post("/api/comments", function(req, res) {
  var newComment = new Comment(req.body);

  newComment.save({}, function(error, doc) {
    if (error) {
      console.log(error);
    }

    else {
      res.json(doc);
    }
  });


});

app.delete("/api/comments/:id", function(req, res) {
    // var query = {};
    // query._id = req.params.id;
    // notesController.delete(query, function(err, data) {
    //   res.json(data);
    // });
    Comment.find({"_id": req.params.id}).remove(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
  });

var PORT = process.env.PORT || 3000;
// Listen on port 3000
// app.listen(3000, function() {
//   console.log("App running on port 3000!");
// });