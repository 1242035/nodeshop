// Require express
const express = require('express');
// Set up express
const app = express();
// Require mongostore session storage
const session = require('express-session');
const mongoStore = require('connect-mongo')(session);
const passport = require('passport');
// Require needed files
const database = require('./shop/data');
const config = require('./shop/config.json');
const info = require('./package.json');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const serveStatic = require('serve-static');

console.log('NodeShop Started!');

// Connect to database
database.startup(config.connection);
console.log('Connecting to database...');

// Configure Express
app.set('views', __dirname + '/shop/views');
app.set('view engine', 'pug');

app.use( favicon(__dirname + '/shop/public/favicon.ico' ));
app.use( cookieParser() );
app.use( bodyParser.urlencoded({ extended: false }) );

// Set up sessions
app.use(session( {
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
app.use( serveStatic(__dirname + '/shop/public'));

// Require router, passing passport for authenticating pages
require('./shop/router')(app, passport);

// Listen for requests
app.listen(process.env.PORT);

console.log('NodeShop v' + info.version + ' listening on port ' + process.env.PORT);

// Handle all uncaught errors
process.on('uncaughtException', function(err) {
    console.log(err);
});
