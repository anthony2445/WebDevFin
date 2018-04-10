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

var currUser = "";



var newsItems = []; // = [{title: "Title", updated: "pubDate", link: "link", content: "content"}];
(async () => {
  let feed = await parser.parseURL('http://blog.dota2.com/feed/');
  //console.log(feed.title);

  feed.items.forEach(item => {
	var title = item.title;
	var link = item.link;
	var pubdate = item.pubDate;
	var content = item.contentSnippet;
	var newContent = content.substring(0, content.length - 20);
	var newTime = pubdate.substring(0, pubdate.length - 15);
	//console.log(content);
	//console.log(newContent);



    //console.log(item.title + ':' + item.link);
	//console.log(item.pubDate);
	//console.log(item.content);
	//console.log(item.img);
	newsItems.push({title: title, updated: newTime, link: link, content: newContent});
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
    res.render('main', { title: 'Dota 2 Main Page', currUser: currUser });
});

app.get('/checkUsername', function (req, res) {
    // render the 'enterUsername' template, and pass in a few variables
    res.render('enterUsername', { title: 'Lab 10', message: 'Please enter a username to check', currUser: currUser });
});

app.get('/news', function (req, res) {

	res.render('news2', { title: 'Dota 2 News', items: newsItems, currUser: currUser });

});

app.get('/login', function (req, res) {
    // render the 'login' template, and pass in a few variables
    res.render('login', { title: 'Login Dota 2', message: "Log in to gain access to the forum." });
});

app.get('/register', function (req, res) {
    // render the 'register' template, and pass in a few variables
    res.render('register', { title: 'Register Dota 2', message: "Please fill out the form below to register and have access to the forum." });
});

app.get('/logout', function (req, res) {
    // render the 'register' template, and pass in a few variables
		currUser = "";
    res.render('postLogout', { title: 'Logout Succussful', message: "You have been successfully logged out." });
});

app.get('/comments', function (req, res) {
    // render the 'login' template, and pass in a few variables
    res.render('comments', { title: 'Comments Page', message: "Enter your comments below", currUser: currUser });
});

app.post('/commentButton', function(request, response) {
  var comment = request.body.commentField;

	MongoClient.connect(url, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("mydb");
	  var myobj = [
	    { username: currUser, comment: comment }
		];
		dbo.collection("comments").insert(myobj, function(err, res) {
	    if (err) throw err;
	    console.log("Number of documents inserted: " + res.insertedCount);
	    db.close();
	  });
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
		currUser = username;
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
