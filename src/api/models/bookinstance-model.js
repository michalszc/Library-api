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

/**
 * Statics
 */
BookInstanceSchema.static({
  async getList({ publisher = '', status = '', sort = { status: 1 }, skip = 0, limit = '', fields = {} }) {
    return await this.find({
      publisher: new RegExp(`${publisher}.*`),
      status: new RegExp(`${status}.*`)
    },
    fields,
    {
      sort,
      skip,
      limit
    });
  }
});

// Virtual for this bookinstance object's URL.
BookInstanceSchema
  .virtual('url')
  .get(function () {
    return '/bookinstances/' + this._id;
  });

// Export model.
const BookInstance = mongoose.model('BookInstance', BookInstanceSchema);
module.exports = BookInstance;
