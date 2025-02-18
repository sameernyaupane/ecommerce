import { json, type LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { OrderModel } from "@/models/OrderModel";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useShoppingState } from "@/hooks/use-shopping-state";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { useParams, useNavigate } from "@remix-run/react";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const orderId = parseInt(params.orderId!);
  
  if (isNaN(orderId)) {
    throw new Response("Invalid order ID", { status: 400 });
  }

  try {
    const order = await OrderModel.getById(orderId);
    
    if (!order) {
      throw new Response("Order not found", { status: 404 });
    }

    return json({ 
      order,
      message: new URL(request.url).searchParams.get('message'),
      ENV: {
				PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
			},
    });
  } catch (error) {
    return redirect('/checkout');
  }
}

export default function OrderConfirmationPage() {
  const { order, message, ENV } = useLoaderData<typeof loader>();
  const shoppingState = useShoppingState();
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  useEffect(() => {    
    if (!isInitialLoad) {
      console.log('Checking order and message');
      if (!order) {
        console.log('No order found, redirecting to checkout');
        navigate('/checkout');
        return;
      }

      if (message === 'reset-cart') {
        console.log('Resetting cart');
        shoppingState.reset();
      }
    } else {
      console.log('Initial load, skipping checks');
    }
    
    setIsInitialLoad(false);
  }, [order, message]);

  if (!order) {
    console.log('No order in render, returning null');
    return null;
  }

  console.log('Rendering order confirmation page');

  return (
    <div className="container max-w-3xl py-8">
      <div className="text-center mb-8">
        {order.status === "pending" && order.payment_method === "paypal" ? (
          <>
            <CheckCircle2 className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Order Created!</h1>
            <p className="text-muted-foreground">
              Please complete your payment using PayPal below to complete your order.
            </p>
          </>
        ) : (
          <>
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-muted-foreground">
              Thank you for your order. We'll send you a confirmation email shortly.
            </p>
          </>
        )}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
          <CardDescription>Order #{order.id}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Order Items */}
          <div className="space-y-4">
            <h3 className="font-semibold">Items</h3>
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b">
                <div>
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                </div>
                <p className="font-mepaypalConfig.clientIddium">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          {/* Shipping Details */}
          <div className="space-y-2">
            <h3 className="font-semibold">Shipping Details</h3>
            <p>{order.shipping_details.firstName} {order.shipping_details.lastName}</p>
            <p>{order.shipping_details.address}</p>
            <p>{order.shipping_details.city}, {order.shipping_details.postcode}</p>
            <p>{order.shipping_details.email}</p>
          </div>

          {/* Order Notes */}
          {order.notes && (
            <div className="space-y-2">
              <h3 className="font-semibold">Order Notes</h3>
              <p className="text-muted-foreground">{order.notes}</p>
            </div>
          )}

          {/* Order Summary */}
          <div className="space-y-2 pt-4 border-t">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(order.total_amount - order.shipping_fee)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{formatPrice(order.shipping_fee)}</span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t">
              <span>Total</span>
              <span>{formatPrice(order.total_amount)}</span>
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-2">
            <h3 className="font-semibold">Payment Details</h3>
            <p className="capitalize">
              {order.payment_method.replace(/_/g, ' ')}
            </p>
          </div>

          {order.payment_method === "paypal" && order.status === "pending" && (
            <div className="mt-4">
              <PayPalScriptProvider
                options={{
                  "client-id": ENV.PAYPAL_CLIENT_ID,
                  currency: "GBP",
                  intent: "capture",
                  components: "buttons",
                  "data-sdk-integration-source": "integrationbuilder_sc"
                }}
              >
                <PayPalButtons 
                  style={{
                    layout: 'vertical',
                    color: 'blue',
                    shape: 'rect',
                    label: 'paypal'
                  }}
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      purchase_units: [{
                        amount: {
                          value: order.total_amount.toString(),
                          currency_code: "GBP"
                        },
                        custom_id: orderId
                      }]
                    });
                  }}
                  onApprove={async (data, actions) => {
                    if (!actions.order) return;
                    
                    try {
                      const details = await actions.order.capture();
                      
                      if (details.status === "COMPLETED") {
                        navigate(`/order-confirmation/${orderId}?message=payment-success`);
                      } else {
                        console.error("Payment not completed:", details);
                      }
                    } catch (error) {
                      console.error("Payment capture failed:", error);
                    }
                  }}
                  onError={(error) => {
                    console.error("PayPal error:", error);
                  }}
                />
              </PayPalScriptProvider>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <p>Need help? Contact our support team at support@indibe.net</p>
      </div>
    </div>
  );
} 