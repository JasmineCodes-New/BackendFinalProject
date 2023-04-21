require('dotenv').config();

const mongoose = require('mongoose');
const express = require('express');
const app = express();
const port = 3000;
const connectDB = require('./config/dbConnect');
const routes = require('./routes/states');

connectDB();

app.use(express.json());
app.use('/', routes);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});





