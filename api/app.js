const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/runners', require('./routes/runners'));
app.use('/teams',   require('./routes/teams'));
app.use('/users',   require('./routes/users'));
app.use('/voltas',  require('./routes/voltas'));
app.use('/tracks',  require('./routes/tracks'));
app.use('/races',   require('./routes/races'));

app.get('/', (req, res) => res.json({ status: 'API Septem Racing v2.0' }));

module.exports = app;
