const mongoose = require('mongoose');

const { Schema } = mongoose;

const usersSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  userAdded:{
    type:[String],
    default:[]
  },
  biengAddedto:{
    type:[String],
    default:[]
  }
});

module.exports = mongoose.model('users', usersSchema);
