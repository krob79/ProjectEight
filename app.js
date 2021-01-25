var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var sequelize = require('./models').sequelize;

try {
  sequelize.authenticate();
  sequelize.sync();
  console.log('Connection has been established successfully.');
  
} catch (error) {
  console.error('Unable to connect to the database:', error);
}


var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use('/static', express.static('public'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);



// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error();
  err.status = 404;
  err.message = "WE'VE GOT AN ERROR HERE!";
  res.render('page-not-found');
  next(err);
  //next(createError(404));
});

/* Global error handler */
app.use((err, req, res, next) => {

  if (err) {
    console.log('Global error handler called', err);
  }
    if(err.status === 404){
       res.status(404).render('error', {message: err.message || `This isn't right somehow.`});
    } else {
        err.message = err.message || `Oops! It looks like something went wrong on the server`;
        console.log(`ERROR: ${err.message}`);
        res.status(err.status || 500).render(`error`, {message: err.message});
    }
});

module.exports = app;
