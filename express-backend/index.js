const express = require('express');
const mongoose = require('mongoose');

const router = require('./router');
const User = require('./models/User');

const PORT = 5000;
const app = express();

mongoose.connect('mongodb://localhost:27017/livespriteAPI', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use('/api', router);

app.listen(PORT, () => console.log(`LiveSprite API running on port ${PORT}`));
