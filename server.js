const express = require('express');
const mongoose = require('mongoose');
const app = express();

const bodyParser = require('body-parser');
const passport = require('passport');
const flash = require('connect-flash');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(expressSession);
const assert = require('assert');
var config = require('./config/main.js');
const User = require('./app/models/user');


mongoose.Promise = global.Promise;
mongoose.connect(config.url);

var store = new MongoDBStore({
  uri: config.url,
  collection: 'sessions',
   clear_interval: 3600
})

store.on('error', function(error) {
  assert.ifError(error);
  assert.ok(false);
})

app.use(morgan('dev'));
app.use(bodyParser.json())
app.use(express.static('public'))

app.set('view engine', 'ejs')

app.use(cookieParser());
app.use(expressSession({
  secret: config.secret,
  resave: false,
  store: store,
  cookie: { maxAge: 24 * 60 * 60 * 1000 },
  saveUninitialized: true
}))
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);
// app.use(flash());

require('./app/routes.js')(app, passport);


app.listen(config.port);
console.log('The party\'s on at port ' + config.port);
