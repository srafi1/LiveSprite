const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const router = require('./router');
const User = require('./models/User');

const PORT = 5000;
const app = express();

mongoose.connect('mongodb://localhost:27017/livespriteAPI', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let staticServe = express.static(path.join(__dirname, '../frontend/build'));
app.use('/api', router);
app.use("/", staticServe);
app.use("*", staticServe);

app.listen(PORT, () => console.log(`LiveSprite API running on port ${PORT}`));
