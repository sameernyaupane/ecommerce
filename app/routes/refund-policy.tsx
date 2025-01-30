import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [{ title: "Refund Policy" }];
};

export default function RefundPolicyRoute() {
  return (
    <div>
      {/* Content for Refund Policy page */}
      <h1>Refund Policy</h1>
      <p>TODO: Add Refund Policy content here.</p>
    </div>
  );
} 