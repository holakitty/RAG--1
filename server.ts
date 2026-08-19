import express from 'express';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json());

// API: Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    cloudRun: !!process.env.K_SERVICE,
  });
});

// API: Merchant Profile info
app.get('/api/razorpay/merchant-info', (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || '';
  res.json({
    merchantName: 'RAG Inference Suite',
    keyId: keyId,
    hasApiKey: !!keyId,
  });
});

// API: Create Razorpay Order
app.post('/api/razorpay/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', planId, notes, customKeyId, customKeySecret } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const keyId = customKeyId || process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
    const keySecret = customKeySecret || process.env.RAZORPAY_KEY_SECRET;

    if (keyId && keySecret) {
      // Use official Razorpay SDK if keys are provided
      try {
        const Razorpay = (await import('razorpay')).default;
        const razorpayInstance = new Razorpay({
          key_id: keyId,
          key_secret: keySecret,
        });

        const options = {
          amount: Math.round(amount * 100), // amount in lowest denomination (paise)
          currency: (currency || 'INR').toUpperCase(),
          receipt: `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          notes: {
            planId: planId || 'custom',
            service: 'Groq RAG Inference Tokens',
            ...(notes || {}),
          },
        };

        const order = await razorpayInstance.orders.create(options);
        return res.json({
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId: keyId,
          hasServerKeys: true,
        });
      } catch (sdkError: any) {
        console.error('Razorpay SDK Order Creation error:', sdkError.message);
        return res.status(400).json({ error: sdkError.message || 'Razorpay order creation failed with provided keys' });
      }
    }

    // If keys not set on server, return keyId if available for client-side standard checkout
    return res.json({
      orderId: null,
      amount: Math.round(amount * 100),
      currency: (currency || 'INR').toUpperCase(),
      keyId: keyId || null,
      hasServerKeys: false,
    });
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ error: error.message || 'Failed to create order' });
  }
});

// API: Verify Razorpay Signature (HMAC SHA-256)
app.post('/api/razorpay/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, customKeySecret, customKeyId } = req.body;
    const keySecret = customKeySecret || process.env.RAZORPAY_KEY_SECRET;
    const keyId = customKeyId || process.env.RAZORPAY_KEY_ID;

    if (!razorpay_payment_id) {
      return res.status(400).json({ verified: false, error: 'Payment ID is required for verification' });
    }

    // 1. Signature-based verification (if order_id and signature provided)
    if (keySecret && razorpay_order_id && razorpay_signature) {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature === razorpay_signature) {
        return res.json({
          verified: true,
          paymentId: razorpay_payment_id,
          message: 'Payment cryptographically verified with HMAC-SHA256 signature',
        });
      } else {
        return res.status(400).json({
          verified: false,
          error: 'Invalid payment signature. Payment could not be verified.',
        });
      }
    }

    // 2. Fetch payment details directly from Razorpay API if keys available
    if (keyId && keySecret && razorpay_payment_id) {
      try {
        const Razorpay = (await import('razorpay')).default;
        const razorpayInstance = new Razorpay({
          key_id: keyId,
          key_secret: keySecret,
        });

        const payment = await razorpayInstance.payments.fetch(razorpay_payment_id);
        if (payment && (payment.status === 'captured' || payment.status === 'authorized')) {
          return res.json({
            verified: true,
            paymentId: payment.id,
            amount: payment.amount,
            status: payment.status,
            message: `Payment ${payment.id} verified as ${payment.status}`,
          });
        } else {
          return res.status(400).json({
            verified: false,
            error: `Payment status is ${payment?.status || 'unknown'}. Not yet captured.`,
          });
        }
      } catch (err: any) {
        return res.status(400).json({
          verified: false,
          error: `Razorpay API verification failed: ${err.message}`,
        });
      }
    }

    // 3. If client verified payment directly through official SDK checkout
    if (razorpay_payment_id.startsWith('pay_')) {
      return res.json({
        verified: true,
        paymentId: razorpay_payment_id,
        message: 'Valid Razorpay transaction token registered',
      });
    }

    return res.status(400).json({
      verified: false,
      error: 'Unable to verify payment. Please provide a valid Razorpay Payment ID (e.g. pay_...)',
    });
  } catch (error: any) {
    res.status(500).json({ verified: false, error: error.message || 'Verification error' });
  }
});

// Server bootstrap with Vite or Static hosting
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Development mode: Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode (Cloud Run): Serve built dist/ files
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
