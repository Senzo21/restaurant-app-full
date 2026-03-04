import cors from 'cors';
import dotenv from 'dotenv';
import express, { type Request, type Response } from 'express';
import Stripe from 'stripe';

dotenv.config();

const app = express();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('Missing STRIPE_SECRET_KEY in environment variables.');
}

const stripe = new Stripe(stripeSecretKey);

app.use(cors());
app.use(express.json());

type CreatePaymentIntentBody = {
  amount?: number;
  email?: string;
};

app.post('/create-payment-intent', async (req: Request<unknown, unknown, CreatePaymentIntentBody>, res: Response) => {
  try {
    const { amount, email } = req.body;

    if (!amount || !email) {
      return res.status(400).json({
        error: 'Amount and email are required',
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'zar',
      receipt_email: email,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error';
    return res.status(500).json({ error: message });
  }
});

const port = Number(process.env.PORT ?? 4242);
app.listen(port, () => {
  console.log(`Stripe backend running on http://localhost:${port}`);
});
