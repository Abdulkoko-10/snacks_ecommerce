// pages/api/createPreOrder.js
import { writeClient } from '../../lib/client'; // Adjust path as necessary
import { getAuth, clerkClient } from '@clerk/nextjs/server'; // Using getAuth and clerkClient
// import { sendPreOrderConfirmationEmail, sendAdminPreOrderNotificationEmail } from '../../lib/sendEmail'; // Still commented out

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
    const auth = getAuth(req);
    if (!auth.userId) {
      return res.status(401).json({ error: 'Unauthorized: User not logged in or session not found.' });
    }

    // Fetch user details using clerkClient
    let userForPreOrder;
    try {
      const clerkUser = await clerkClient.users.getUser(auth.userId);
      if (!clerkUser) {
        return res.status(404).json({ error: 'User not found in Clerk.' });
      }
      userForPreOrder = {
        id: clerkUser.id,
        emailAddress: clerkUser.emailAddresses.find(email => email.id === clerkUser.primaryEmailAddressId)?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress,
        firstName: clerkUser.firstName,
        // Add other details as needed
      };
      if (!userForPreOrder.emailAddress) {
        console.warn(`User ${clerkUser.id} does not have a primary or any email address.`);
        // Decide if this is a critical error or if you can proceed
        // For now, let's proceed but this might be an issue for email notifications
      }
    } catch (clerkError) {
      console.error('Failed to fetch user details from Clerk:', clerkError);
      return res.status(500).json({ error: 'Failed to retrieve user details.' });
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
      userId: userForPreOrder.id,
      userName: userForPreOrder.emailAddress || userForPreOrder.firstName || 'N/A', // Or other user identifying info
      cartItems: sanityCartItems,
      totalPrice: totalPrice,
      status: 'pending',
      createdAt: new Date().toISOString(),
      shippingAddress: shippingAddress, // Add shippingAddress to Sanity data
    };

    // For debugging: console.log('Attempting to create pre-order with data:', JSON.stringify(preOrderData, null, 2));
    const createdPreOrder = await writeClient.create(preOrderData);

    if (createdPreOrder) {
      // Email sending temporarily commented out
      // sendPreOrderConfirmationEmail(
      //   user.emailAddresses[0]?.emailAddress, // User's email
      //   user.firstName || user.emailAddresses[0]?.emailAddress.split('@')[0], // User's name
      //   createdPreOrder // The newly created pre-order document
      // ).catch(emailError => {
      //   // Log email sending errors without failing the API response for pre-order creation
      //   console.error("Background user email sending failed:", emailError);
      // });

      // // Admin notification email
      // const adminEmail = process.env.ADMIN_EMAIL_ADDRESS;
      // if (adminEmail) {
      //   sendAdminPreOrderNotificationEmail(
      //     adminEmail,
      //     createdPreOrder,
      //     {
      //       name: user.firstName || user.emailAddresses[0]?.emailAddress.split('@')[0],
      //       email: user.emailAddresses[0]?.emailAddress,
      //       id: user.id // Pass user ID if needed by admin email template
      //     }
      //   ).catch(adminEmailError => {
      //     console.error("Background admin email sending failed:", adminEmailError);
      //   });
      // } else {
      //   console.warn('Admin email address (ADMIN_EMAIL_ADDRESS) not configured. Skipping admin notification.');
      // }
      console.log('Skipped email sending for debugging server-only issue.');
    }

    return res.status(201).json({ message: 'Pre-order created successfully (emails skipped for debug)', preOrder: createdPreOrder });

  } catch (error) {
    // Enhanced logging
    console.error('------------------------------------------------------');
    console.error('Failed to create pre-order. Original error object:', error);
    console.error('------------------------------------------------------');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    if (error.response) { // Sanity client errors often have a 'response' property
      console.error('Sanity error response status:', error.response.statusCode);
      console.error('Sanity error response body:', JSON.stringify(error.response.body, null, 2));
    }
    if (error.details) { // Sanity specific details
        console.error('Sanity error details:', JSON.stringify(error.details, null, 2));
    }
    // Attempt to stringify the full error to catch any other properties
    try {
      console.error('Full error object (stringified with getOwnPropertyNames):', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    } catch (e) {
      console.error('Could not stringify full error object:', e.message);
    }
    console.error('------------------------------------------------------');


    let errorMessage = 'Failed to create pre-order in database.';
    let errorDetails = error.message; // Default to general error message
    let statusCode = 500;

    // Check for Sanity client specific 'isBoom' property for Boom errors (older Sanity client versions)
    if (error.isBoom && error.output && error.output.payload) {
      console.warn('Handling error as a Boom error (older Sanity client style).');
      errorMessage = error.output.payload.message || 'Error interacting with database (Boom).';
      errorDetails = error.output.payload.error || error.output.payload.message || errorDetails;
      statusCode = error.output.payload.statusCode || statusCode;
    }
    // Check for errors with a 'response' property, common with @sanity/client v3+
    else if (error.response && error.response.body && error.response.body.error) {
      console.warn('Handling error based on error.response.body.error.');
      const sanityError = error.response.body.error;
      errorMessage = sanityError.description || sanityError.message || 'Error processing request with database.';
      errorDetails = sanityError; // Send the whole Sanity error object as details
      statusCode = error.response.statusCode || statusCode;
    } else if (error.response && typeof error.response.body === 'string') {
      // Sometimes the body might be a string (e.g. HTML error page from a proxy, or plain text error)
      console.warn('Handling error based on error.response where body is a string.');
      errorMessage = 'Error from database provider.'; // Generic message
      errorDetails = error.response.body; // The string response
      statusCode = error.response.statusCode || statusCode;
    }
    // Add more specific checks if needed, based on observed error structures

    return res.status(statusCode).json({ error: errorMessage, details: errorDetails });
  }
}
