import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [{ title: "F.A.Qs" }];
};

export default function FAQsRoute() {
  return (
    <div>
      {/* Content for FAQs page */}
      <h1>F.A.Qs</h1>
      <p>TODO: Add FAQs content here.</p>
    </div>
  );
} 