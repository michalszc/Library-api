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
  async saveIfNotExists() {
    await Genre.checkExistence([this.name]);
    return this.save();
  }
});

/**
 * Statics
 */
GenreSchema.static({
  async getList({ name = '', sort = { name: 1 }, skip = 0, limit = '', fields = {}, or = [{}] }) {
    return await this.find({
      name: new RegExp(`${name}.*`),
      $or: or
    },
    fields,
    {
      sort,
      skip,
      limit
    });
  },
  async checkExistence(names) {
    const genres = await Genre.find({ name: names }, { _id: 0, name: 1 })
      .then(res => res.map(({ name }) => name));
    if (genres.length !== 0) {
      throw Error(`Genre(s) with name(s) ${genres.join()} already exist(s)`);
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
