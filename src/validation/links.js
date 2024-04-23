const Joi = require("joi");

const getLink = Joi.object({
  title: Joi.string(),
  url: Joi.string(),
});

const postLink = Joi.object({
  title: Joi.string().min(3),
  url: Joi.string().required(),
});

const updateLink = Joi.object({
  title: Joi.string().min(3),
  url: Joi.string(),
});

module.exports = { getLink, postLink, updateLink };
