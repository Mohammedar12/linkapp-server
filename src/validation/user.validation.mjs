import Joi from "joi";

export const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(8).required(),
});

// Login validation schema
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.when("authType", {
    is: "local",
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
  authType: Joi.string().valid("local", "google"),
  authId: Joi.when("authType", {
    is: "google",
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
});

// Update user validation schema
export const updateUserSchema = Joi.object({
  email: Joi.string().email(),
  username: Joi.string()
    .regex(/^[a-zA-Z0-9-_]+$/)
    .lowercase()
    .trim(),
  password: Joi.string().min(8),
  registerSteps: Joi.boolean(),
  isVerified: Joi.boolean(),
  avatar: Joi.object({
    public_id: Joi.string(),
    url: Joi.string().uri(),
  }),
  role: Joi.string().valid("user", "admin"), // Add other roles if needed
}).min(1); // Require at least one field to be present for update

// Validation functions
export const validator = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(", ");
    return res.status(400).json({ error: errorMessage });
  }

  next();
};
