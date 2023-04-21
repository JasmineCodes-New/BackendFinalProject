const mongoose = require("mongoose");
const Schema = mongoose.Schema; 

const StateSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  funfacts: [String],
}, { collection: 'test.states' });

module.exports = mongoose.model('State', StateSchema);