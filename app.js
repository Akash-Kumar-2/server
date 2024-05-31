const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const postRouter = require('./routes/postRoutes');
const searchRouter = require('./routes/searchRoutes');
// const friendRouter = require('./routes/friendRoutes');

const app = express();

app.use(cors());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next();
});
//cross site scripting overcome
app.use(bodyParser.urlencoded({ limit: "10kb", extended: false }));
app.use(cookieParser());

//Development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

app.use(express.json());

// app.use('/api/v1/users',friendRouter);
app.use('/api/v1/search',searchRouter);
app.use('/api/v1/users',userRouter);
app.use('/api/v1/posts', postRouter);

app.all('*', (req, res, next) => {
    
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
  });
  
  //global error handler middleware
  app.use(globalErrorHandler);

module.exports = app;