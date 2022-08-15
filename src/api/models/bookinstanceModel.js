const mongoose = require('mongoose');

/**
 * Book Instance Schema
 * @private
 */
const BookInstanceSchema = new mongoose.Schema({
  // Reference to the associated book.
  book: {
    type: mongoose.Schema.ObjectId,
    ref: 'Book',
    required: true
  },
  publisher: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Available', 'Maintenance', 'Loaned', 'Reserved'],
    default: 'Maintenance'
  },
  back: {
    type: Date,
    default: Date.now
  }
});

// Virtual for this bookinstance object's URL.
BookInstanceSchema
  .virtual('url')
  .get(function () {
    return '/bookinstances/' + this._id;
  });

// Export model.
module.exports = mongoose.model('BookInstance', BookInstanceSchema);
