import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [{ title: "Shipping" }];
};

export default function ShippingRoute() {
  return (
    <div>
      {/* Content for Shipping page */}
      <h1>Shipping</h1>
      <p>TODO: Add Shipping content here.</p>
    </div>
  );
} 