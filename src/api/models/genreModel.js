const mongoose = require('mongoose');

/**
 * Genre Schema
 * @private
 */
const GenreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 100
  }
});

// Virtual for this genre instance URL.
GenreSchema
  .virtual('url')
  .get(function () {
    return '/genres/' + this._id;
  });

// Export model.
module.exports = mongoose.model('Genre', GenreSchema);
