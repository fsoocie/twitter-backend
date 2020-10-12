import nodemailer from "../core/mailer";
import {SentMessageInfo} from "nodemailer";

interface sendEmailProps {
  fromEmail: string,
  toEmail: string,
  subject: string,
  html: string,
}

export const sendEmail = (
  {fromEmail, toEmail, subject, html}: sendEmailProps,
  callback?: (err: (Error | null), info: SentMessageInfo) => void) => {
  nodemailer.sendMail({
    from: fromEmail,
    to: toEmail,
    subject,
    html
  }, callback || function (err: (Error | null), info: SentMessageInfo) {
    if (err) {
      console.log(err)
    }
    else {
      console.log(info)
    }
  })
}
