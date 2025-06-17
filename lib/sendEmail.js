import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '465', 10),
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  // Optional: Add logger and debug for more detailed output in development
  // logger: true,
  // debug: true,
});

/**
 * Sends an email using the pre-configured Nodemailer transporter.
 * @param {object} mailOptions - Email options.
 * @param {string} mailOptions.to - Recipient's email address.
 * @param {string} mailOptions.subject - Subject line.
 * @param {string} mailOptions.html - HTML body of the email.
 * @param {string} [mailOptions.text] - Optional plain text body.
 * @returns {Promise<object>} Nodemailer response object on success.
 * @throws {Error} If email sending fails.
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  const mailOptions = {
    from: `"${process.env.NEXT_PUBLIC_APP_NAME || 'Your App Name'}" <${process.env.EMAIL_USER}>`, // Sender address (shows your name and email)
    to,
    subject,
    html,
    text, // Optional plain text version
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    // Log more details if available from the error object
    if (error.response) {
      console.error('Error response:', error.response);
    }
    if (error.responseCode) {
      console.error('Error response code:', error.responseCode);
    }
    // Re-throw the error so the caller can handle it if needed
    // For this specific subtask, createPreorder.js will log it but not fail the request
    throw error;
  }
};

// Verify transporter configuration when the server starts (optional, for debugging)
if (process.env.NODE_ENV !== 'production') { // Run only in dev
  transporter.verify(function (error, success) {
    if (error) {
      console.error('Nodemailer transporter verification error:', error);
      console.warn(
        '\n--- Nodemailer Configuration Advice ---',
        '\nEnsure your .env file has correct EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE, EMAIL_USER, and EMAIL_PASSWORD.',
        '\nIf using Gmail, you might need to:',
        '\n1. Enable "Less secure app access" (not recommended for production).',
        '\n2. Or, preferably, use an "App Password" if 2-Step Verification is enabled.',
        '\nReview the error message above for specific clues from Nodemailer.',
        '\n--- End Nodemailer Configuration Advice ---\n'
      );
    } else {
      console.log('Nodemailer transporter is configured correctly and ready to send emails.');
    }
  });
}
