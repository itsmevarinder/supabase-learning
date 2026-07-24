import { NextResponse } from "next/server";
import Stripe from "stripe";

// Stripe's UPI QR (payment_method_options.upi.flow: "qr") is tied to one
// specific Payment Intent/amount — unlike Razorpay's reusable multi-use QR,
// a fresh Payment Intent (and QR) is created for every donation attempt.
interface UpiDisplayQrCode {
  image_data_url: string;
}

export async function POST(request: Request) {
  const { amount } = await request.json();

  if (typeof amount !== "number" || !Number.isFinite(amount) || amount < 1) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "Donations aren't set up yet" }, { status: 503 });
  }

  try {
    const stripe = new Stripe(secretKey);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // rupees -> paise
      currency: "inr",
      payment_method_types: ["upi"],
      payment_method_data: { type: "upi", billing_details: { name: "Donor" } },
      payment_method_options: { upi: { flow: "qr" } },
      confirm: true,
    } as Stripe.PaymentIntentCreateParams);

    const nextAction = paymentIntent.next_action as unknown as
      | { upi_display_qr_code?: UpiDisplayQrCode }
      | undefined;
    const qrCode = nextAction?.upi_display_qr_code;

    if (!qrCode?.image_data_url) {
      return NextResponse.json({ error: "Couldn't create the QR code" }, { status: 500 });
    }

    return NextResponse.json({ imageUrl: qrCode.image_data_url, paymentIntentId: paymentIntent.id });
  } catch (error) {
    console.error("Failed to create Stripe UPI payment intent:", error);
    return NextResponse.json({ error: "Couldn't create the QR code" }, { status: 500 });
  }
}
