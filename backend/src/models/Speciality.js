const mongoose = require('mongoose');

const specialitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  requirements: {
    type: [String],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Speciality', specialitySchema);