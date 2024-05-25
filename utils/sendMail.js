const nodemailer = require('nodemailer');

  //1) create a transporter
  const transporter = nodemailer.createTransport({
    service:'gmail',
    // host: process.env.EMAIL_HOST,
    // port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASSWORD
    }
    //disable in gmail "less secure app" option
  });

const sendEmail = async options => {
try
  {//2)define some options for email
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.email,
    subject: options.subject,
    text: options.message
    // html:
  };

   // Actually send the email
   await transporter.sendMail(mailOptions);
   console.log('Mail Sent');
}catch( err) {
    console.log('Unable To send mail', err);
}
};

module.exports = sendEmail;