const { Joi } = require('express-validation');

module.exports = {

  // GET /authors/
  authorList: {
    body: Joi.object({
      firstName: Joi.string().allow('').max(100),
      lastName: Joi.string().allow('').max(100),
      dateOfBirth: Joi.object().pattern(/^e$|^lt$|^lte$|^gt$|^gte$/, Joi.date().max('now')),
      dateOfDeath: Joi.object().pattern(/^e$|^lt$|^lte$|^gt$|^gte$/, Joi.date().max('now')),
      sort: Joi.object().pattern(/^_id$|^firstName$|^lastName$|^dateOfBirth$|^dateOfDeath$/,
        Joi.alternatives().try(
          Joi.number().valid(1, -1),
          Joi.string().valid('ascending', 'asc', 'descending', 'desc')
        )).min(1),
      skip: Joi.number().min(0),
      limit: Joi.number().min(0),
      only: Joi.array().items(Joi.string()
        .valid('__v', '_id', 'firstName', 'lastName', 'dateOfBirth', 'dateOfDeath')).min(1),
      omit: Joi.array().items(Joi.string()
        .valid('__v', '_id', 'firstName', 'lastName', 'dateOfBirth', 'dateOfDeath')).min(1)
    }).oxor('only', 'omit')
  },

  // GET /authors/:id
  authorDetail: {
    params: Joi.object({
      id: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required()
    }),
    body: Joi.object({
      only: Joi.array().items(Joi.string()
        .valid('__v', '_id', 'firstName', 'lastName', 'dateOfBirth', 'dateOfDeath')).min(1),
      omit: Joi.array().items(Joi.string()
        .valid('__v', '_id', 'firstName', 'lastName', 'dateOfBirth', 'dateOfDeath')).min(1),
      showBookList: Joi.bool()
    })
  },

  // POST /authors/multiple/
  authorCreateMany: {
    body: Joi.object({
      authors: Joi.array().items(
        Joi.object({
          firstName: Joi.string().min(3).max(100).required(),
          lastName: Joi.string().min(3).max(100).required(),
          dateOfBirth: Joi.date().max('now').required(),
          dateOfDeath: Joi.date().greater(Joi.ref('dateOfBirth')).max('now')
        })
      ).min(1).required()
    })
  },

  // POST /authors/
  authorCreate: {
    body: Joi.object({
      firstName: Joi.string().min(3).max(100).required(),
      lastName: Joi.string().min(3).max(100).required(),
      dateOfBirth: Joi.date().max('now').required(),
      dateOfDeath: Joi.date().greater(Joi.ref('dateOfBirth')).max('now')
    })
  },

  // DELETE /authors/multiple
  authorDeleteMany: {
    body: Joi.object({
      ids: Joi.array().items(Joi.string().regex(/^[a-fA-F0-9]{24}$/)).min(1).required()
    })
  },

  // DELETE /authors/:id
  authorDelete: {
    params: Joi.object({
      id: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required()
    })
  },

  // PATCH /authors/multiple
  authorUpdateMany: {
    body: Joi.object({
      authors: Joi.array().items(Joi.object({
        id: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
        firstName: Joi.string().min(3).max(100),
        lastName: Joi.string().min(3).max(100),
        dateOfBirth: Joi.date().max('now'),
        dateOfDeath: Joi.date().max('now')
      }).min(2)).min(1).required()
    })
  },

  // PATCH /authors/:id
  authorUpdate: {
    body: Joi.object({
      firstName: Joi.string().min(3).max(100),
      lastName: Joi.string().min(3).max(100),
      dateOfBirth: Joi.date().max('now'),
      dateOfDeath: Joi.date().max('now')
    }).min(1),
    params: Joi.object({
      id: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required()
    })
  }

};
