const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const { isEmpty } = require('lodash');

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
 * Methods
 */
BookInstanceSchema.method({
  async saveIfNotExists() {
    await BookInstance.checkExistence(this);
    return this.save();
  }
});

/**
 * Statics
 */
BookInstanceSchema.static({
  async getList({
    book = '', publisher = '', status = '',
    back, sort = { status: 1 }, skip = 0,
    limit = '', fields = {}, populate = []
  }) {
    const projection = {
      publisher: new RegExp(`${publisher}.*`),
      status: new RegExp(`${status}.*`)
    };

    if (book) {
      projection.book = new ObjectId(book);
    }

    if (!isEmpty(back)) {
      projection.back = back;
    }

    return await this.find(
      projection,
      fields,
      {
        sort,
        skip,
        limit,
        populate
      });
  },
  async checkExistence(bookInstance) {
    if (await BookInstance.exists({
      book: bookInstance.book,
      publisher: bookInstance.publisher,
      status: bookInstance.status,
      back: bookInstance.back
    })) {
      throw Error('Book instance(s) already exist(s)');
    }
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
