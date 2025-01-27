import { formatPrice } from "@/lib/utils";

type OrderItem = {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price_at_time: number;
};

type OrderSummaryProps = {
  items: OrderItem[] | null;
  showVendorItems?: boolean;
  vendorId?: number;
};

export function OrderSummary({ items, showVendorItems = false, vendorId }: OrderSummaryProps) {
  if (!items || items.length === 0) {
    return <div className="text-sm text-muted-foreground">No items found</div>;
  }

  // If showing vendor items, filter items for specific vendor
  const displayItems = items;

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