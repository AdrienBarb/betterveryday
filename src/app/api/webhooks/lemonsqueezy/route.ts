import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const LEMON_SQUEEZY_WEBHOOK_SECRET = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-signature");

    if (!LEMON_SQUEEZY_WEBHOOK_SECRET) {
      console.error("LEMON_SQUEEZY_WEBHOOK_SECRET is not set");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 401 }
      );
    }

    const hmac = crypto.createHmac("sha256", LEMON_SQUEEZY_WEBHOOK_SECRET);
    const digest = hmac.update(body).digest("hex");

    if (signature !== digest) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const data = JSON.parse(body);

    console.log("Lemon Squeezy webhook received:", data.meta.event_name);

    switch (data.meta.event_name) {
      case "order_created":
        await handleOrderCreated(data);
        break;
      case "subscription_created":
        await handleSubscriptionCreated(data);
        break;
      case "subscription_updated":
        await handleSubscriptionUpdated(data);
        break;
      case "subscription_cancelled":
        await handleSubscriptionCancelled(data);
        break;
      case "subscription_payment_success":
        await handleSubscriptionPaymentSuccess(data);
        break;
      case "subscription_payment_failed":
        await handleSubscriptionPaymentFailed(data);
        break;
      default:
        console.log("Unhandled webhook event:", data.meta.event_name);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleOrderCreated(data: any) {
  console.log("Order created:", data.data.id);
}

async function handleSubscriptionCreated(data: any) {
  console.log("Subscription created:", data.data.id);
}

async function handleSubscriptionUpdated(data: any) {
  console.log("Subscription updated:", data.data.id);
}

async function handleSubscriptionCancelled(data: any) {
  console.log("Subscription cancelled:", data.data.id);
}

async function handleSubscriptionPaymentSuccess(data: any) {
  console.log("Subscription payment success:", data.data.id);
}

async function handleSubscriptionPaymentFailed(data: any) {
  console.log("Subscription payment failed:", data.data.id);
}

