const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { clientOrigin } = require('./config/env');
const authRoutes = require('./routes/authRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'OK',
    data: {},
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;