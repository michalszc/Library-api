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

/**
 * Methods
 */
GenreSchema.method({
  async saveIfNotExists () {
    await Genre.checkExistence([this.name]);
    return this.save();
  }
});

/**
 * Statics
 */
GenreSchema.static({
  async getList () {
    return await this.find()
      .sort([['name', 'ascending']]);
  },
  async checkExistence (names) {
    if (await Genre.exists({ name: names })) {
      throw Error('Genre already exists');
    }
  }
});

// Virtual for this genre instance URL.
GenreSchema
  .virtual('url')
  .get(function () {
    return '/genres/' + this._id;
  });

// Export model.
const Genre = mongoose.model('Genre', GenreSchema);
module.exports = Genre;
