// __tests__/sanity/preOrderSchema.test.js
import preOrderSchema from '../../koko/schemaTypes/preOrder'; // Adjust path

describe('Pre-Order Sanity Schema', () => {
  it('should have the correct name and title', () => {
    expect(preOrderSchema.name).toBe('preOrder');
    expect(preOrderSchema.title).toBe('Pre-Order');
    expect(preOrderSchema.type).toBe('document');
  });

  it('should have all required fields', () => {
    const fieldNames = preOrderSchema.fields.map(f => f.name);
    expect(fieldNames).toContain('userId');
    expect(fieldNames).toContain('userName');
    expect(fieldNames).toContain('cartItems');
    expect(fieldNames).toContain('totalPrice');
    expect(fieldNames).toContain('status');
    expect(fieldNames).toContain('createdAt');
  });

  it('should define cartItems as an array of objects with specific fields', () => {
    const cartItemsField = preOrderSchema.fields.find(f => f.name === 'cartItems');
    expect(cartItemsField.type).toBe('array');
    expect(cartItemsField.of[0].type).toBe('object');
    const cartItemFields = cartItemsField.of[0].fields.map(f => f.name);
    expect(cartItemFields).toContain('productId');
    expect(cartItemFields).toContain('name');
    expect(cartItemFields).toContain('price');
    expect(cartItemFields).toContain('quantity');
  });

  it('should have status with predefined options and initial value', () => {
    const statusField = preOrderSchema.fields.find(f => f.name === 'status');
    expect(statusField.type).toBe('string');
    expect(statusField.options.list).toEqual([
      {title: 'Pending', value: 'pending'},
      {title: 'Processing', value: 'processing'},
      {title: 'Fulfilled', value: 'fulfilled'},
      {title: 'Cancelled', value: 'cancelled'},
    ]);
    expect(statusField.initialValue).toBe('pending');
  });
});
