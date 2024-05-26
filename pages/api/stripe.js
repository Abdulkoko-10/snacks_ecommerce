import Stripe from "stripe";

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === "POST") {
    // console.log("Received cartItems:", req.body.cartItems);

    try {
      const params = {
        submit_type: "pay",
        mode: "payment",
        payment_method_types: ["card"],
        billing_address_collection: "auto",
        shipping_options: [{ shipping_rate: "shr_1PIH5XKoaeHWMJtofagidZNz" }],
        // This line creates an array of line items from the request body
        line_items: req.body.map((item) => {
          // Get the image URL from the item
          const img = item.image[0].asset._ref;
          // Create a new image URL by replacing the "image-" prefix with the CDN URL and .webp suffix
          const newImage = img
            .replace(
              "image-",
              "https://cdn.sanity.io/images/ise1lfsl/production/"
            )
            .replace("-webp", ".webp");

          // Return an object containing the price data, adjustable quantity, and quantity of the item
          return {
            price_data: {
              // Set the currency to US dollars
              currency: "usd",
              // Set the product data for the item, including its name and images
              product_data: {
                name: item.name,
                images: [newImage],
              },
              // Set the unit amount of the item, based on its price and the 100 minimum bid
              unit_amount: item.price * 100,
            },
            // Enable the adjustable quantity and set the minimum quantity to 1
            adjustable_quantity: {
              enabled: true,
              minimum: 1,
            },
            // Set the quantity of the item
            quantity: item.quantity,
          };
        }),
        // Set the success URL to the original URL, with a success parameter
        success_url: `${req.headers.origin}/success`,
        // Set the cancel URL to the original URL, with a canceled parameter
        cancel_url: `${req.headers.origin}/canceled`,
      };

      // Create Checkout Sessions from body params.
      const session = await stripe.checkout.sessions.create(params);

      res.status(200).json(session);
    } catch (err) {
      console.error("Error creating Stripe Checkout Session:", err);
      res.status(err.statusCode || 500).json(err.message);
    }
  } else {
    // If the request is not allowed, return a 405 status code.
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
