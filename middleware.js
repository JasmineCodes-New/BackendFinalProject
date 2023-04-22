const express = require('express');
const cors = require('cors');
const verifyStateCode = require('./middleware/verifyStateCode');
const sendHTML = require('./middleware/sendHTML');
const handle404 = require('./middleware/handle404');

const middlewares = express();

middlewares.use(express.json());
middlewares.use(cors());

middlewares.use(verifyStateCode);

middlewares.use(express.static('public'));

// 404 middleware
middlewares.use(handle404);

// Root endpoint middleware
middlewares.use(sendHTML);

module.exports = middlewares;
