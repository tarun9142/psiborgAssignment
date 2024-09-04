// services/notificationService.js
const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Set up Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'Gmail', // or your preferred email service
    auth: {
      user: process.env.EMAIL_USER, // your email address
      pass: process.env.EMAIL_PASS  // your email password or app-specific password
    }
});

// Load environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;


// Initialize Twilio client
const client = twilio(accountSid, authToken);

// Function to send SMS notification
exports.sendSmsNotification = async (to, message) => {
  try {
    const response = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to,
    });
    console.log(`Notification sent to ${to}: ${response.sid}`);
  } catch (error) {
    console.error('Error sending SMS notification:', error.message);
  }
};

// Function to send email notification
exports.sendEmailNotification = async (to, subject, text) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email notification:', error.message);
  }
};
