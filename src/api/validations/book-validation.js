const { Joi } = require('express-validation');

module.exports = {

  // GET /books/
  bookList: {
    body: Joi.object({
      title: Joi.string().min(1).max(100),
      authorId: Joi.string().regex(/^[a-fA-F0-9]{24}$/),
      summary: Joi.string().min(1).max(500),
      isbn: Joi.string().regex(/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/),
      genreId: Joi.string().regex(/^[a-fA-F0-9]{24}$/),
      sort: Joi.object().pattern(/_id|title|author|summary|isbn|genre/,
        Joi.alternatives().try(
          Joi.number().valid(1, -1),
          Joi.string().valid('ascending', 'asc', 'descending', 'desc')
        )).min(1),
      skip: Joi.number().min(0),
      limit: Joi.number().min(0),
      only: Joi.array().items(Joi.string().valid('__v', '_id', 'title', 'author', 'summary', 'isbn', 'genre')).min(1),
      omit: Joi.array().items(Joi.string().valid('__v', '_id', 'title', 'author', 'summary', 'isbn', 'genre')).min(1)

    }).oxor('only', 'omit')
  },

  // POST /books/
  bookCreate: {
    body: Joi.object({
      title: Joi.string().min(1).max(100).required(),
      authorId: Joi.string().regex(/^[a-fA-F0-9]{24}$/),
      author: Joi.object({
        firstName: Joi.string().min(3).max(100).required(),
        lastName: Joi.string().min(3).max(100).required(),
        dateOfBirth: Joi.date().max('now').required(),
        dateOfDeath: Joi.date().greater(Joi.ref('dateOfBirth')).max('now')
      }),
      summary: Joi.string().min(1).max(500).required(),
      isbn: Joi.string().regex(/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/).required(),
      genreId: Joi.string().regex(/^[a-fA-F0-9]{24}$/),
      genre: Joi.object({
        name: Joi.string().min(3).max(100).required()
      })
    }).xor('author', 'authorId').oxor('genre', 'genreId')
  }

};