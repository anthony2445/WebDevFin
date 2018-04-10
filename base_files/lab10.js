var express = require('express');
var app = express();

var session = require('express');
var bodyParser = require('body-parser');

// database config
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

let Parser = require('rss-parser');
let parser = new Parser();



var newsItems = []; // = [{title: "Title", updated: "pubDate", link: "link", content: "content"}];
(async () => {
  let feed = await parser.parseURL('http://blog.dota2.com/feed/');
  //console.log(feed.title);
 
  feed.items.forEach(item => {
	var title = item.title;
	var link = item.link;
	var pubdate = item.pubDate;
	var content = item.content;
    //console.log(item.title + ':' + item.link);
	//console.log(item.pubDate);
	//console.log(item.content);
	//console.log(item.img);
	newsItems.push({title: title, updated: pubdate, link: link, content: content});
  });
})();



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


//temp built in news variables
function loadNews(){
	var request = new XMLHttpRequest();
	var xmlDoc;
	request.onreadystatechange = function() {
	//console.log("Request State: " + request.readyState);
	//console.log("Request Status: " + request.status);
	  if (request.readyState == 4 && request.status == 200) {
		xmlDoc = request.responseXML;
		for (var i = 0; i < xmlDoc.getElementsByTagName("entry").length; i++){
			newsItems.title = xmlDoc.getElementsByTagName("entry")[i].getElementsByTagName("title")[0].childNodes[0].nodeValue;
			newsItems.updated = xmlDoc.getElementsByTagName("entry")[i].getElementsByTagName("published")[0].childNodes[0].nodeValue;
			newsItems.summary = xmlDoc.getElementsByTagName("entry")[i].getElementsByTagName("summary")[0].childNodes[0].nodeValue;
			newsItems.content = xmlDoc.getElementsByTagName("entry")[i].getElementsByTagName("content")[0].childNodes[0].nodeValue;
			console.log("Content: " + xmlDoc.getElementsByTagName("entry")[i].getElementsByTagName("content")[0].childNodes[0].nodeValue);
		}
	 }
	};
	request.open('GET', 'topstories.atom', true);
	request.send();
	console.log(newsItems);
}

//once we add news stories into mongodb
/*
MongoClient.connect(url, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("mydb");
	  dbo.collection("news").find({}).toArray(function(err, result) {
		if (err) throw err;
		//console.log("Result size: "+result.length);
		//console.log("Result"+result);
		newsItems = result;
		//console.log(usernames);

	  });
	});*/

//trying to load news stories

//console.log("loaded stories");




/*var req1;
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

*/

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
    res.render('main', { title: 'Dota 2 Main Page' });
});

app.get('/checkUsername', function (req, res) {
    // render the 'enterUsername' template, and pass in a few variables
    res.render('enterUsername', { title: 'Lab 10', message: 'Please enter a username to check' });
});

app.get('/news', function (req, res) {
    // render the 'news' template, and pass in a few variables
	//console.log("Request Sent");
	//Load function for when we do get the load working
	//loadNews();
	
	res.render('news2', { title: 'Dota 2 News', message: 'News should be below', items: newsItems });

});

app.get('/login', function (req, res) {
    // render the 'login' template, and pass in a few variables
    res.render('login', { title: 'Login Dota 2', message: "Login form." });
});

app.get('/register', function (req, res) {
    // render the 'register' template, and pass in a few variables
    res.render('register', { title: 'Register Dota 2', message: "Please fill out the form below." });
});

app.get('/logout', function (req, res) {
    // render the 'register' template, and pass in a few variables
    res.render('postLogout', { title: 'Logout Succussful', message: "You have been successfully logged out." });
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

app.post('/login', function(request, response) {
  var username = request.body.username;
  var password = request.body.pwd;
  if (!query(username)) {
	  //no user found
    response.render('postLogin', {title: 'Login Failed', message: 'Login Failed. Please try again or Sign up!'});
  } else {
	  //user exists
    response.render('postLogin', {title: 'Welcome', message: 'Login Successful!'});
  }
});

app.post('/register', function(request, response) {
  var username = request.body.newuser;
  var password = request.body.pwd;
  if (query(username)) {
	  //username already exists
    response.render('postRegister', {title: 'Registration Failed', message: 'Registration Failed. Please try again!'});
  } else {
	  //new user created response
    response.render('postRegister', {title: 'Welcome!', message: 'Registration Successful!'});
  }
});

app.listen(3001, function() {
  console.log('Listening on port 3001');
});
