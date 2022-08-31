const mongoose = require('mongoose');

/**
 * Author Schema
 * @private
 */
const AuthorSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 100
  },
  lastName: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 100
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  dateOfDeath: {
    type: Date
  }
});

/**
 * Statics
 */
AuthorSchema.static({
  async getList () {
    return await this.find()
      .sort([['family_name', 'ascending']]);
  }
});

// Virtual for author "full" name.
AuthorSchema.virtual('fullname').get(function () {
  return this.firstName + ' ' + this.lastName;
});

// Virtual for this author instance URL.
AuthorSchema.virtual('url').get(function () {
  return '/authors/' + this._id;
});

// Export model.
module.exports = mongoose.model('Author', AuthorSchema);
