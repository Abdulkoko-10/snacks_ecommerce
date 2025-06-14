import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BsBagCheckFill } from "react-icons/bs";

import { useStateContext } from "../context/StateContext";
// import { runRealistic } from "../lib/utills"; // Static import removed

const Success = () => {
  const { setCartItems, setTotalPrice, setTotalQuantities } = useStateContext();

  useEffect(() => {
    localStorage.clear();
    setCartItems([]);
    setTotalPrice(0);
    setTotalQuantities(0);

    const fireConfetti = async () => {
      try {
        const utilsModule = await import("../lib/utills");
        utilsModule.runRealistic();
      } catch (error) {
        console.error("Failed to load confetti utility:", error);
        // Optionally, provide fallback or user feedback if confetti is critical
      }
    };

    fireConfetti();
  }, [setCartItems, setTotalPrice, setTotalQuantities]); // Dependencies are stable setters

  return (
    <div className="success-wrapper">
      <div className="success">
        <p className="icon">
          <BsBagCheckFill />
        </p>
        <h1>Thank you for your order!</h1>
        <p className="email-msg">Check your email inbox for the receipt.</p>
        <p className="description">
          If you have any questions, please email us
          <a className="email" href="mailto:koko@snacks.com">
            koko@snacks.com
          </a>
        </p>
        <Link href="/">
          <button type="button" width="300px" className="btn">
            Continue Shopping
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Success;
