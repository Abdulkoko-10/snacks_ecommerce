import product from "../koko/schemaTypes/product";
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const Context = createContext();

export const StateContext = ({ children }) => {
  const [showCart, setShowCart] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalQuantities, setTotalQuantities] = useState(0);
  const [qty, setQty] = useState(1);
  const [theme, setTheme] = useState('light'); // Default theme

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (prefersDark) {
      setTheme('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  let foundProduct;
  let index;

  const onAdd = (product, quantity) => {
    // This function checks if a product is in the cart
    // It takes a product as an argument
    const checkProductInCard = cartItems.find(
      (item) => item._id === product._id
    );

    // Update the total price
    setTotalPrice(
      (prevTotalPrice) => prevTotalPrice + product.price * quantity
    );
    // Update the total quantities
    setTotalQuantities((prevTotalQuantities) => prevTotalQuantities + quantity);

    // Check if the product is already in the card
    if (checkProductInCard) {
      // Update the cart items
      const updatedCartItems = cartItems.map((cartProduct) => {
        // If the product is already in the card, update the quantity
        if (cartProduct._id === product._id)
          return { ...cartProduct, quantity: cartProduct.quantity + quantity };
      });

      setCartItems(updatedCartItems);
    } else {
      // If the product is not in the cart, add it with the given quantity
      product.quantity = quantity;

      // Add the product to the cart items array
      setCartItems([...cartItems, { ...product }]);
    }

    // Displays a success message when a product is added to the cart
    toast.success(`${qty} ${product.name} added to the cart.`);
  };

  // This function removes a product from the cart
  const onRemove = (product) => {
    // Find the product in the cart
    foundProduct = cartItems.find((item) => item._id === product._id);
    // Create a new list of products in the cart without the removed product
    const newCartItems = cartItems.filter((item) => item._id !== product._id);

    // Update the total price of the cart by subtracting the price of the removed product times its quantity
    setTotalPrice(
      (prevTotalPrice) =>
        prevTotalPrice - foundProduct.price * foundProduct.quantity
    );
    // Update the total quantity of the cart by subtracting the quantity of the removed product
    setTotalQuantities(
      (prevTotalQuantities) => prevTotalQuantities - foundProduct.quantity
    );
    // Update the cart items list with the new list
    setCartItems(newCartItems);
  };

  // This function will toggle the quantity of a cart item
  const toggleCartItemQuanitity = (id, value) => {
    // Find the product in the cartItems array
    foundProduct = cartItems.find((item) => item._id === id);
    // Get the index of the product in the cartItems array
    index = cartItems.findIndex((product) => product._id === id);
    // Filter out the item with the given id from the cart items array
    const newCartItems = cartItems.filter((item) => item._id !== id);

    // If the value is "inc", update the cart items and the total price and quantity
    if (value === "inc") {
      setCartItems([
        ...newCartItems,
        { ...foundProduct, quantity: foundProduct.quantity + 1 },
      ]);
      setTotalPrice((prevTotalPrice) => prevTotalPrice + foundProduct.price);
      setTotalQuantities((prevTotalQuantities) => prevTotalQuantities + 1);
    } else if (value === "dec") {
      // If the quantity is greater than 1, update the cart items
      if (foundProduct.quantity > 1)
        setCartItems([
          ...newCartItems,
          { ...foundProduct, quantity: foundProduct.quantity - 1 },
        ]);
      // Update the total price and quantity
      setTotalPrice((prevTotalPrice) => prevTotalPrice - foundProduct.price);
      setTotalQuantities((prevTotalQuantities) => prevTotalQuantities - 1);
    }
  };

  // Increments the quantity by 1
  const incQty = () => {
    setQty((prevQty) => prevQty + 1);
  };

  // Decrements the quantity by 1, but prevents the quantity from going below 1
  const decQty = () => {
    setQty((prevQty) => {
      if (prevQty - 1 < 1) return 1;
      return prevQty - 1;
    });
  };

  return (
    <Context.Provider
      value={{
        showCart,
        setShowCart,
        cartItems,
        setCartItems,
        totalPrice,
        setTotalPrice,
        totalQuantities,
        setTotalQuantities,
        qty,
        setQty,
        incQty,
        decQty,
        onAdd,
        toggleCartItemQuanitity,
        onRemove,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useStateContext = () => useContext(Context);
