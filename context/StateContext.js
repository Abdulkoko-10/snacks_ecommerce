import product from "../koko/schemaTypes/product";
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const Context = createContext();

// Helper function to calculate contrast color
const calculateContrastColor = (hexColor) => {
  if (!hexColor) return "#FFFFFF"; // Default to white if no color
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
};

// Helper function to darken a color
const darkenColor = (hexColor, percent) => {
  if (!hexColor) return "#000000"; // Default to black if no color
  let r = parseInt(hexColor.slice(1, 3), 16);
  let g = parseInt(hexColor.slice(3, 5), 16);
  let b = parseInt(hexColor.slice(5, 7), 16);

  r = Math.floor(r * (1 - percent / 100));
  g = Math.floor(g * (1 - percent / 100));
  b = Math.floor(b * (1 - percent / 100));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
};

export const StateContext = ({ children }) => {
  const [showCart, setShowCart] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalQuantities, setTotalQuantities] = useState(0);
  const [qty, setQty] = useState(1);

  // Theme state variables
  const [themeMode, setThemeMode] = useState("light"); // 'light', 'dark', 'rgb'
  const [rgbColor, setRgbColor] = useState("#324d67"); // Default RGB color
  const [mainContrastColor, setMainContrastColor] = useState(calculateContrastColor(rgbColor));

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

  // Theme management functions
  const applyRgbThemeLogic = (currentColor) => {
    const contrast = calculateContrastColor(currentColor);
    setMainContrastColor(contrast);

    // Return CSS variables for Clerk's appearance prop
    return {
      colorPrimary: currentColor,
      colorText: contrast,
      colorBackground: darkenColor(currentColor, 10), // Example: Slightly darker background
      colorInputBackground: darkenColor(currentColor, 5),
      colorInputText: contrast,
      // Add other variables as needed for Clerk components
    };
  };

  const setAndStoreTheme = (newThemeMode, newRgbColor = rgbColor) => {
    localStorage.setItem("themeMode", newThemeMode);
    setThemeMode(newThemeMode);

    document.documentElement.classList.remove("dark-mode", "rgb-mode");

    if (newThemeMode === "dark") {
      document.documentElement.classList.add("dark-mode");
    } else if (newThemeMode === "rgb") {
      document.documentElement.classList.add("rgb-mode");
      setRgbColor(newRgbColor);
      localStorage.setItem("rgbColor", newRgbColor);
      applyRgbThemeLogic(newRgbColor); // Update contrast color and get CSS vars (though not directly applied here)
    }
  };

  // Initialize theme on load
  useEffect(() => {
    const storedThemeMode = localStorage.getItem("themeMode");
    const storedRgbColor = localStorage.getItem("rgbColor");

    if (storedThemeMode) {
      setAndStoreTheme(storedThemeMode, storedRgbColor || rgbColor);
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setAndStoreTheme("dark");
    } else {
      setAndStoreTheme("light");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount


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
        // Theme context values
        themeMode,
        rgbColor,
        mainContrastColor,
        setAndStoreTheme,
        applyRgbThemeLogic,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useStateContext = () => useContext(Context);
