const express = require('express');
const router = require('./router');

const app = express();
const PORT = 5000;

app.use('/api', router);

app.listen(PORT, () => console.log(`LiveSprite API running on port ${PORT}`));
