const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
  userName: {
    type: String,
    required: true
  },
	time: {
    type: Date,
    required: true,
    default: Date.now
  },
  body: {
    caption: String,
    photoURL: String
  },
	reactions: {
    like: Number,
    haha: Number,
    love: Number,
    wow: Number,
    care: Number,
    sad: Number,
    angry: Number,
  },
  comments: [{
    userName: String,
    body: String,
    time: Date
  }]
})

module.exports = mongoose.model('Post', postSchema)