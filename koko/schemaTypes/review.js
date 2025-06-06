export default {
  name: 'review',
  title: 'Review',
  type: 'document',
  fields: [
    {
      name: 'user',
      title: 'User',
      type: 'string',
      validation: Rule => Rule.required().error('User name is required.'),
    },
    {
      name: 'rating',
      title: 'Rating',
      type: 'number',
      validation: Rule => Rule.required().min(1).max(5).precision(1).error('Rating must be between 1 and 5.'),
    },
    {
      name: 'reviewTitle', // Changed name to avoid conflict with document title
      title: 'Review Title',
      type: 'string',
    },
    {
      name: 'comment',
      title: 'Comment',
      type: 'text',
      validation: Rule => Rule.required().error('Comment text is required.'),
    },
    {
      name: 'product',
      title: 'Product',
      type: 'reference',
      to: [{type: 'product'}],
      validation: Rule => Rule.required().error('Product reference is required.'),
    },
    {
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      options: {
        readOnly: true,
      },
      initialValue: () => new Date().toISOString(), // Set initial value to current datetime
      validation: Rule => Rule.required(),
    },
    {
      name: 'approved',
      title: 'Approved',
      type: 'boolean',
      initialValue: false,
    },
  ],
  preview: {
    select: {
      title: 'reviewTitle',
      user: 'user',
      product: 'product.name', // Assuming product schema has a 'name' field
      rating: 'rating',
      approved: 'approved',
    },
    prepare(selection) {
      const {title, user, product, rating, approved} = selection;
      return {
        title: title || 'No Title',
        subtitle: `${user} - ${product ? `Product: ${product}` : 'No product ref.'} (${rating}★) ${approved ? '👍 Approved' : '👎 Pending'}`,
      };
    },
  },
};
