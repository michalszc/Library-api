const mongoose = require('mongoose');

const AuthorSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    maxLength: 100
  },
  lastName: {
    type: String,
    required: true,
    maxLength: 100
  },
  dateOfBirth: {
    type: Date
  },
  dateOfDeath: {
    type: Date
  }
});

// Virtual for author "full" name.
AuthorSchema.virtual('fullname').get(function () {
  return this.firstName + ', ' + this.lastName;
});

// Virtual for this author instance URL.
AuthorSchema.virtual('url').get(function () {
  return '/authors/' + this._id;
});

// Export model.
module.exports = mongoose.model('Author', AuthorSchema);
