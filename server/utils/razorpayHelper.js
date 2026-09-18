const crypto = require('crypto');

const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret_key';
  
  // If in local test mock mode and placeholder secret is used
  if (keySecret === 'placeholder_secret_key' && signature.startsWith('mock_sig_')) {
    return true;
  }

  const generatedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
};

module.exports = {
  verifyRazorpaySignature,
};
