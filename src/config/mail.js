import nodemailer from "nodemailer"

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "samitale86@gmail.com",
    pass: "tmyw puvv sdbm tzyi",
  },
})
