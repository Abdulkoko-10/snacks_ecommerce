// pages/pre-order.js
import React from 'react';
import PreOrderCheckout from '../components/PreOrderCheckout';
import Layout from '../components/Layout'; // Assuming a global Layout component

const PreOrderPage = () => {
  return (
    <Layout> {/* Ensure Layout handles global styling, header, footer etc. */}
      <PreOrderCheckout />
    </Layout>
  );
};

export default PreOrderPage;
