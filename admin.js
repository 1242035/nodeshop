// Require express
const express = require('express');
// Set up express
const app = express();
// Require mongostore session storage
const config = require('./shop/config.json');
const info = require('./package.json');

const session = require('express-session');
const mongoStore = require('connect-mongo')(session);
const passport = require('passport');
// Require needed files
const database = require('./shop/data');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const serveStatic = require('serve-static');
// Mongoose for database
var mongoose = require('mongoose');
// User model and local strategy for passport
var User = require('./schemas/user');
var LocalStrategy = require('passport-local').Strategy;

console.log('NodeShop Admin Started!');

// Passport authentication
passport.use(new LocalStrategy({usernameField: 'email'},function(email, password, done) {User.authenticate(email, password, function(err, user) {return done(err, user)})}));

// Session store
passport.serializeUser(function(user, done) {done(null, user.id)});
passport.deserializeUser(function(id, done) {User.findById(id, function (err, user) {done(err, user)})});

// Connect mongoose database
mongoose.connect(config.connection);
console.log('Connecting to database...');

// Listen for mongoose connection
mongoose.connection.on('open', function() {
    console.log('Connected to database!');
});

// Configure Express
app.set('views', __dirname + '/admin/views');
app.set('view engine', 'pug');

app.use( favicon(__dirname + '/admin/public/favicon.ico' ));
app.use( cookieParser() );
app.use( bodyParser.urlencoded({ extended: false }) );

// Set up sessions
app.use(session({
    // Set up MongoDB session storage
    store: new mongoStore({url:config.connection}),
    resave: false,
    saveUninitialized: true,
    // Set session to expire after 21 days
    cookie: { maxAge: new Date(Date.now() + 181440000)},
    // Get session secret from config file
    secret: config.cookie_secret
    })
);

// Set up passport
app.use(passport.initialize());
app.use(passport.session());

// Define public assets
app.use( serveStatic(__dirname + '/admin/public'));

// Require router, passing passport for authenticating pages
require('./admin/router')(app, passport);

// Listen for requests
app.listen(process.env.PORT);

console.log('NodeShop v' + info.version + ' Admin Area listening on port ' + process.env.PORT);

// Handle all uncaught errors
process.on('uncaughtException', function(err) {
    console.log(err);
});
