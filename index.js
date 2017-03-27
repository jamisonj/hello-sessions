// include modules
const bodyParser          = require('body-parser');
const cookieParser        = require('cookie-parser');
const express             = require('express');
const LocalStrategy       = require('passport-local').Strategy;
const passport            = require('passport');
const session             = require('express-session');

// initialize express app
const app = express();

// tell passport to use a local strategy and tell it how to validate a username and password
passport.use(new LocalStrategy(function(username, password, done) {
    if (username && password) return done(null, { username: username, keys: Object });
    return done(null, false);
}));

// tell passport how to turn a user into serialized data that will be stored with the session
passport.serializeUser(function(user, done) {
    done(null, user.username);
});

// tell passport how to go from the serialized data back to the user
passport.deserializeUser(function(id, done) {
    done(null, { username: id });
});

// tell the express app what middleware to use
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({ secret: 'secret key', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', function (req, res) {
    res.sendFile('index.html', {root: '.'});
});

app.get('/health', function (req, res) {
    res.sendStatus(200); 
});

app.post('/login', passport.authenticate('local', { successRedirect: '/user', failureRedirect: '/', failureFlash: true })
);

app.get('/logout', function (req, res) {
    req.logout();
    res.sendStatus(200); 
});

app.get('/user', function (req, res) {
	if (!req.user) return res.sendStatus(401);
    res.send(req.user);
});

// start the server listening
app.listen(3000, function () {
    console.log('Server listening on port 3000.');
});