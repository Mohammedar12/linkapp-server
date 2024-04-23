const Joi = require("joi");

const getHeader = Joi.object({
  header: Joi.string(),
  display: Joi.boolean(),
});

const postHeader = Joi.object({
  header: Joi.any(),
  display: Joi.boolean(),
});

const updateHeader = Joi.object({
  header: Joi.any(),
  display: Joi.boolean(),
});

module.exports = { getHeader, postHeader, updateHeader };
