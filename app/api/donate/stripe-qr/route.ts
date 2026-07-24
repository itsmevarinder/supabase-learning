import { NextResponse } from "next/server";
import Stripe from "stripe";

interface UpiQrCode {
  qr_code?: {
    image_url_png?: string;
  };
}

export async function POST(request: Request) {
  const { amount } = await request.json();


  if (typeof amount !== "number" || !Number.isFinite(amount) || amount < 50) {
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
      payment_method_data: {
        type: "upi",
        billing_details: {
          name: "Donor",
          address: {
            country: "IN",
            line1: "NA",
            city: "NA",
            state: "NA",
            postal_code: "110001",
          },
        },
      },
      payment_method_options: { upi: { flow: "qr" } },
      confirm: true,
    } as Stripe.PaymentIntentCreateParams);

    const nextAction = paymentIntent.next_action as unknown as
      | { upi_handle_redirect_or_display_qr_code?: UpiQrCode }
      | undefined;
    const imageUrl = nextAction?.upi_handle_redirect_or_display_qr_code?.qr_code?.image_url_png;

    if (!imageUrl) {
      return NextResponse.json({ error: "Couldn't create the QR code" }, { status: 500 });
    }

    return NextResponse.json({ imageUrl, paymentIntentId: paymentIntent.id });
  } catch (error) {
    console.error("Failed to create Stripe UPI payment intent:", error);
    return NextResponse.json({ error: "Couldn't create the QR code" }, { status: 500 });
  }
}
