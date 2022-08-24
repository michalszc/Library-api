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
    console.log(this);
    const one = await Genre.findOne({ name: this.name });
    if (one) {
      throw Error('Genre already exists');
    }
    return this.save();
  }
});

/**
 * Statics
 */
 GenreSchema.static({
  async getList() {
    return await this.find()
      .sort([['name', 'ascending']]);
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
