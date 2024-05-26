// Import the loadStripe function from the @stripe/stripe-js package
import { loadStripe } from "@stripe/stripe-js";

// Create a variable to store the Promise of loading the stripe library
let stripePromise;

// Create a function to get the stripe library
const getStripe = () => {
  // If the stripePromise hasn't been created yet
  if (!stripePromise) {
    // Load the stripe library using the process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }

  // Return the stripePromise
  return stripePromise;
};

// Export the getStripe function
export default getStripe;
