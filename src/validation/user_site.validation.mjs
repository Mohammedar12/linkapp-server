import Joi from "joi";

export const socialSchema = Joi.object({
  platform: Joi.string(),
  url: Joi.string().uri(),
  username: Joi.string(),
  icon: Joi.string(),
});

export const imageSchema = Joi.object({
  public_id: Joi.string(),
  url: Joi.string().uri(),
});

export const themeSchema = Joi.object({
  isGradient: Joi.boolean(),
  gradient: Joi.object({
    from: Joi.string(),
    to: Joi.string(),
    dir: Joi.string(),
  }),
  bgColor: Joi.string(),
  AvatarBgColor: Joi.string(),
  isParticles: Joi.boolean(),
  isReadyTheme: Joi.boolean(),
  linkStyle: Joi.object({
    isGradient: Joi.boolean(),
    bgColor: Joi.string(),
    gradient: Joi.object({
      from: Joi.string(),
      to: Joi.string(),
      dir: Joi.string(),
    }),
  }),
  headerStyle: Joi.object({
    isGradient: Joi.boolean(),
    bgColor: Joi.string(),
    gradient: Joi.object({
      from: Joi.string(),
      to: Joi.string(),
      dir: Joi.string(),
    }),
  }),
  bgImage: imageSchema,
  themeName: Joi.string(),
});

export const createUserSiteSchema = Joi.object({
  social: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(
      Joi.object({
        platform: Joi.string(),
        url: Joi.string().uri(),
        username: Joi.string(),
        icon: Joi.string(),
      })
    )
  ),
  slug: Joi.string()
    .regex(/^[a-zA-Z0-9-_]+$/)
    .lowercase()
    .trim(),
  title: Joi.string().trim().max(100),
  theme: Joi.alternatives().try(Joi.string(), Joi.object()),
  about: Joi.string().trim().max(500),
  skills: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())),
});

export const validateUserSite = (data, method) => {
  const schema = userSiteSchema.fork(["user", "slug"], (schema) =>
    method === "POST" ? schema.required() : schema
  );
  return schema.validate(data, { abortEarly: false });
};
