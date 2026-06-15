const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Use default secure headers
app.use(helmet());

app.use(cors());
app.use(express.json());

const userRouters = require('./routes/users');
const teamRouters = require('./routes/teams');
const runnerRouters = require('./routes/runners');
const voltasRouters = require('./routes/voltas');

app.use('/runners', runnerRouters);
app.use('/teams', teamRouters);
app.use('/users', userRouters);
app.use('/voltas', voltasRouters);

app.get('/', (req, res) => {
  res.send('API funcionando');
});

module.exports = app;