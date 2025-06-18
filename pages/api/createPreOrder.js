// pages/api/createPreOrder.js
import { writeClient } from '../../lib/client'; // Adjust path as necessary
import { currentUser } from '@clerk/nextjs/server';
import { sendPreOrderConfirmationEmail, sendAdminPreOrderNotificationEmail } from '../../lib/sendEmail';

// Ensure you have a Sanity client configured for writes,
// possibly a separate one that uses a token with write permissions.
// This might involve setting up a new client instance or modifying the existing one
// to use a token when on the server-side.

// For example, in lib/client.js you might have something like:
// const writeClient = sanityClient({
//   projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
//   dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
//   apiVersion: '2022-03-10',
//   useCdn: false, // Important for write operations
//   token: process.env.SANITY_API_WRITE_TOKEN, // Securely stored server-side
// });
// Then import writeClient here. For now, we'll assume the existing `client` can be used
// if configured appropriately with a token for server-side operations.
// It's safer to use a dedicated write token.

export default async function handler(req, res) {
  if (!writeClient) {
    console.error('CRITICAL: Sanity write client is not initialized. SANITY_API_WRITE_TOKEN might be missing or invalid in your environment variables.');
    return res.status(500).json({ error: 'Server configuration error: Unable to connect to database. Please check SANITY_API_WRITE_TOKEN.' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const user = await currentUser();
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User not logged in.' });
    }

    // const { cartItems, totalPrice } = req.body; // Old
    const { cartItems, totalPrice, shippingAddress } = req.body; // New: include shippingAddress

    // Enhanced validation
    if (!cartItems || typeof totalPrice === 'undefined' || !Array.isArray(cartItems) || cartItems.length === 0 || !shippingAddress) {
      console.warn('Validation Error: Missing or invalid pre-order data including shippingAddress.', { body: req.body });
      return res.status(400).json({ error: 'Missing or invalid required pre-order data (cartItems, totalPrice, shippingAddress).' });
    }
    // Basic validation for shippingAddress object and required fields
    const requiredShippingFields = ['fullName', 'street', 'city', 'postalCode', 'country'];
    for (const field of requiredShippingFields) {
      if (!shippingAddress[field] || typeof shippingAddress[field] !== 'string' || shippingAddress[field].trim() === '') {
        return res.status(400).json({ error: `Shipping address is incomplete. Missing or invalid field: ${field}.`});
      }
    }

    // Prepare cart items for Sanity, ensuring they match the schema
    const sanityCartItems = cartItems.map(item => ({
      _key: item._id, // Use product ID as key for array items if it's unique
      productId: item._id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      // If you stored image asset reference in cart, transform it here if needed
      // For simplicity, assuming item.image[0] is structured correctly or you handle it
      // image: item.image && item.image[0] ? { _type: 'image', asset: { _type: 'reference', _ref: item.image[0].asset._ref } } : undefined
    }));

    const preOrderData = {
      _type: 'preOrder',
      userId: user.id,
      userName: user.emailAddresses[0]?.emailAddress || user.firstName || 'N/A', // Or other user identifying info
      cartItems: sanityCartItems,
      totalPrice: totalPrice,
      status: 'pending',
      createdAt: new Date().toISOString(),
      shippingAddress: shippingAddress, // Add shippingAddress to Sanity data
    };

    // For debugging: console.log('Attempting to create pre-order with data:', JSON.stringify(preOrderData, null, 2));
    const createdPreOrder = await writeClient.create(preOrderData);

    if (createdPreOrder) {
      // Send confirmation email (fire and forget, or await if critical)
      sendPreOrderConfirmationEmail(
        user.emailAddresses[0]?.emailAddress, // User's email
        user.firstName || user.emailAddresses[0]?.emailAddress.split('@')[0], // User's name
        createdPreOrder // The newly created pre-order document
      ).catch(emailError => {
        // Log email sending errors without failing the API response for pre-order creation
        console.error("Background user email sending failed:", emailError);
      });

      // Admin notification email
      const adminEmail = process.env.ADMIN_EMAIL_ADDRESS;
      if (adminEmail) {
        sendAdminPreOrderNotificationEmail(
          adminEmail,
          createdPreOrder,
          {
            name: user.firstName || user.emailAddresses[0]?.emailAddress.split('@')[0],
            email: user.emailAddresses[0]?.emailAddress,
            id: user.id // Pass user ID if needed by admin email template
          }
        ).catch(adminEmailError => {
          console.error("Background admin email sending failed:", adminEmailError);
        });
      } else {
        console.warn('Admin email address (ADMIN_EMAIL_ADDRESS) not configured. Skipping admin notification.');
      }
    }

    return res.status(201).json({ message: 'Pre-order created successfully', preOrder: createdPreOrder });

  } catch (error) {
    console.error('Failed to create pre-order. Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));

    let errorMessage = 'Failed to create pre-order in database.';
    let errorDetails = error.message;
    let statusCode = 500;

    // Check for Sanity client specific 'isBoom' property for Boom errors
    if (error.isBoom && error.output && error.output.payload) {
      console.error('Sanity client Boom error details:', JSON.stringify(error.output.payload, null, 2));
      errorMessage = error.output.payload.message || 'Error interacting with database.';
      errorDetails = error.output.payload.error || error.output.payload.message || errorDetails; // Sanity specific error message
      statusCode = error.output.payload.statusCode || statusCode;
    } else if (error.response && error.response.body && error.response.body.error) { // General structure for some client errors
       console.error('Sanity error details from response body:', JSON.stringify(error.response.body.error, null, 2));
       errorMessage = error.response.body.error.description || error.response.body.error.message || 'Error processing request with database.';
       errorDetails = error.response.body.error;
       statusCode = error.response.statusCode || statusCode; // Use statusCode from response if available
    }

    return res.status(statusCode).json({ error: errorMessage, details: errorDetails });
  }
}
