const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env'});

const app = require('./app');

const PORT = 5000;

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

const options = {
  useNewUrlParser: true, // Use the new URL parser (recommended)
  useUnifiedTopology: true, // Use the new Server Discover and Monitoring engine
  // useCreateIndex: true, // Make Mongoose use `createIndex()` instead of `ensureIndex()` (deprecated)
  // useFindAndModify: false // Use native `findOneAndUpdate()` rather than `findAndModify()`
};

mongoose.connect(DB)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB', err);
  });
const server = app.listen(PORT, () => {
  console.log(`Listening on PORT: ${PORT}`);
});