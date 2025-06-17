import { client } from '../../../lib/client'; // Adjust path as necessary

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userId, userName, userEmail, productItems, totalPrice, preorderDate, status } = req.body;

    // Basic validation (can be expanded)
    if (!userId || !userEmail || !productItems || productItems.length === 0 || !totalPrice || !preorderDate) {
      return res.status(400).json({ message: 'Missing required pre-order data.' });
    }

    try {
      const preorderDoc = {
        _type: 'preorder', // Corresponds to the Sanity schema name
        userId,
        userName,
        userEmail,
        productItems: productItems.map(item => ({
          _type: 'object', // Sanity schema expects objects in array here
          _key: Math.random().toString(36).substr(2, 9), // Simple unique key for array items
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        totalPrice,
        preorderDate: new Date(preorderDate).toISOString(), // Ensure it's in ISO format
        status: status || 'pending', // Default to 'pending' if not provided
      };

      // console.log('Attempting to create pre-order document:', preorderDoc);

      const result = await client.create(preorderDoc);
      // console.log('Sanity create result:', result);

      res.status(201).json({ message: 'Pre-order created successfully', preorderId: result._id });
    } catch (error) {
      console.error('Error creating pre-order in Sanity:', error);
      // Check for specific Sanity client errors if possible
      let errorMessage = 'Failed to create pre-order.';
      if (error.response && error.response.body && error.response.body.error && error.response.body.error.description) {
         errorMessage = error.response.body.error.description;
      } else if (error.message) {
         errorMessage = error.message;
      }
      res.status(500).json({ message: errorMessage, details: error.toString() });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end('Method Not Allowed');
  }
}
