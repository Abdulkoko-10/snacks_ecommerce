// koko/schemaTypes/preOrder.js
export default {
  name: 'preOrder',
  title: 'Pre-Order',
  type: 'document',
  fields: [
    {
      name: 'userId',
      title: 'User ID',
      type: 'string',
      description: 'Clerk User ID of the customer who placed the pre-order.',
      readOnly: true,
    },
    {
      name: 'userName', // Added for easier identification in Sanity
      title: 'User Name/Email', // Or just email, depending on what's available from Clerk
      type: 'string',
      description: 'Name or email of the customer.',
      readOnly: true,
    },
    {
      name: 'cartItems',
      title: 'Cart Items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'productId', title: 'Product ID', type: 'string', readOnly: true},
            {name: 'name', title: 'Product Name', type: 'string', readOnly: true},
            {name: 'price', title: 'Price', type: 'number', readOnly: true},
            {name: 'quantity', title: 'Quantity', type: 'number', readOnly: true},
            {
              name: 'image',
              title: 'Image',
              type: 'image', // Assuming you might want to store the main image
              options: {hotspot: true},
              readOnly: true,
            },
          ],
        },
      ],
      description: 'Items included in the pre-order.',
      readOnly: true,
    },
    {
      name: 'totalPrice',
      title: 'Total Price',
      type: 'number',
      description: 'Total price of the pre-order.',
      readOnly: true,
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Pending', value: 'pending'},
          {title: 'Processing', value: 'processing'},
          {title: 'Fulfilled', value: 'fulfilled'},
          {title: 'Cancelled', value: 'cancelled'},
        ],
        layout: 'radio', // or 'dropdown'
      },
      initialValue: 'pending',
      description: 'Status of the pre-order.',
    },
    {
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      options: {
        dateFormat: 'YYYY-MM-DDTHH:mm:ssZ',
      },
      readOnly: true,
    },
    // Add any other fields relevant to your pre-order details, e.g., shipping address if not handled elsewhere
  ],
  preview: {
    select: {
      title: 'userName',
      subtitle: 'createdAt',
      status: 'status',
      totalPrice: 'totalPrice'
    },
    prepare(selection) {
      const {title, subtitle, status, totalPrice} = selection
      return {
        title: title || 'No user name',
        subtitle: `Status: ${status || 'pending'} - ${new Date(subtitle).toLocaleDateString()} - $${totalPrice || 0}`
      }
    }
  }
};
