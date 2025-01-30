import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [{ title: "Returns" }];
};

export default function ReturnsRoute() {
  return (
    <div>
      {/* Content for Returns page */}
      <h1>Returns</h1>
      <p>TODO: Add Returns content here.</p>
    </div>
  );
} 