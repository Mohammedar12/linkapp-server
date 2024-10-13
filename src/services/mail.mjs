import nodemailer from "nodemailer";
import "dotenv";

import redis from "./redis.mjs";
import handlebars from "handlebars";
import { promises as fs } from "fs";

const transporter = nodemailer.createTransport({
  service: process.env.MAIL_SERVIC,
  host: process.env.MAIL_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const readHTMLFile = async (path) => {
  try {
    let html = await fs.readFile(path, { encoding: "utf-8" });
    return html;
  } catch (e) {
    console.error("Error reading HTML file:", e);
    return false;
  }
};

export const sendEmail = async (targetMail, subject, text, isHtml) => {
  let mailOptions = {
    from: process.env.MAIL_USER,
    to: targetMail,
    subject: subject,
  };
  if (isHtml) {
    mailOptions.html = text;
  } else {
    mailOptions.text = text;
  }
  try {
    const response = await transporter.sendMail(mailOptions);
    return response;
  } catch (e) {
    console.error("Error sending email:", e);
    throw e; // Re-throw the error so it can be caught and handled by the caller
  }
};

export const sendSendTemplateMail = async (
  targetMail,
  subject,
  templatePath,
  replacements
) => {
  let redisEmailContentKey = "kenf_" + templatePath;
  let html = await redis.get(redisEmailContentKey);
  if (!html || html === "") {
    html = await readHTMLFile(templatePath);
    if (!html) {
      return false;
    }
    redis.set(redisEmailContentKey, html);
  }
  let template = handlebars.compile(html);
  let htmlToSend = template(replacements);

  console.log(targetMail);

  return await sendEmail(targetMail, subject, htmlToSend, true);
};
