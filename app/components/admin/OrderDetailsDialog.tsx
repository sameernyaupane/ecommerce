import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { OrderStatus } from "@/models/OrderModel";
import { cn } from "@/lib/styles";

interface OrderDetailsDialogProps {
  order: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusColors: Record<OrderStatus, { bg: string; text: string; ring: string }> = {
  pending: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    ring: "ring-yellow-700/10"
  },
  confirmed: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    ring: "ring-blue-700/10"
  },
  processing: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    ring: "ring-purple-700/10"
  },
  shipped: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    ring: "ring-indigo-700/10"
  },
  delivered: {
    bg: "bg-green-50",
    text: "text-green-700",
    ring: "ring-green-700/10"
  },
  cancelled: {
    bg: "bg-red-50",
    text: "text-red-700",
    ring: "ring-red-700/10"
  }
};

export function OrderDetailsDialog({ order, open, onOpenChange }: OrderDetailsDialogProps) {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span>Order #{order.id}</span>
              <span className={cn(
                "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
                statusColors[order.status as OrderStatus].bg,
                statusColors[order.status as OrderStatus].text,
                statusColors[order.status as OrderStatus].ring
              )}>
                {order.status}
              </span>
            </div>
            <span className="text-sm font-normal text-muted-foreground">
              {order.time_ago}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2 mt-4">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div>
                <h3 className="font-semibold mb-2">Items</h3>
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <a 
                        href={`/product/${item.product_id}`}
                        className="font-medium hover:text-primary hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.product_name}
                      </a>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-medium">{formatPrice(item.price_at_time * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-4">
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

          <Card>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <h3 className="font-semibold">Customer Details</h3>
                <div className="grid grid-cols-[100px_1fr] gap-1">
                  <span className="text-muted-foreground">Name:</span>
                  <span>{order.first_name} {order.last_name}</span>
                  <span className="text-muted-foreground">Email:</span>
                  <span>{order.email}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Shipping Address</h3>
                <div className="grid grid-cols-[100px_1fr] gap-1">
                  <span className="text-muted-foreground">Address:</span>
                  <span>{order.address}</span>
                  <span className="text-muted-foreground">City:</span>
                  <span>{order.city}</span>
                  <span className="text-muted-foreground">Postcode:</span>
                  <span>{order.postcode}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Payment Details</h3>
                <div className="grid grid-cols-[100px_1fr] gap-1">
                  <span className="text-muted-foreground">Method:</span>
                  <span className="capitalize">{order.payment_method.replace(/_/g, ' ')}</span>
                </div>
              </div>

              {order.notes && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Order Notes</h3>
                  <p className="text-muted-foreground">{order.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
} 