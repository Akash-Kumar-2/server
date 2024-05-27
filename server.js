const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cloudinary = require('cloudinary').v2;

//uncaught error handling should be done before execution of our code
process.on('uncaughtException', err => {
  console.log('Uncaught exception Shutting Down..');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env'});

const app = require('./app');

const PORT = process.env.PORT || 5000;

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
api_key: process.env.CLOUDINARY_API_KEY,
api_secret: process.env.CLOUDINARY_API_SECRET
});

const options = {
  useNewUrlParser: true, 
  useUnifiedTopology: true, 
  // useCreateIndex: true,
  // useFindAndModify: false
};

mongoose.connect(DB)
  .then(() => {
    console.log('Connected to DataBase');
  })
  .catch(err => {
    console.error('Error connecting to DataBase', err);
  });

const server = app.listen(PORT, () => {
  console.log(`Listening on PORT: ${PORT}`);
});

//unhandled Promise Rejection
process.on('unhandledRejection', err => {
  console.log('Unhandled Rejection Shutting Down..');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});