var express = require('express');
var app = express();

var session = require('express');
var bodyParser = require('body-parser');

// database config
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";


let Parser = require('rss-parser');
let parser = new Parser();

var currUser = "";


//The news array to store RSS feed stories
var newsItems = []; // = [{title: "Title", updated: "pubDate", link: "link", content: "content"}];
//parse RSS feed
(async () => {
  let feed = await parser.parseURL('http://blog.dota2.com/feed/');

  feed.items.forEach(item => {
	var title = item.title;
	var link = item.link;
	var pubdate = item.pubDate;
	var content = item.contentSnippet;
	var newContent = content.substring(0, content.length - 20);
	var newTime = pubdate.substring(0, pubdate.length - 15);
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

//get data from mongodb for usernames and comments
var usernames;
var comments;
MongoClient.connect(url, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("mydb");
	  dbo.collection("users").find({}).toArray(function(err, result) {
		if (err) throw err;

		usernames = result;

	  });
		dbo.collection("comments").find({}).toArray(function(err, result) {
		if (err) throw err;
		comments = result;

	  });

	});

//Function to check usernames against the usernames array
function queryUsername(toFind) {
	for (var i = 0; i < usernames.length; i++){
		if (usernames[i].username === toFind){
			return i;
		}
	}
	return -1;
}

//function to check if the specified user's password matches
function passwordQuery(toFind, i) {
		if (usernames[i].password === toFind){
			return true;
	}
	return false;
}


// GET response for '/'
app.get('/', function (req, res) {
    // render the 'enterUsername' template, and pass in a few variables
    res.render('main', { title: 'Dota 2 Main Page', currUser: currUser });
});

//Brings user to enter username page
app.get('/checkUsername', function (req, res) {
    // render the 'enterUsername' template, and pass in a few variables
    res.render('enterUsername', { title: 'Lab 10', message: 'Please enter a username to check', currUser: currUser });
});

//Brings user to news page
app.get('/news', function (req, res) {

	res.render('news', { title: 'Dota 2 News', items: newsItems, currUser: currUser });

});

//Brings user to login page
app.get('/login', function (req, res) {
    // render the 'login' template, and pass in a few variables
    res.render('login', { title: 'Login Dota 2', message: "Log in to gain access to the forum." });
});

//Brings user to register page
app.get('/register', function (req, res) {
    // render the 'register' template, and pass in a few variables
    res.render('register', { title: 'Register Dota 2', message: "Please fill out the form below to register and have access to the forum." });
});

//Brings user to logout page, and sets current user to ""
app.get('/logout', function (req, res) {
    // render the 'register' template, and pass in a few variables
		currUser = "";
    res.render('postLogout', { title: 'Logout Succussful', message: "You have been successfully logged out." });
});

////Brings user to comments page
app.get('/comments', function (req, res) {
    // render the 'login' template, and pass in a few variables
    res.render('comments', { title: 'Comments Page', message: "Enter your comments below", currUser: currUser, comments: comments });
});

//Brings user to comments page
app.get('/commentButton', function (req, res) {
    // render the 'login' template, and pass in a few variables
    res.render('comments', { title: 'Comments Page', message: "Enter your comments below", currUser: currUser, comments: comments });
});

//When the user clicks the comment button on the comment page
app.post('/commentButton', function(request, response) {
	//retrieve title and comment from their fields
	var title = request.body.commentTitle;
  var comment = request.body.commentField;
	//getting date and time, and adding it to a string
	var currentdate = new Date();
	var datetime = currUser + " Submitted at: " + currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/"
                + currentdate.getFullYear() + " @ "
                + currentdate.getHours() + ":"
                + currentdate.getMinutes() + ":"
                + currentdate.getSeconds();

	//confirm that title and comment were filled out
	if(title != null && comment != null)
	{
		//create and object to hold the title comment and string
		var myobj = [
			{ title: title, comment: comment, date: datetime }
		];
		//add the object to the comments database
		MongoClient.connect(url, function(err, db) {
		  if (err) throw err;
		  var dbo = db.db("mydb");
			dbo.collection("comments").insert(myobj, function(err, res) {
		    if (err) throw err;
		    console.log("Number of documents inserted: " + res.insertedCount);
		    db.close();
		  });
		});

		//Also add the comment directly into the variable so the page can reload immidiately
		comments.push(myobj[0]);

		//render the comments page again with the new comment inserted at the bottom
		response.render('comments', { title: 'Comments Page', message: "Enter your comments below", currUser: currUser, comments: comments });
	}
	//if either field is not filled, reload the page without adding anything
	else {
		response.render('comments', { title: 'Comments Page', message: "Title and Comment must be filled out", currUser: currUser, comments: comments });
	}

});

//When the user clicks the login button on the login page
app.post('/login', function(request, response) {
	//retrieve the username and password from their fields on the page
  var username = request.body.username;
  var password = request.body.password;

	//if no user found
  if (queryUsername(username)==-1) {
    response.render('postLogin', {title: 'Login Failed', message: 'Login Failed. Please try again or Sign up!', currUser: currUser});
  }
	//otherwise the user is in the database
	else {
	  //if the password matches the password for the specified user
		if(passwordQuery(password, queryUsername(username)))
		{
			//set currUser to the username
			currUser = username;
	    response.render('postLogin', {title: 'Welcome', message: 'Login Successful!', currUser: currUser});
		}
		//password was wrong
		else {
			response.render('postLogin', {title: 'Login Failed', message: 'Login Failed. Please try again or Sign up!', currUser: currUser});
		}
  }
});

//When the user clicks the register button on the register page
app.post('/register', function(request, response) {
	//retrieve username and passwords from the fields
  var username = request.body.newuser;
  var password = request.body.password;
	var pwConf = request.body.confirmPassword;

	//confirm the user entered a username
  if (username != null) {
    response.render('postRegister', {title: 'Registration Failed', message: 'Registration Failed, please enter username.'});
  }
	//Confirm the username does not already exist
	else if(queryUsername(username) != -1)
	{
		response.render('postRegister', {title: 'Registration Failed', message: 'Registration Failed, username already exists. Please try again!'});
	}
	//username is good
	else {
		//confirm the password fields matched and neither are null
		if(password == pwConf && password != null)
		{
		  //new user creation
			var myobj = [
		    { username: username, password: password }
			];
			MongoClient.connect(url, function(err, db) {
			  if (err) throw err;
			  var dbo = db.db("mydb");
				dbo.collection("users").insert(myobj, function(err, res) {
			    if (err) throw err;
			    console.log("Number of documents inserted: " + res.insertedCount);
			    db.close();
			  });
			});

			//also add to the variable for quick access
			usernames.push(myobj[0]);
	    response.render('postRegister', {title: 'Welcome!', message: 'Registration Successful!'});
		}
		//if passwords did not match or passwords were blank
		else {
			response.render('postRegister', {title: 'Registration Failed', message: 'Registration Failed, password did not match!'});
		}
  }
});

app.listen(3001, function() {
  console.log('Listening on port 3001');
});
