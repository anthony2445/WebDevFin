var express = require('express');
var app = express();

var session = require('express');
var bodyParser = require('body-parser');

// database config
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

// middleware
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// configure view engine
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

var usernames;
MongoClient.connect(url, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("mydb");
	  dbo.collection("users").find({}).toArray(function(err, result) {
		if (err) throw err;
		//console.log("Result size: "+result.length);
		//console.log("Result"+result);
		usernames = result;
		//console.log(usernames);

	  });
	});


//trying to load news stories
var req1;
var request = new XMLHttpRequest();
//var xhr = new XMLHttpRequest();
var items = [{title: "Title", updated: "updated", summary: "summary", content: "content"}];
//console.log(items);

	request.onreadystatechange = function() {
		//console.log(1);
		//this isn't happening for some reason...
		console.log("Ready State: " + request.readyState);
		console.log("Status: " + request.status);
		if (request.readyState == 4 && request.status == 200) {
			console.log(request.status);
			req1 = request.responseXML

			for(var i =0; i <2; i++)
			{
				var title = req1.getElementsByTagName('entry')[i].getElementsByTagName('title')[0].childNodes[0].nodeValue;

				var updated = req1.getElementsByTagName('entry')[i].getElementsByTagName('updated')[0].childNodes[0].nodeValue;

				var summary = req1.getElementsByTagName('entry')[i].getElementsByTagName('summary')[0].childNodes[0].nodeValue;

				var content = req1.getElementsByTagName('entry')[i].getElementsByTagName('content')[0].childNodes[0].nodeValue;
				console.log(content);
				items.append({title: title, updated: updated, summary: summary, content: content});

			}
		}
	};
	request.open('GET', 'topstories.atom', true);
	request.send();



function query(toFind) {
	for (var i = 0; i < usernames.length; i++){
		if (usernames[i].username === toFind){
			return true;
		}
	}
	return false;
}

// utility code

function userAvailable(toFind) {
	//var foundname = query(toFind);
	console.log("Foundname: " + foundname);

}

// GET response for '/'
app.get('/', function (req, res) {
    // render the 'enterUsername' template, and pass in a few variables
    res.render('main', { title: 'DOTA 2' });
});

app.get('/checkUsername', function (req, res) {
    // render the 'enterUsername' template, and pass in a few variables
    res.render('enterUsername', { title: 'Lab 10', message: 'Please enter a username to check' });
});

app.get('/news', function (req, res) {
    // render the 'news' template, and pass in a few variables


			//console.log("Request Sent");
			res.render('news2', { title: 'News Page', message: 'News should be below', items: items });

});

app.get('/help', function (req, res) {
    // render the 'enterUsername' template, and pass in a few variables
    res.render('enterUsername', { title: 'Lab 10' });
});

app.post('/checkUsername', function(request, response) {
  var username = request.body.username;
  //if (userAvailable(username)) {
  //  response.render('enterUsername', {title: 'Lab 10', message: 'This username already exists. Please try another.'});
  //} else {
  //  response.render('enterUsername', {title: 'Lab 10', message: 'That username is available.'});
  //}
    User.find({username: username}).then(function(results) {
    if (results.length == 0) {
      // available
      response.render('enterUsername', {title: 'Lab 10',
                                message: 'That username is available.'});
    } else {
      // not available
        response.render('enterUsername', {title: 'Lab 10', message: 'This username already exists. Please try another.'});
    }
  });
});

app.post('/', function(request, response) {
  var username = request.body.username;
  if (query(username)) {
    response.render('enterUsername', {title: 'Lab 10', message: 'This username already exists. Please try another.'});
  } else {
    response.render('enterUsername', {title: 'Lab 10', message: 'That username is available.'});
  }
});

app.listen(3001, function() {
  console.log('Listening on port 3001');
});
