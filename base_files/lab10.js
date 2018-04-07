var express = require('express');
var app = express();

var session = require('express');
var bodyParser = require('body-parser');

// database config
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";


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
    res.render('enterUsername', { title: 'Lab 10' });
});

app.get('/checkUsername', function (req, res) {
    // render the 'enterUsername' template, and pass in a few variables
    res.render('enterUsername', { title: 'Lab 10', message: 'Please enter a username to check' });
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
