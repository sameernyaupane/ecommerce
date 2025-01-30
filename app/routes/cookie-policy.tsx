import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [{ title: "Cookie Policy" }];
};

export default function CookiePolicyRoute() {
  return (
    <div>
      {/* Content for Cookie Policy page */}
      <h1>Cookie Policy</h1>
      <p>TODO: Add Cookie Policy content here.</p>
    </div>
  );
} 