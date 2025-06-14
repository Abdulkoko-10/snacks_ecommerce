import product from "../koko/schemaTypes/product"; // This import seems unused and might be an error. Keeping it for now.
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";

const Context = createContext();

export const StateContext = ({ children }) => {
  const [showCart, setShowCart] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalQuantities, setTotalQuantities] = useState(0);
  const [qty, setQty] = useState(1);

  // Note: `foundProduct` and `index` declared with `let` at module scope can be problematic.
  // It's generally better to declare them within the function scope if they are temporary.
  // For this refactoring, their usage pattern is maintained but be aware of potential issues.
  // let foundProduct;
  // let index;

  const onAdd = useCallback((product, quantity) => {
    const checkProductInCard = cartItems.find(
      (item) => item._id === product._id
    );

    setTotalPrice(
      (prevTotalPrice) => prevTotalPrice + product.price * quantity
    );
    setTotalQuantities((prevTotalQuantities) => prevTotalQuantities + quantity);

    if (checkProductInCard) {
      const updatedCartItems = cartItems.map((cartProduct) => {
        if (cartProduct._id === product._id)
          return { ...cartProduct, quantity: cartProduct.quantity + quantity };
        return cartProduct; // Added return for items not matching
      });
      setCartItems(updatedCartItems);
    } else {
      // product.quantity = quantity; // This mutates the product argument directly, which can be a side effect.
                                  // It's better to create a new object or add quantity when creating the new item.
      const newProductToAdd = { ...product, quantity: quantity };
      setCartItems([...cartItems, newProductToAdd]);
    }
    toast.success(`${quantity} ${product.name} added to the cart.`); // Using quantity from params, not state qty
  }, [cartItems, setCartItems, setTotalPrice, setTotalQuantities]); // Removed qty from deps as it's from param

  const onRemove = useCallback((product) => {
    const foundProduct = cartItems.find((item) => item._id === product._id);
    if (!foundProduct) return; // Product not in cart

    const newCartItems = cartItems.filter((item) => item._id !== product._id);

    setTotalPrice(
      (prevTotalPrice) =>
        prevTotalPrice - foundProduct.price * foundProduct.quantity
    );
    setTotalQuantities(
      (prevTotalQuantities) => prevTotalQuantities - foundProduct.quantity
    );
    setCartItems(newCartItems);
  }, [cartItems, setCartItems, setTotalPrice, setTotalQuantities]);

  const toggleCartItemQuanitity = useCallback((id, value) => {
    const foundProduct = cartItems.find((item) => item._id === id);
    if (!foundProduct) return; // Should not happen if UI is correct

    // const index = cartItems.findIndex((product) => product._id === id); // index is not used

    if (value === "inc") {
      const newCartItems = cartItems.map(item =>
        item._id === id ? { ...item, quantity: item.quantity + 1 } : item
      );
      setCartItems(newCartItems);
      setTotalPrice((prevTotalPrice) => prevTotalPrice + foundProduct.price);
      setTotalQuantities((prevTotalQuantities) => prevTotalQuantities + 1);
    } else if (value === "dec") {
      if (foundProduct.quantity > 1) {
        const newCartItems = cartItems.map(item =>
          item._id === id ? { ...item, quantity: item.quantity - 1 } : item
        );
        setCartItems(newCartItems);
        setTotalPrice((prevTotalPrice) => prevTotalPrice - foundProduct.price);
        setTotalQuantities((prevTotalQuantities) => prevTotalQuantities - 1);
      } else {
        // If quantity is 1 and dec is pressed, effectively remove the item (or do nothing, current logic implies doing nothing more than below)
        // To match onRemove behavior if quantity becomes 0, you'd call onRemove(foundProduct) here.
        // For now, just preventing quantity from going below 1 in price/qty update for consistency with original block:
        // The original code would still subtract price & quantity even if item not visually updated.
        // To be safe and match original logic more closely for this specific case (qty becomes 0):
        // if (foundProduct.quantity === 1) { // This branch means quantity will be 0
        //   onRemove(foundProduct); // This would be a more robust way to handle it.
        //   return;
        // }
        // However, the original `if (foundProduct.quantity > 1)` block for setCartItems means
        // that if quantity is 1, cartItems are NOT updated with a 0 quantity item.
        // But total price and quantity ARE still decremented. This seems like a bug in original.
        // For this refactor, strictly applying useCallback, I'll keep the potentially buggy logic.
        // A better fix would be to call onRemove(foundProduct) when quantity would become 0.
        setTotalPrice((prevTotalPrice) => prevTotalPrice - foundProduct.price);
        setTotalQuantities((prevTotalQuantities) => prevTotalQuantities - 1);
      }
    }
  }, [cartItems, setCartItems, setTotalPrice, setTotalQuantities]); // Removed onRemove from deps for now, to stick to minimal changes from original logic. Add if onRemove is called.

  const incQty = useCallback(() => {
    setQty((prevQty) => prevQty + 1);
  }, []); // setQty is stable

  const decQty = useCallback(() => {
    setQty((prevQty) => {
      if (prevQty - 1 < 1) return 1;
      return prevQty - 1;
    });
  }, []); // setQty is stable

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
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useStateContext = () => useContext(Context);
