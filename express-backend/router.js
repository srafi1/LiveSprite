const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.send('LiveSprite API');
});

router.get('/register', (req, res) => {
  res.send('registering user');
})

router.get('/login', (req, res) => {
  res.send('logging user in');
})

router.post('/new', (req, res) => {
  res.send('creating new animation');
})

router.get('/animation/:animId', (req, res) => {
  res.send('getting old animation');
})

router.delete('/animation/:animId', (req, res) => {
  res.send('deleting animation');
})

router.post('/animation/:animId/:newAnimName', (req, res) => {
  res.send('saving animation')
})

router.get('/gif/animation/:animId', (req, res) => {
  res.send('getting animation gif file');
})

router.post('/gif/animation/:animId', (req, res) => {
  res.send('saving animation gif file');
})

module.exports = router;
