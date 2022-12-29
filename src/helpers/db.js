require('dotenv').config();

const mongoose = require('mongoose');

const connectionStr = process.env.DATABASE_URL;

mongoose.set('strictQuery', false);

mongoose
  .connect(connectionStr, { useNewUrlparser: true })
  .then(() => console.log('connected to mongodb'))
  .catch((err) => console.log(err));
