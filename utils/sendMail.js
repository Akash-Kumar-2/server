
const nodemailer = require('nodemailer');


// 1) create a transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
});



const sendEmail = async (To, subject, message) => {
  try {
    // 2) define some options for email
const mailOptions = {
  from: { 
    name: 'Social Server',
    address: process.env.EMAIL
  },
  to: To,
  subject: subject,
  text: message
  // html:
};

    // Actually send the email
    await transporter.sendMail(mailOptions);
    console.log('Mail Sent');
  } catch (err) {
    console.log('Unable to send mail', err);
  }
};


module.exports = sendEmail;
