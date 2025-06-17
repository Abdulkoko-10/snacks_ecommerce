export default {
  name: 'preorder',
  title: 'Pre-order',
  type: 'document',
  fields: [
    {
      name: 'userId',
      title: 'User ID',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'userName',
      title: 'User Name',
      type: 'string',
    },
    {
      name: 'userEmail',
      title: 'User Email',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'productName',
      title: 'Product Name',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'productId',
      title: 'Product ID',
      type: 'string',
    },
    {
      name: 'quantity',
      title: 'Quantity',
      type: 'number',
      validation: Rule => Rule.required().min(1),
    },
    {
      name: 'preorderDate',
      title: 'Pre-order Date',
      type: 'datetime',
      options: {
        dateFormat: 'YYYY-MM-DDTHH:mm:ssZ',
      },
      readOnly: true,
      initialValue: () => new Date().toISOString(),
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Pending', value: 'pending'},
          {title: 'Confirmed', value: 'confirmed'},
          {title: 'Shipped', value: 'shipped'},
          {title: 'Cancelled', value: 'cancelled'},
        ],
      },
      initialValue: 'pending',
      validation: Rule => Rule.required(),
    },
    {
      name: 'shippingAddress',
      title: 'Shipping Address',
      type: 'object',
      fields: [
        {name: 'street', title: 'Street', type: 'string'},
        {name: 'city', title: 'City', type: 'string'},
        {name: 'postalCode', title: 'Postal Code', type: 'string'},
        {name: 'country', title: 'Country', type: 'string'},
      ],
    },
    {
      name: 'notes',
      title: 'Notes',
      type: 'text',
    },
  ],
}
