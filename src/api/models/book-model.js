const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

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
  async saveIfNotExists() {
    await Book.checkExistence(this);
    return this.save();
  }
});

/**
 * Statics
 */
BookSchema.static({
  async getList({
    title = '', author = '', summary = '',
    isbn = '', genre = '', sort = { title: 1 },
    skip = 0, limit = '', fields = {}, populate = []
  }) {
    const projection = {
      title: new RegExp(`${title}.*`),
      summary: new RegExp(`${summary}.*`),
      isbn: new RegExp(`${isbn}.*`)
    };
    if (author) {
      projection.author = new ObjectId(author);
    }
    if (genre && Array.isArray(genre)) {
      projection.genre = { $all: genre.map(g => new ObjectId(g)) };
    } else if (genre) {
      projection.genre = new ObjectId(genre);
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
  async checkExistence(book) {
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
