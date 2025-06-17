import { client } from '../../lib/client';
import { sendEmail } from '../../lib/sendEmail'; // Import sendEmail utility

// Helper function to generate email HTML
const generateUserEmailHtml = (data) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6;">
    <p>Hi ${data.userName || 'Valued Customer'},</p>
    <p>Thank you for your pre-order with ${process.env.NEXT_PUBLIC_APP_NAME || 'us'}!</p>
    <p>We've received your request and will notify you once your order is processed and ready for shipment.</p>
    <p><strong>Pre-order Summary:</strong></p>
    <ul style="list-style-type: none; padding: 0;">
      <li><strong>Product:</strong> ${data.productName}</li>
      <li><strong>Quantity:</strong> ${data.quantity}</li>
      ${data.shippingAddress && data.shippingAddress.street ? `
      <li><strong>Shipping Address:</strong> ${data.shippingAddress.street}, ${data.shippingAddress.city}, ${data.shippingAddress.postalCode || ''}, ${data.shippingAddress.country}</li>
      ` : ''}
    </ul>
    <p>If you have any questions, please don't hesitate to contact us.</p>
    <p>Thanks,<br/>The ${process.env.NEXT_PUBLIC_APP_NAME || 'Team'}</p>
  </div>
`;

const generateAdminEmailHtml = (data) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6;">
    <p>A new pre-order has been received for ${process.env.NEXT_PUBLIC_APP_NAME || 'the store'}.</p>
    <p><strong>User Details:</strong></p>
    <ul style="list-style-type: none; padding: 0;">
      <li><strong>User ID:</strong> ${data.userId}</li>
      <li><strong>Name:</strong> ${data.userName || 'N/A'}</li>
      <li><strong>Email:</strong> ${data.userEmail}</li>
    </ul>
    <p><strong>Order Details:</strong></p>
    <ul style="list-style-type: none; padding: 0;">
      <li><strong>Product:</strong> ${data.productName}</li>
      <li><strong>Product ID:</strong> ${data.productId || 'N/A'}</li>
      <li><strong>Quantity:</strong> ${data.quantity}</li>
      ${data.shippingAddress && data.shippingAddress.street ? `
      <li><strong>Shipping Address:</strong> ${data.shippingAddress.street}, ${data.shippingAddress.city}, ${data.shippingAddress.postalCode || ''}, ${data.shippingAddress.country}</li>
      ` : '<li><strong>Shipping Address:</strong> Not provided</li>'}
      <li><strong>Notes:</strong> ${data.notes || 'None'}</li>
      <li><strong>Pre-order Date:</strong> ${new Date(data.preorderDate).toLocaleString()}</li>
    </ul>
    <p>Please review this pre-order in the admin panel.</p>
  </div>
`;

export default async function createPreorder(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const {
    userId,
    userName,
    userEmail,
    productName,
    productId,
    quantity,
    shippingAddress,
    notes,
  } = req.body;

  // Basic validation
  if (!userId || !userEmail || !productName || !quantity) {
    return res.status(400).json({ message: 'Missing required fields: userId, userEmail, productName, and quantity are required.' });
  }

  if (typeof quantity !== 'number' || quantity < 1) {
    return res.status(400).json({ message: 'Quantity must be a number and at least 1.' });
  }

  try {
    const preorderData = {
      _type: 'preorder',
      userId,
      userName: userName || '', // Optional
      userEmail,
      productName,
      productId: productId || '', // Optional
      quantity,
      preorderDate: new Date().toISOString(),
      status: 'pending', // Default status
      shippingAddress: shippingAddress || {}, // Optional, ensure object structure
      notes: notes || '', // Optional
    };

    const createdPreorder = await client.create(preorderData);

    let emailSentSuccessfully = true;
    let emailError = null;

    // Send emails
    try {
      // User confirmation email
      const userEmailHtml = generateUserEmailHtml({ ...preorderData, userName: preorderData.userName || userEmail.split('@')[0] });
      await sendEmail({
        to: userEmail,
        subject: `Your Pre-order Confirmation - ${productName}`,
        html: userEmailHtml,
      });
      console.log(`Pre-order confirmation email sent to ${userEmail}`);

      // Admin notification email
      if (process.env.ADMIN_EMAIL_ADDRESS) {
        const adminEmailHtml = generateAdminEmailHtml(preorderData);
        await sendEmail({
          to: process.env.ADMIN_EMAIL_ADDRESS,
          subject: `New Pre-order Received - ${productName}`,
          html: adminEmailHtml,
        });
        console.log(`Admin notification email sent to ${process.env.ADMIN_EMAIL_ADDRESS}`);
      } else {
        console.warn('ADMIN_EMAIL_ADDRESS is not set. Skipping admin notification.');
      }

    } catch (mailError) {
      console.error('Failed to send pre-order emails:', mailError);
      emailSentSuccessfully = false;
      emailError = mailError.message || 'Unknown email error';
      // Do not stop the process, pre-order is already saved.
      // The client will still get a 200 OK for the pre-order creation.
    }

    if (!emailSentSuccessfully) {
      // Optionally, include a note in the response if email failed but preorder was created
      return res.status(200).json({
        ...createdPreorder,
        emailNotificationInfo: `Pre-order created successfully, but email notification failed. Error: ${emailError}`
      });
    }

    return res.status(200).json(createdPreorder);
  } catch (error) {
    console.error('Error creating preorder or sending email:', error);
    // Check if the error is from Sanity client (this might be shadowed by email error handling if not careful)
    // This specific block handles errors from client.create(preorderData) primarily
    if (error.isOperational && error.response && error.response.body && error.response.body.error) { // Example: Sanity client error
        return res.status(500).json({ message: 'Error creating preorder in Sanity', details: error.response.body.error });
    }
    // General error (could be from Sanity client before email sending, or other unexpected errors)
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
