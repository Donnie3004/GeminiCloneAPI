export default function generateOTP(mobile) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 30 * 1000; 
  return {mobile : mobile, details: {otp : otp, expiresAt : expiresAt}};
}