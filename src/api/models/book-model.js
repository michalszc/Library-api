const mongoose = require('mongoose');

/**
 * Book Schema
 * @private
 */
const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'Author',
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  isbn: {
    type: String,
    required: true
  },
  genre: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Genre'
  }]
});

/**
 * Methods
 */
BookSchema.method({
  async saveIfNotExists () {
    await Book.checkExistence(this);
    return this.save();
  }
});

/**
 * Statics
 */
BookSchema.static({
  async checkExistence (book) {
    if (await Book.exists({
      title: book.title,
      author: book.author,
      summary: book.summary,
      isbn: book.isbn,
      genre: book?.genre
    })) {
      throw Error('Book(s) already exist(s)');
    }
  }
});

// Virtual for this book instance URL.
BookSchema
  .virtual('url')
  .get(function () {
    return '/books/' + this._id;
  });

// Export model.
const Book = mongoose.model('Book', BookSchema);
module.exports = Book;
