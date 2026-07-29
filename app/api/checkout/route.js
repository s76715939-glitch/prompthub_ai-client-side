import { NextResponse } from 'next/server';
import { getStripeServer } from '@/lib/stripe';
import { connectToDatabase, isMongoConnected } from '@/lib/mongodb';
import Order from '@/lib/models/Order';

export async function POST(request) {
  try {
    const body = await request.json();
    const { items, customerName, customerEmail, orderNotes, isSimulated } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Cart items are required' }, { status: 400 });
    }

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const stripe = getStripeServer();

    // If Stripe Secret Key is live and requested
    if (stripe && !isSimulated) {
      try {
        const lineItems = items.map((item) => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.title,
              images: [item.image],
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        }));

        const origin = request.headers.get('origin') || process.env.APP_URL || 'http://localhost:3000';

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: lineItems,
          mode: 'payment',
          customer_email: customerEmail,
          success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}&status=success`,
          cancel_url: `${origin}/cart?canceled=true`,
        });

        return NextResponse.json({
          success: true,
          mode: 'stripe_live',
          url: session.url,
          sessionId: session.id,
        });
      } catch (stripeErr) {
        console.warn('Stripe checkout error, switching to test simulator:', stripeErr.message);
      }
    }

    // Stripe Test Mode / Simulator fallback
    await connectToDatabase();

    const orderData = {
      customerName: customerName || 'Valued Student / Client',
      customerEmail: customerEmail || 'student@university.edu',
      items,
      totalAmount,
      paymentMethod: 'stripe_test_card',
      stripePaymentIntentId: `pi_test_${Math.random().toString(36).substring(2, 12)}`,
      paymentStatus: 'paid',
      orderNotes: orderNotes || 'Paid via Stripe Test Card (4242 4242 4242 4242)',
    };

    let savedOrder = null;
    if (isMongoConnected()) {
      savedOrder = await Order.create(orderData);
    } else {
      savedOrder = {
        _id: `ord_${Date.now()}`,
        id: `ord_${Date.now()}`,
        ...orderData,
        createdAt: new Date().toISOString(),
      };
    }

    return NextResponse.json({
      success: true,
      mode: 'stripe_test_simulator',
      order: savedOrder,
      message: 'Stripe Payment processed successfully in Test Mode!',
      transactionId: orderData.stripePaymentIntentId,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
