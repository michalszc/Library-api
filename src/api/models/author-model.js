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
 * Methods
 */
AuthorSchema.method({
  async saveIfNotExists() {
    await Author.checkExistence(this);
    return this.save();
  }
});

/**
 * Statics
 */
AuthorSchema.static({
  async getList({
    firstName, lastName, dateOfBirth,
    or, sort = { firstName: 1 }, skip = 0,
    limit = '', fields = {}
  }) {
    return await this.find({
      firstName: new RegExp(`${firstName}.*`),
      lastName: new RegExp(`${lastName}.*`),
      dateOfBirth,
      $or: or
    },
    fields,
    {
      sort,
      skip,
      limit
    });
  },
  async checkExistence(author) {
    if (await Author.exists({
      firstName: author.firstName,
      lastName: author.lastName,
      dateOfBirth: author.dateOfBirth,
      dateOfDeath: author?.dateOfDeath
    })) {
      throw Error('Author(s) already exist(s)');
    }
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
const Author = mongoose.model('Author', AuthorSchema);
module.exports = Author;
