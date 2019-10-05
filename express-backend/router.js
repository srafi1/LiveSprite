const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const fs = require('fs');

const User = require('./models/User');

const upload = multer();
const router = express.Router();

router.use(bodyParser.json()); 
router.use(bodyParser.urlencoded({ extended: true })); 
router.use(upload.array());
router.use(cookieParser());
/*
 *router.use(multer({ dest: './uploads/',
 *  rename: function (fieldname, filename) {
 *    return filename;
 *  }
 *}));
 */

router.get('/', (req, res) => {
  res.send('LiveSprite API');
});

router.get('/register', (req, res) => {
  // get form inputs
  let username = req.body['username'];
  let password = req.body['password'];
  let confirmPassword = req.body['confirmPassword'];

  // form validation
  if (!username || username.trim() === '') {
    res.json({success: false, warning: 'Username is required'});
  } else if (!password || password.trim() === '') {
    res.json({success: false, warning: 'Password is required'});
  } else if (!confirmPassword || password.trim() !== confirmPassword.trim()) {
    res.json({success: false, warning: 'Passwords must match'});
  } else {
    // check if username is taken
    User.findOne({username: username}, (err, user) => {
      if (user) {
        res.json({success: false, warning: 'That username is taken'});
      } else {
        // validation complete
        username = username.trim();
        password = password.trim();
        User({username: username, password, password})
          .save()
          .then(() => {
            console.log(`Created user: ${username}`);
            res.json({success: true, uid: username});
          });
      }
    });
  }
})

router.get('/login', (req, res) => {
  // get form inputs
  let username = req.body['username'];
  let password = req.body['password'];

  // form validation
  if (!username || username.trim() === '') {
    res.json({success: false, warning: 'Username is required'});
  } else if (!password || password.trim() === '') {
    res.json({success: false, warning: 'Password is required'});
  } else {
    // check login info
    User.findOne({username: username}, (err, user) => {
      if (!user || user.password !== password) {
        res.json({success: false, warning: 'Invalid login'});
      } else {
        // validation complete
        res.cookie('user_id', username);
        res.json({success: true, uid: username});
      }
    });
  }
})

router.post('/new', (req, res) => {
  let uid = req.cookies['user_id'];
  if (!uid) {
    res.json({success: false, warning: 'No user id found'});
  } else {
    User.findOne({username: uid}, (err, user) => {
      if (!user) {
        res.json({success: false, warning: 'That user does not exist'});
      } else {
        let anim = {name: 'New Project', data: req.body};
        user.animations.push(anim);
        user.save()
          .then(() => {
            let anim_id = user.animations[user.animations.length - 1]._id;
            res.json({success: true, anim_id: anim_id});
          });
      }
    });
  }
})

router.get('/animations', (req, res) => {
  let uid = req.cookies['user_id'];
  if (!uid) {
    res.json({success: false, warning: 'No user id found'});
  } else {
    User.findOne({username: uid}, (err, user) => {
      if (!user) {
        res.json({success: false, warning: 'That user does not exist'});
      } else {
        let anims = user.animations.map((a) => {return {id: a._id, name: a.name};});
        res.json(anims);
      }
    });
  }
})

router.get('/animation/:animId', (req, res) => {
  let uid = req.cookies['user_id'];
  let animId = req.params['animId'];
  if (!uid) {
    res.json({success: false, warning: 'No user id found'});
  } else {
    User.findOne({username: uid}, (err, user) => {
      if (!user) {
        res.json({success: false, warning: 'That user does not exist'});
      } else {
        let anim = null;
        for (let i in user.animations) {
          if (user.animations[i]._id == animId) {
            anim = user.animations[i];
            break;
          }
        }
        if (!anim) {
          res.json({success: false, warning: 'Unauthorized or animation does not exist'});
        } else {
          res.json({success: true, animation: anim});
        }
      }
    });
  }
})

router.delete('/animation/:animId', (req, res) => {
  let uid = req.cookies['user_id'];
  let animId = req.params['animId'];
  if (!uid) {
    res.json({success: false, warning: 'No user id found'});
  } else {
    User.findOne({username: uid}, (err, user) => {
      if (!user) {
        res.json({success: false, warning: 'That user does not exist'});
      } else {
        let animIndex = -1;
        for (let i in user.animations) {
          if (user.animations[i]._id == animId) {
            animIndex = i;
            break;
          }
        }
        if (animIndex === -1) {
          res.json({success: false, warning: 'Unauthorized or animation does not exist'});
        } else {
          user.animations.splice(animIndex, 1);
          user.save()
            .then(() => {
              res.json({success: true});
            });
        }
      }
    });
  }
})

router.post('/animation/:animId/:newAnimName', (req, res) => {
  let uid = req.cookies['user_id'];
  let animId = req.params['animId'];
  let newAnimName = req.params['newAnimName'];
  if (!uid) {
    res.json('No user id found');
  } else {
    User.findOne({username: uid}, (err, user) => {
      if (!user) {
        res.json('Must own project to save');
      } else {
        let animIndex = -1;
        for (let i in user.animations) {
          console.log(user.animations[i]);
          if (user.animations[i]._id == animId) {
            animIndex = i;
            break;
          }
        }
        if (animIndex === -1) {
          res.json({success: false, warning: 'Unauthorized or animation does not exist'});
        } else {
          user.animations[animIndex].name = newAnimName;
          user.animations[animIndex].data = req.body;
          user.save()
            .then(() => {
              res.json('Saved successfully');
            });
        }
      }
    });
  }
})

router.get('/gif/animation/:animId', (req, res) => {
  let uid = req.cookies['user_id'];
  let animId = req.params['animId'];
  if (!uid) {
    res.json('No user id found');
  } else {
    User.findOne({username: uid}, (err, user) => {
      if (!user) {
        res.json('Must own project to save');
      } else {
        let animIndex = -1;
        for (let i in user.animations) {
          console.log(user.animations[i]);
          if (user.animations[i]._id == animId) {
            animIndex = i;
            break;
          }
        }
        if (animIndex === -1) {
          res.json({success: false, warning: 'Unauthorized or animation does not exist'});
        } else {
          res.contentType('image/gif');
          res.send(user.animations[animIndex].gif);
        }
      }
    });
  }
})

router.post('/gif/animation/:animId', (req, res) => {
  let uid = req.cookies['user_id'];
  let animId = req.params['animId'];
  if (!uid) {
    res.json('No user id found');
  } else {
    User.findOne({username: uid}, (err, user) => {
      if (!user) {
        res.json('Must own project to save');
      } else {
        let animIndex = -1;
        for (let i in user.animations) {
          console.log(user.animations[i]);
          if (user.animations[i]._id == animId) {
            animIndex = i;
            break;
          }
        }
        if (animIndex === -1) {
          res.json({success: false, warning: 'Unauthorized or animation does not exist'});
        } else {
          user.animations[animIndex].gif = fs.readFileSync(req.files.image.path);
          user.save()
            .then(() => {
              res.json('Saved successfully');
            });
        }
      }
    });
  }
})

module.exports = router;
