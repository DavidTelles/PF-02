const express = require('express');
const app = express();
app.use(express.json());

//Rotas
const userRouter = require('./routes/users');
app.use('/users', userRouter);

module.exports = app;