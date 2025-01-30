import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [{ title: "Help Centre" }];
};

export default function HelpCentreRoute() {
  return (
    <div>
      {/* Content for Help Centre page */}
      <h1>Help Centre</h1>
      <p>TODO: Add Help Centre content here.</p>
    </div>
  );
} 