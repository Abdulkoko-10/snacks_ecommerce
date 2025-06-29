// lib/sendEmail.js
import nodemailer from 'nodemailer';

// Configure the transporter using environment variables
// These would be for a generic SMTP setup.
// For services like SendGrid, the setup might be different (e.g., using their API key).
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SMTP_HOST,
  port: process.env.EMAIL_SMTP_PORT,
  secure: process.env.EMAIL_SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SMTP_USER,
    pass: process.env.EMAIL_SMTP_PASSWORD,
  },
});

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  // Adjust currency as needed, e.g., 'NGN' for Naira
};

// Helper to format address (optional, but makes email cleaner)
const formatShippingAddress = (address) => {
  if (!address) return 'Not provided.';
  let parts = [address.fullName, address.street, address.city];
  if (address.state) parts.push(address.state);
  parts.push(address.postalCode);
  parts.push(address.country);
  if (address.phoneNumber) parts.push(`Tel: ${address.phoneNumber}`);
  return parts.filter(Boolean).join('<br>'); // Filter out empty parts and join
};

export const sendPreOrderConfirmationEmail = async (userEmail, userName, preOrderDetails) => {
  const { _id, cartItems, totalPrice, createdAt, shippingAddress } = preOrderDetails; // Add shippingAddress

  let itemsHtml = '<table style="width:100%; border-collapse: collapse;"><tr><th style="border: 1px solid #ddd; padding: 8px; text-align:left;">Item</th><th style="border: 1px solid #ddd; padding: 8px; text-align:left;">Quantity</th><th style="border: 1px solid #ddd; padding: 8px; text-align:left;">Price</th></tr>';
  cartItems.forEach(item => {
    itemsHtml += `<tr>
                      <td style="border: 1px solid #ddd; padding: 8px;">${item.name}</td>
                      <td style="border: 1px solid #ddd; padding: 8px;">${item.quantity}</td>
                      <td style="border: 1px solid #ddd; padding: 8px;">${formatCurrency(item.price * item.quantity)}</td>
                    </tr>`;
  });
  itemsHtml += '</table>';

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Your Company Name'}" <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: userEmail,
    subject: 'Your Pre-Order Confirmation',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #333;">Thank you for your pre-order, ${userName || 'Customer'}!</h2>
        <p>We've received your pre-order (ID: ${_id}) placed on ${new Date(createdAt).toLocaleDateString()}. Here are the details:</p>
        ${itemsHtml}
        <p style="font-weight: bold; font-size: 1.1em;">Total: ${formatCurrency(totalPrice)}</p>
        <p><strong>Shipping Address:</strong></p><p>${formatShippingAddress(shippingAddress)}</p>
        <p>We will notify you once your items are ready for shipment or further processing.</p>
        <p>Thank you for choosing us!</p>
        <p>Best regards,</p>
        <p>The Team at ${process.env.EMAIL_FROM_NAME || 'Your Company Name'}</p>
      </div>
    `,
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log('Pre-order confirmation email sent successfully to:', userEmail);
    console.log('Nodemailer sendMail info (User Email):', JSON.stringify(info, null, 2)); // Log full info
    return true;
  } catch (error) {
    console.error('Error sending pre-order confirmation email (from lib/sendEmail.js):', error.message); // Log just message for brevity first
    console.error('Nodemailer error details (User Email):', JSON.stringify(error, Object.getOwnPropertyNames(error), 2)); // Log full error object
    // Do not throw error here to prevent breaking the main API flow if email fails,
    // but log it for monitoring. Decide if email failure should be critical.
    return false;
  }
};

export const sendAdminPreOrderNotificationEmail = async (adminEmail, preOrderDetails, userDetails) => {
  const { _id, cartItems, totalPrice, createdAt, userId, shippingAddress } = preOrderDetails; // Add shippingAddress
  const userName = userDetails.name; // e.g., user.firstName or email
  const userEmail = userDetails.email; // e.g., user.emailAddresses[0]?.emailAddress

  // Link to Sanity document (requires knowing your Sanity project structure)
  // Example: https://<your-project-id>.sanity.studio/desk/preOrder;<document-id>
  // This is a best guess; actual URL might vary.
  const sanityDocumentLink = `https://${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'ise1lfsl'}.sanity.studio/desk/preOrder;${_id}`;


  let itemsHtml = '<table style="width:100%; border-collapse: collapse;"><tr><th style="border: 1px solid #ddd; padding: 8px; text-align:left;">Item</th><th style="border: 1px solid #ddd; padding: 8px; text-align:left;">Quantity</th><th style="border: 1px solid #ddd; padding: 8px; text-align:left;">Price</th></tr>';
  cartItems.forEach(item => {
    itemsHtml += `<tr>
                      <td style="border: 1px solid #ddd; padding: 8px;">${item.name}</td>
                      <td style="border: 1px solid #ddd; padding: 8px;">${item.quantity}</td>
                      <td style="border: 1px solid #ddd; padding: 8px;">${formatCurrency(item.price * item.quantity)}</td>
                    </tr>`;
  });
  itemsHtml += '</table>';

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Koko Pre-Order System'}" <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: adminEmail, // The admin's email address
    subject: `New Pre-Order Received - ID: ${_id}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #333;">New Pre-Order Notification</h2>
        <p>A new pre-order (ID: <strong>${_id}</strong>) was placed on ${new Date(createdAt).toLocaleDateString()} at ${new Date(createdAt).toLocaleTimeString()}.</p>

        <h3 style="color: #444;">User Details:</h3>
        <p>User ID: ${userId}</p>
        <p>User Name: ${userName || 'N/A'}</p>
        <p>User Email: ${userEmail || 'N/A'}</p>

        <h3 style="color: #444;">Pre-Order Details:</h3>
        ${itemsHtml}
        <p style="font-weight: bold; font-size: 1.1em;">Total: ${formatCurrency(totalPrice)}</p>

        <h3 style="color: #444;">Shipping Address:</h3><p>${formatShippingAddress(shippingAddress)}</p>

        <p>You can view the pre-order details in Sanity here:</p>
        <p><a href="${sanityDocumentLink}" target="_blank" style="color: #007bff; text-decoration: none;">View Pre-Order in Sanity</a></p>

        <p>Please process this pre-order accordingly.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Admin pre-order notification email sent successfully to:', adminEmail);
    return true;
  } catch (error) {
    console.error('Error sending admin pre-order notification email:', error);
    return false; // Log error but don't break main flow
  }
};
