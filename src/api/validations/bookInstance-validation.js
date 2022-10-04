const { Joi } = require('express-validation');

module.exports = {

  // GET /bookinstances/
  bookInstanceList: {
    body: Joi.object({
      bookId: Joi.string().regex(/^[a-fA-F0-9]{24}$/),
      book: Joi.object({
        title: Joi.string().min(1).max(100).required(),
        authorId: Joi.string().regex(/^[a-fA-F0-9]{24}$/),
        author: Joi.object({
          firstName: Joi.string().min(3).max(100).required(),
          lastName: Joi.string().min(3).max(100).required(),
          dateOfBirth: Joi.object().pattern(/^e$|^lt$|^lte$|^gt$|^gte$/, Joi.date().max('now')).required(),
          dateOfDeath: Joi.object().pattern(/^e$|^lt$|^lte$|^gt$|^gte$/, Joi.date().max('now'))
        }).min(1),
        summary: Joi.string().min(1).max(500).required(),
        isbn: Joi.string()
          .regex(/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/)
          .required(),
        genreId: Joi.alternatives().try(
          Joi.array().items(Joi.string().regex(/^[a-fA-F0-9]{24}$/)).min(1),
          Joi.string().regex(/^[a-fA-F0-9]{24}$/)
        ),
        genre: Joi.alternatives().try(
          Joi.array().items(
            Joi.object({
              name: Joi.string().min(3).max(100).required()
            })
          ).min(1),
          Joi.object({
            name: Joi.string().min(3).max(100).required()
          })
        )
      }).xor('author', 'authorId').oxor('genre', 'genreId'),
      publisher: Joi.string().min(3).max(100),
      status: Joi.string().valid('Available', 'Maintenance', 'Loaned', 'Reserved'),
      back: Joi.object().pattern(/^e$|^lt$|^lte$|^gt$|^gte$/, Joi.date()),
      sort: Joi.object().pattern(/^_id$|^book$|^publisher$|^status$|^back$/,
        Joi.alternatives().try(
          Joi.number().valid(1, -1),
          Joi.string().valid('ascending', 'asc', 'descending', 'desc')
        )).min(1),
      skip: Joi.number().min(0),
      limit: Joi.number().min(0),
      only: Joi.array().items(Joi.string().valid('__v', '_id', 'book', 'publisher', 'status', 'back')).min(1),
      omit: Joi.array().items(Joi.string().valid('__v', '_id', 'book', 'publisher', 'status', 'back')).min(1),
      showBook: Joi.bool(),
      showAuthor: Joi.bool(),
      showGenre: Joi.bool()
    }).oxor('book', 'bookId')
  },

  // GET /bookinstances/:id
  bookInstanceDetail: {
    params: Joi.object({
      id: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required()
    }),
    body: Joi.object({
      only: Joi.array()
        .items(Joi.string().valid('__v', '_id', 'book', 'publisher', 'status', 'back')).min(1),
      omit: Joi.array()
        .items(Joi.string().valid('__v', '_id', 'book', 'publisher', 'status', 'back')).min(1),
      showBook: Joi.bool(),
      showAuthor: Joi.bool(),
      showGenre: Joi.bool()
    })
  },

  // POST /bookinstances/
  bookInstanceCreate: {
    body: Joi.object({
      bookId: Joi.string().regex(/^[a-fA-F0-9]{24}$/),
      book: Joi.object({
        title: Joi.string().min(1).max(100).required(),
        authorId: Joi.string().regex(/^[a-fA-F0-9]{24}$/),
        author: Joi.object({
          firstName: Joi.string().min(3).max(100).required(),
          lastName: Joi.string().min(3).max(100).required(),
          dateOfBirth: Joi.object().pattern(/^e$|^lt$|^lte$|^gt$|^gte$/, Joi.date().max('now')).required(),
          dateOfDeath: Joi.object().pattern(/^e$|^lt$|^lte$|^gt$|^gte$/, Joi.date().max('now'))
        }).min(1),
        summary: Joi.string().min(1).max(500).required(),
        isbn: Joi.string()
          .regex(/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/)
          .required(),
        genreId: Joi.alternatives().try(
          Joi.array().items(Joi.string().regex(/^[a-fA-F0-9]{24}$/)).min(1),
          Joi.string().regex(/^[a-fA-F0-9]{24}$/)
        ),
        genre: Joi.alternatives().try(
          Joi.array().items(
            Joi.object({
              name: Joi.string().min(3).max(100).required()
            })
          ).min(1),
          Joi.object({
            name: Joi.string().min(3).max(100).required()
          })
        )
      }).xor('author', 'authorId').oxor('genre', 'genreId'),
      publisher: Joi.string().min(3).max(100).required(),
      status: Joi.string().valid('Available', 'Maintenance', 'Loaned', 'Reserved').required(),
      back: Joi.date().min('now')
    }).xor('book', 'bookId')
  },

  // DELETE /bookinstances/:id
  bookInstanceDelete: {
    params: Joi.object({
      id: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required()
    })
  },

  // PATCH /bookinstances/:id
  bookInstanceUpdate: {
    params: Joi.object({
      id: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required()
    }),
    body: Joi.object({
      bookId: Joi.string().regex(/^[a-fA-F0-9]{24}$/),
      book: Joi.object({
        title: Joi.string().min(1).max(100).required(),
        authorId: Joi.string().regex(/^[a-fA-F0-9]{24}$/),
        author: Joi.object({
          firstName: Joi.string().min(3).max(100).required(),
          lastName: Joi.string().min(3).max(100).required(),
          dateOfBirth: Joi.object().pattern(/^e$|^lt$|^lte$|^gt$|^gte$/, Joi.date().max('now')).required(),
          dateOfDeath: Joi.object().pattern(/^e$|^lt$|^lte$|^gt$|^gte$/, Joi.date().max('now'))
        }).min(1),
        summary: Joi.string().min(1).max(500).required(),
        isbn: Joi.string()
          .regex(/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/)
          .required(),
        genreId: Joi.alternatives().try(
          Joi.array().items(Joi.string().regex(/^[a-fA-F0-9]{24}$/)).min(1),
          Joi.string().regex(/^[a-fA-F0-9]{24}$/)
        ),
        genre: Joi.alternatives().try(
          Joi.array().items(
            Joi.object({
              name: Joi.string().min(3).max(100).required()
            })
          ).min(1),
          Joi.object({
            name: Joi.string().min(3).max(100).required()
          })
        )
      }).xor('author', 'authorId').oxor('genre', 'genreId'),
      publisher: Joi.string().min(3).max(100),
      status: Joi.string().valid('Available', 'Maintenance', 'Loaned', 'Reserved'),
      back: Joi.date().min('now')
    }).oxor('book', 'bookId')
  }

};
