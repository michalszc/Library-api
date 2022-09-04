const { Joi } = require('express-validation');

module.exports = {

  // GET /genres/
  genreList: {
    body: Joi.object({
      name: Joi.string().allow('').max(100),
      sort: Joi.object().pattern(/_id|name/,
        Joi.alternatives().try(
          Joi.number().valid(1, -1),
          Joi.string().valid('ascending', 'asc', 'descending', 'desc')
        )).min(1),
      skip: Joi.number().min(0),
      limit: Joi.number().min(0),
      only: Joi.array().items(Joi.string().valid('__v', '_id', 'name')).min(1),
      omit: Joi.array().items(Joi.string().valid('__v', '_id', 'name')).min(1)
    }).oxor('only', 'omit')
  },

  // POST /genres/
  genreCreate: {
    body: Joi.object({
      name: Joi.string().min(3).max(100).required()
    })
  },

  // POST /genres/multiple/
  genreCreateMany: {
    body: Joi.object({
      names: Joi.array().items(Joi.string().min(3).max(100)).min(1).required()
    })
  },

  // GET /genres/:id
  genreDetail: {
    params: Joi.object({
      id: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required()
    })
  },

  // DELETE /genres/multiple
  genreDeleteMany: {
    body: Joi.object({
      ids: Joi.array().items(Joi.string().regex(/^[a-fA-F0-9]{24}$/)).min(1).required()
    })
  },

  // DELETE /genres/:id
  genreDelete: {
    params: Joi.object({
      id: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required()
    })
  },

  // PATCH /genres/multiple
  genreUpdateMany: {
    body: Joi.object({
      genres: Joi.array().items({
        id: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
        name: Joi.string().min(3).max(100).required()
      }).min(1).required()
    })
  },

  // PATCH /genres/:id
  genreUpdate: {
    body: Joi.object({
      name: Joi.string().min(3).max(100).required()
    }),
    params: Joi.object({
      id: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required()
    })
  }
};
