import jwt from "jsonwebtoken";

import "dotenv";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

const privateKey = process.env.PRIVATE_KEY;

const generateToken = (user) => {
  const _id = user._id;
  const verified = user.isVerified;

  const expiresIn = "15m";

  const payload = {
    sub: _id,
    iat: Date.now(),
    isVerified: verified,
  };

  const signedToken = jwt.sign(payload, privateKey, {
    expiresIn: expiresIn,
    algorithm: "RS256",
  });

  return {
    token: signedToken,
    expires: expiresIn,
  };
};

export default generateToken;
