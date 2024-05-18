import Joi from "joi";

export const getHeader = Joi.object({
  header: Joi.string(),
  display: Joi.boolean(),
});

export const postHeader = Joi.object({
  header: Joi.any(),
  display: Joi.boolean(),
});

export const updateHeader = Joi.object({
  header: Joi.any(),
  display: Joi.boolean(),
});
