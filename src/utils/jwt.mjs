import jwt from "jsonwebtoken";

import "dotenv";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PRIV_KEY = fs.readFileSync(__dirname + "/../private_key.pem", "utf8");

const generateToken = (user) => {
  const _id = user._id;

  const expiresIn = "4h";

  const payload = {
    sub: _id,
    iat: Date.now(),
  };

  const signedToken = jwt.sign(payload, PRIV_KEY, {
    expiresIn: expiresIn,
    algorithm: "RS256",
  });

  return {
    token: signedToken,
    expires: expiresIn,
  };
};

export default generateToken;