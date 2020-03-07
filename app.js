// Modules
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var stemmer = require('porter-stemmer').stemmer;
var async = require('async');

//Own Modules
var dynamoDbTable = require('./keyvaluestore.js');

// Express
var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(logger('dev'));

app.use(function (req, res, next) {
  res.setHeader("Cache-Control", "no-cache must-revalidate");
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

app.get('/search/:word', function (req, res) {
  var stemmedword = stemmer(req.params.word).toLowerCase(); //stem the word
  var imageurls = new Array();

  let processData = function (callback) {
    labels.get(stemmedword, function (err, labels) {
      if (err) {
        console.log("getAttributes() failed: " + err);
        callback(err.toString(), imageurls);
      } else if (labels == null) {
        console.log("getAttributes() returned no results");
        callback(undefined, imageurls);
      } else {
        async.map(labels.Items, function (label, callback) {
          //label.value.S = category
          images.get(label.value.S, function (err, imagejson) {
            if (err) {
              console.log(err);
            } else {
              if (imagejson.Count > 0)
                imageurls.push(imagejson.Items[0].value.S);
              callback();
            }
          });
        }, function () {
          callback(undefined, imageurls);
        });
      }
    });
  };

  processData(function (err, queryresults) {
    if (err) {
      res.send(JSON.stringify({ results: undefined, num_results: 0, error: err }));
    } else {
      res.send(JSON.stringify({ results: queryresults, num_results: queryresults.length, error: undefined }));
    }
  });
});

//INIT Logic
var images = new dynamoDbTable('images');
var labels = new dynamoDbTable('labels');

images.init(
  function () {
    labels.init(
      function () {
        console.log("Images Storage Starter");
      }
    )
    console.log("Terms Storage Starter");
  }
);

module.exports = app;
