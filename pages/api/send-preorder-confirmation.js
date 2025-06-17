// Placeholder for email sending service integration (e.g., Nodemailer, SendGrid)
// import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userEmail, userName, productItems, totalPrice, preorderDate } = req.body;

    // console.log('Received data for email confirmation:', req.body);

    // TODO: Configure email transport (e.g., SMTP details or service API key)
    // Example using Nodemailer with a Gmail account (less secure, for testing/dev only):
    /*
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Ensure these are set in your .env file
        pass: process.env.EMAIL_PASS,
      },
    });
    */

    // TODO: Construct email message
    const emailHtml = `
      <h1>Thank you for your pre-order, ${userName}!</h1>
      <p>Your pre-order placed on ${new Date(preorderDate).toLocaleDateString()} has been received.</p>
      <h2>Order Summary:</h2>
      <ul>
        ${productItems.map(item => `<li>${item.name} (Qty: ${item.quantity}) - N${item.price * item.quantity}</li>`).join('')}
      </ul>
      <p><strong>Total: N${totalPrice}</strong></p>
      <p>We will notify you once your items are ready for shipment.</p>
      <p>If you have any questions, please contact us at koko@snacks.com.</p>
    `;

    const mailOptions = {
      from: '"Koko Snacks" <noreply@kokosnacks.com>', // Sender address
      to: userEmail, // List of receivers
      subject: 'Your Koko Snacks Pre-order Confirmation', // Subject line
      html: emailHtml, // HTML body
    };

    try {
      // TODO: Send the email
      // await transporter.sendMail(mailOptions);
      // console.log('Email sent successfully to:', userEmail);

      // For now, simulate successful email sending
      console.log('Simulating email confirmation sent to:', userEmail);
      console.log('Email HTML body:', emailHtml); // Log the HTML for review during development
      res.status(200).json({ message: 'Email confirmation sent successfully (simulated).' });

    } catch (error) {
      console.error('Error sending email confirmation:', error);
      res.status(500).json({ message: 'Error sending email confirmation.', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end('Method Not Allowed');
  }
}
