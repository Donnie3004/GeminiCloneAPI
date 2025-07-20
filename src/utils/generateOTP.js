export default function generateOTP(mobile) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Math.random()-->[0-9);

  const date = new Date(Date.now() + 30 * 1000); // 30 seconds from now

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); 
  const day = String(date.getDate()).padStart(2, '0');

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');  

  const expiresAt = `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
  return {mobile : mobile, details: {otp : otp, expiresAt : expiresAt}};
}