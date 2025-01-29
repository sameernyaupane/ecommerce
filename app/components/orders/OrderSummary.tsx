import { formatPrice } from "@/lib/utils";

type OrderItem = {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price_at_time: number;
  user_id?: number; // vendor's user_id from products table
};

type OrderSummaryProps = {
  items: OrderItem[] | null;
  showVendorItems?: boolean;
  userId?: number; // vendor's user_id
};

export function OrderSummary({ items, showVendorItems = false, userId }: OrderSummaryProps) {
  if (!items || items.length === 0) {
    return <div className="text-sm text-muted-foreground">No items found</div>;
  }

  // If showing vendor items, filter items for specific vendor
  const displayItems = showVendorItems && userId
    ? items.filter(item => item.user_id === userId)
    : items;

  if (displayItems.length === 0) {
    return <div className="text-sm text-muted-foreground">No items found for this vendor</div>;
  }

  return (
    <div className="text-sm space-y-1">
      {displayItems.map((item) => (
        <div key={item.id} className="flex justify-between">
          <span>
            {item.quantity}x{" "}
            <a 
              href={`/product/${item.product_id}`}
              className="hover:text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.product_name}
            </a>
          </span>
          <span className="text-muted-foreground">
            {formatPrice(item.price_at_time * item.quantity)}
          </span>
        </div>
      ))}
    </div>
  );
} 