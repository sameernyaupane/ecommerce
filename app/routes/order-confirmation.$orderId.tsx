import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { OrderModel } from "@/models/OrderModel";
import { CheckCircle2 } from "lucide-react";
import { useEffect } from "react";
import { useShoppingState } from "@/hooks/use-shopping-state";


export async function loader({ request, params }: LoaderFunctionArgs) {
  const order = await OrderModel.getById(parseInt(params.orderId!));
  if (!order) {
    throw new Response("Order not found", { status: 404 });
  }

  return json({ 
    order,
    message: new URL(request.url).searchParams.get('message')
  });
}

export default function OrderConfirmationPage() {
  const { order, message } = useLoaderData<typeof loader>();
  const shoppingState = useShoppingState();

  useEffect(() => {
    if (message === 'reset-cart') {
      shoppingState.reset();
    }
  }, [message]);

  return (
    <div className="container max-w-3xl py-8">
      <div className="text-center mb-8">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground">
          Thank you for your order. We'll send you a confirmation email shortly.
        </p>
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
                <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
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

          {/* Payment Details */}
          <div className="space-y-2">
            <h3 className="font-semibold">Payment Details</h3>
            <p className="capitalize">
              {order.payment_method.replace(/_/g, ' ')}
            </p>
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
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <p>Need help? Contact our support team at support@indibe.net</p>
      </div>
    </div>
  );
} 