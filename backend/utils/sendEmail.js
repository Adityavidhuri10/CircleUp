const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, htmlContent) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, 
      },
    });

    //  Define email options
    const mailOptions = {
      from: `"CircleUP" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    };

    //  Send email
    await transporter.sendMail(mailOptions);
    console.log(" Email sent successfully to:", to);
  } catch (error) {
    console.error(" Error sending email:", error.message);
    throw new Error("Failed to send email. Please try again later.");
  }
};

module.exports = sendEmail;

