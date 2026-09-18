const { Resend } = require('resend');

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * Send OTP verification email using Resend
 * @param {Object} params
 * @param {string} params.email - Recipient email address
 * @param {string} params.otp - 6-digit verification code
 */
const sendOtpEmail = async ({ email, otp }) => {
  console.log('\n======================================================');
  console.log(`🔑 [VORTEX OTP VERIFICATION]`);
  console.log(`Recipient: ${email}`);
  console.log(`One-Time Password (OTP): >>> ${otp} <<<`);
  console.log(`Valid for: 10 minutes`);
  console.log('======================================================\n');

  if (resend) {
    try {
      const fromEmail = process.env.RESEND_FROM || process.env.RESEND_FROM_EMAIL || 'Vortex <onboarding@resend.dev>';
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: `${otp} is your Vortex Verification Code`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; color: #0f172a; padding: 36px 32px; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="font-size: 26px; font-weight: 900; letter-spacing: -0.5px; color: #ea580c;">VORTEX</span>
              <span style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; margin-top: 4px;">Elite Freelance Marketplace</span>
            </div>
            
            <p style="font-size: 15px; font-weight: 600; color: #1e293b; margin-bottom: 8px;">Verify Your Email Address</p>
            <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin-bottom: 28px;">Welcome to Vortex. Use the 6-digit verification code below to verify your email and activate your account.</p>
            
            <div style="background: #fff7ed; border: 1.5px dashed #f97316; border-radius: 14px; padding: 22px; text-align: center; margin-bottom: 28px;">
              <span style="font-size: 34px; font-weight: 900; letter-spacing: 10px; color: #ea580c; font-family: monospace;">${otp}</span>
            </div>
            
            <p style="color: #94a3b8; font-size: 12px; margin: 0; text-align: center;">This code expires in 10 minutes. If you did not request this verification, you can safely ignore this email.</p>
          </div>
        `,
      });

      if (error) {
        console.warn(`[Resend] Delivery returned an error: ${error.message || JSON.stringify(error)}. Logged code to console.`);
        return { success: false, error };
      }

      console.log(`[Resend] Verification email dispatched to ${email}. ID: ${data?.id}`);
      return { success: true, id: data?.id };
    } catch (err) {
      console.warn(`[Resend] Exception while dispatching email: ${err.message}. Logged code to console.`);
      return { success: false, error: err.message };
    }
  } else {
    console.log(`[Resend] No RESEND_API_KEY configured in .env. OTP logged to console above for testing.`);
    return { success: true, simulated: true };
  }
};

module.exports = {
  sendOtpEmail,
};
  