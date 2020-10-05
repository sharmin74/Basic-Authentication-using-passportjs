const express = require('express');
var bodyParser = require('body-parser');
const ejs = require('ejs');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const app = express();

// Passport config 
require('./config/passport')(passport);

// setting the view engine to EJS
app.set('view engine', 'ejs');

// bodyParser
app.use(bodyParser.urlencoded({ extended: false }));

// To serve Static files
app.use(express.static(__dirname + '/public'));

// Setting up express session 
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));

// initializing passport 
app.use(passport.initialize());
app.use(passport.session());

// setting up connect-flash 
app.use(flash());

app.use((req, res, next) => {
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
});

// setting up database 
const url = 'mongodb://localhost:27017/basicAuthDB';
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then(() => console.log('MongoDB connected..'))
    .catch(err => console.log(err))

// ROUTES 
app.use('/', require('./routes/user'));

// listening on port 5000 
app.listen(5000, (req, res) => {
    console.log('Server running on port 5000');
});