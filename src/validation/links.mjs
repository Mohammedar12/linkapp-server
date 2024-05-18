import Joi from "joi";

export const getLink = Joi.object({
  title: Joi.string(),
  url: Joi.string(),
});

export const postLink = Joi.object({
  title: Joi.string().min(3),
  url: Joi.string().required(),
});

export const updateLink = Joi.object({
  title: Joi.string().min(3),
  url: Joi.string(),
});
