require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');
const express = require('express');
const config = require('./utils/config');
require('express-async-errors')


const blogsRoute = process.env.NODE_ENV === 'production' ? '/blogs' : '/api/blogs'
const usersRoute = process.env.NODE_ENV === 'production' ? '/users' : '/api/users'
const loginRoute =  process.env.NODE_ENV === 'production' ? '/login' : '/api/login'

const app = express();

const blogsRouter = require('./controllers/blogs');
const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login')
const tokenExtractor = require('./utils/tokenExtractor')
const logger = require('./utils/logger');
const errorHandler = require('./utils/errorHandler')
mongoose.set('strictQuery', false);

logger.info('Connecting to', config.MONGODB_URI);

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB');
  })
  .catch(() => {
    logger.error('Error connecting to MongoDB');
  });

app.use(cors());
app.use(express.static('build'));
app.use(express.json());
app.use(tokenExtractor);
app.use(blogsRoute, blogsRouter);
app.use(usersRoute, usersRouter)
app.use(loginRoute, loginRouter);

if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing')
  app.use('/api/testing', testingRouter)
}

app.use(errorHandler)

module.exports = app;

// // Create body token for morgan
// morgan.token('body', (req) => JSON.stringify(req.body));
