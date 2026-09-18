const Razorpay = require('razorpay');

let razorpayInstance = null;

try {
  const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key_id';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret_key';

  razorpayInstance = new Razorpay({
    key_id,
    key_secret,
  });
  console.log('[Razorpay] Initialized in Test Mode');
} catch (error) {
  console.warn('[Razorpay] Initialization warning:', error.message);
}

module.exports = razorpayInstance;
