const { Joi } = require('express-validation');

module.exports = {

  // GET /bookinstances/
  bookInstanceList: {
    body: Joi.object({
      sort: Joi.object().pattern(/^_id$|^book$|^publisher$|^status$|^back$/,
        Joi.alternatives().try(
          Joi.number().valid(1, -1),
          Joi.string().valid('ascending', 'asc', 'descending', 'desc')
        )).min(1),
      skip: Joi.number().min(0),
      limit: Joi.number().min(0),
      only: Joi.array().items(Joi.string().valid('__v', '_id', 'book', 'publisher', 'status', 'back')).min(1),
      omit: Joi.array().items(Joi.string().valid('__v', '_id', 'book', 'publisher', 'status', 'back')).min(1)
    })
  }

};
