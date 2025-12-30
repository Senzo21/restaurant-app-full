require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());

app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, email } = req.body;

    if (!amount || !email) {
      return res.status(400).json({
        error: 'Amount and email are required'
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Rands → cents
      currency: 'zar',
      receipt_email: email, // ✅ RECEIPT EMAIL
      automatic_payment_methods: {
        enabled: true
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message
    });
  }
});

const PORT = 4242;
app.listen(PORT, () => {
  console.log(`Stripe backend running on http://localhost:${PORT}`);
});
