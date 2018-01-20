const express = require("express");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const logger = require("morgan");
const mongoose = require("mongoose");
const request = require("request");
const cheerio = require("cheerio");

const db = require("./models");

const port = process.env.PORT || 3000;

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

const app = express();

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false}));
app.use(express.static('public'));

app.engine('handlebars', exphbs({ defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

mongoose.Promise = Promise;
mongoose.connect('MONGODB_URI', {
  
});

app.get('/', function(req, res) {
    db.Articles.find({}).populate({path: 'note', select: 'body'}).sort({_id: -1}).exec(function(err, data) {
        if (err) console.log(err);
        else {
            res.render('index', {layout: 'main.handlebars', articles: data})
        }
    });
});

app.get("/scrape", function(req, res) {
    request.get("https://npr.org/", function(err, response, body) {
        if (err) console.log(err);
        else {
            const $ = cheerio.load(response.body);

            $("article.has-image").each(function(i, element) {
                const result = {}

                result.title = $(element).find("h1.title").text().trim();
                result.link = $(element).find("a").attr("href");
                result.summary = $(element).find("p.teaser").text().trim();
                // result.image = $(element).find("img").attr("href");

                  db.Articles
                    .create(result)
                    .then(function(dbArticle) {
                        res.send('Scrape Done');
                    })
                    .catch(function(err) {
                        res.json(err);
                    });

            });
        }
    });
});

app.get('/articles', function(req, res) {
    db.Articles
    .find({})
    .then(function(dbArticles) {
        res.json(dbArticles);
    })
    .catch(function(err) {
        res.json(err);
    });
});

app.get("/articles/:id", function(req, res) {
    db.Articles
      .findOne({_id: req.params.id })
      .populate("Notes")
      .then(function(dbArticles) {
          res.json(dbArticles);
      })
      .catch(function(err) {
          res.json(err);
      });
});

app.post("/articles/:id", function(req, res) {
    db.Notes
      .create(req.body)
      .then(function(dbNotes) {
          return db.Articles.findOneAndUpdate({ _id: req.params.id}, {note: dbNotes._id}, { new: true });
      })
      .then(function(dbArticles) {
          res.json(dbArticles);
      })
      .catch(function(err) {
          res.json(err);
      });
});

app.listen(3000, function() {
    console.log("App running on port 3000")
});