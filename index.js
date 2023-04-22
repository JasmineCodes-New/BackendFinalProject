require('dotenv').config();

const mongoose = require('mongoose');
const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/dbConnect');
const routes = require('./routes/states');
const verifyStateCode = require('./middleware/verifyStateCode');
const sendHTML = require('./middleware/sendHTML');
const handle404 = require('./middleware/handle404');

connectDB();

app.use(express.json());
app.use(cors());

app.use('/', require('./routes/root'));
app.use('/', routes);

app.use(verifyStateCode);

app.use(express.static('public'));

// 404 middleware
app.use(handle404);

// Root endpoint middleware
app.use(sendHTML);

app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ "error": "404 Not Found" });
    } else {
        res.type('txt').send("404 Not Found");
    }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});






