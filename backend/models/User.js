const mongoose = require('mongoose');

const animationSchema = new mongoose.Schema({
  id:    Number,
  name:  String,
  data:  Object,
  gif:   Buffer
})

const userSchema = new mongoose.Schema({
  userId: Number,
  username: String,
  password: String,
  animations: [animationSchema]
});

let User = mongoose.model('User', userSchema);

module.exports = User;
