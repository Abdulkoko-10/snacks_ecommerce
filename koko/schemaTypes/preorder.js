export default {
  name: 'preorder',
  title: 'Pre-order',
  type: 'document',
  fields: [
    {
      name: 'userId',
      title: 'User ID',
      type: 'string',
    },
    {
      name: 'userName', // Added for easier identification in Sanity
      title: 'User Name',
      type: 'string',
    },
    {
      name: 'userEmail',
      title: 'User Email',
      type: 'string',
    },
    {
      name: 'productItems', // Changed to array to support multiple products in one pre-order
      title: 'Product Items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'productId', title: 'Product ID', type: 'string' },
            { name: 'name', title: 'Product Name', type: 'string' },
            { name: 'price', title: 'Price', type: 'number' },
            { name: 'quantity', title: 'Quantity', type: 'number' },
          ],
        },
      ],
    },
    {
      name: 'totalPrice', // Added to store the total price of the pre-order
      title: 'Total Price',
      type: 'number',
    },
    {
      name: 'preorderDate',
      title: 'Pre-order Date',
      type: 'datetime',
    },
    {
      name: 'status', // Added to track pre-order status (e.g., pending, confirmed, fulfilled)
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Confirmed', value: 'confirmed' },
          { title: 'Fulfilled', value: 'fulfilled' },
          { title: 'Cancelled', value: 'cancelled' },
        ],
        layout: 'radio', // Or 'dropdown'
      },
      initialValue: 'pending',
    },
  ],
};
