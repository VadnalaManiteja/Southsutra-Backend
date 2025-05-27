const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'rajeshyanamadala2000@gmail.com',
    pass: 'thpr ipkp cubr hupw'
  },
  tls: {
    rejectUnauthorized: false
  }
});

const adminEmail = 'uppalahemanth4@gmail.com';

module.exports = {
  transporter,
  adminEmail
};