// include modules
const bodyParser          = require('body-parser');
const cookieParser        = require('cookie-parser');
const express             = require('express');
const LocalStrategy       = require('passport-local').Strategy;
const passport            = require('passport');
const session             = require('express-session');

// initialize express app
const app = express();
var data = {};

// tell passport to use a local strategy and tell it how to validate a username and password
passport.use(new LocalStrategy(function(username, password, done) {
    if (username && password) return done(null, { id: username });
    return done(null, false);
}));

// tell passport how to turn a user into serialized data that will be stored with the session
passport.serializeUser(function(user, done) {
    done(null, user);
});

// tell passport how to go from the serialized data back to the user
passport.deserializeUser(function(user, done) {
    done(null, { id: user.id });
});

// tell the express app what middleware to use
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({ secret: 'secret key', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// app.get('/', function (req, res) {
//     res.sendFile('index.html', {root: '.'});
// });

app.get('/health', function (req, res) {
    res.sendStatus(200); 
});

// app.post('/login', passport.authenticate('local', { successRedirect: '/user', failureRedirect: '/', failureFlash: false })
// );

app.get('/logout', function (req, res) {
    req.logout();
    res.sendStatus(200); 
});

app.get('/user', function (req, res) {
	if (!req.user) return res.sendStatus(401);

	// else if (!req.user.keys) {
	// 	req.user.keys = {};
	// 	res.send(req.user);
	// }

	res.send(data[req.user.id]);
});

app.post('/login', passport.authenticate('local'), function(req, res) {
	if (!req.user) return res.sendStatus(401);

	// if (!req.user.keys) {
	// 	req.user.keys = {};
	// }

	console.log(data[req.user.id]);

	// If the user doesn't have an entry in data, add one.
	if (!data[req.user.id]) {
		data[req.user.id] = {};
		console.log("Set data object for user " + req.user.id);
	}

	res.send(data[req.user.id]);
});

app.put('/', function (req, res) {
	if (!req.user) return res.sendStatus(401);

	data[req.user.id][req.query.key] = req.query.value;
	res.send(data[req.user.id]);
});

app.delete('/', function (req, res) {
	if (!req.user) return res.sendStatus(401);

	delete data[req.user.id][req.query.key];
	res.send(data[req.user.id]);
});

// start the server listening
app.listen(3000, function () {
    console.log('Server listening on port 3000.');
});