// Builds a standard UPI deep-link payment string from a phone number, in the
// `<phone>@upi` payee-address form most UPI apps (GPay, PhonePe, Paytm…)
// recognize when scanned as a QR code.
export function buildUpiPaymentString(phoneNumber: string, payeeName = "Donation") {
  const digits = phoneNumber.replace(/\D/g, "");
  const params = new URLSearchParams({
    pa: `${digits}@upi`,
    pn: payeeName,
    cu: "INR",
  });
  return `upi://pay?${params.toString()}`;
}
