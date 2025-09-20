// Using CommonJS syntax for compatibility with Node scripts like seed.js
const mockProducts = [
    {
        _id: 'price_1LBCY2A4x4x4x4x4x4x4x4x4',
        name: 'Spicy Samosa',
        slug: { current: 'spicy-samosa' },
        price: 5.99,
        details: 'A delicious, crispy, and spicy samosa filled with potatoes and peas. The perfect snack for any time of day.',
        image: [
            {
                _key: 'image-key-1',
                _type: 'image',
                asset: { _ref: 'image-samosa-asset-ref', _type: 'reference' }
            }
        ],
        reviews: [], // Start with empty reviews
    },
    {
        _id: 'price_1LBCZNA4x4x4x4x4x4x4x4x4',
        name: 'Veggie Spring Rolls',
        slug: { current: 'veggie-spring-rolls' },
        price: 7.49,
        details: 'Crispy spring rolls filled with fresh vegetables. Served with a sweet and sour dipping sauce.',
        image: [
            {
                _key: 'image-key-2',
                _type: 'image',
                asset: { _ref: 'image-spring-roll-asset-ref', _type: 'reference' }
            }
        ],
        reviews: [],
    },
    {
        _id: 'price_1LBCaVA4x4x4x4x4x4x4x4x4',
        name: 'Mango Lassi',
        slug: { current: 'mango-lassi' },
        price: 4.50,
        details: 'A refreshing and creamy yogurt-based drink made with sweet mangoes.',
        image: [
            {
                _key: 'image-key-3',
                _type: 'image',
                asset: { _ref: 'image-lassi-asset-ref', _type: 'reference' }
            }
        ],
        reviews: [],
    }
];

module.exports = {
  mockProducts,
};
