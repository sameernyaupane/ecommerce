import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [{ title: "Privacy Policy" }];
};

export default function PrivacyPolicyRoute() {
  return (
    <div>
      {/* Content for Privacy Policy page */}
      <h1>Privacy Policy</h1>
      <p>TODO: Add Privacy Policy content here.</p>
    </div>
  );
} 