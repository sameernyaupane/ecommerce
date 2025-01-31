import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Privacy Policy - Indibe" },
    { 
      name: "description",
      content: "Learn how Indibe collects, uses, and protects your personal data. Understand your privacy rights under GDPR and CCPA."
    },
  ];
};

export default function PrivacyPolicyRoute() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Main Header */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-pink-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              <strong>Last Updated:</strong> 13th August 2023
            </p>
          </CardContent>
        </Card>

        {/* Data Collection */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Data We Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="space-y-2">
                <h3 className="font-semibold">Direct Collection</h3>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Account registration details</li>
                  <li>Payment information</li>
                  <li>User surveys & feedback</li>
                </ul>
              </section>
              <section className="space-y-2">
                <h3 className="font-semibold">Automatic Collection</h3>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Cookies & tracking technologies</li>
                  <li>Device information</li>
                  <li>Usage analytics</li>
                </ul>
              </section>
            </div>
          </CardContent>
        </Card>

        {/* Age Requirements */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Age Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Users must be 18+ to register. We do not knowingly collect data from anyone under 13.
            </p>
          </CardContent>
        </Card>

        {/* User Rights */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Your Rights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="space-y-2">
                <h3 className="font-semibold">GDPR Protections</h3>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Right to access & rectification</li>
                  <li>Right to erasure</li>
                  <li>Data portability rights</li>
                </ul>
              </section>
              <section className="space-y-2">
                <h3 className="font-semibold">CCPA Protections</h3>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Opt-out of data sales</li>
                  <li>Non-discrimination rights</li>
                  <li>Deletion requests</li>
                </ul>
              </section>
            </div>
          </CardContent>
        </Card>

        {/* Third Parties */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Third-Party Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="space-y-2">
                <h3 className="font-semibold">Google Services</h3>
                <p className="text-muted-foreground">
                  <Link 
                    to="https://tools.google.com/dlpage/gaoptout" 
                    className="text-pink-600 hover:underline"
                    rel="noopener noreferrer"
                    target="_blank">
                    Google Analytics Opt-Out
                  </Link>
                  <br />
                  <Link
                    to="https://policies.google.com/privacy"
                    className="text-pink-600 hover:underline"
                    rel="noopener noreferrer"
                    target="_blank">
                    Google Privacy Policy
                  </Link>
                </p>
              </section>
              <section className="space-y-2">
                <h3 className="font-semibold">Advertising Partners</h3>
                <p className="text-muted-foreground">
                  Manage preferences via our cookie settings
                </p>
              </section>
              <section className="space-y-2">
                <h3 className="font-semibold">Google Fonts</h3>
                <p className="text-muted-foreground">
                  Font requests collect IP addresses. Data processed in the US.
                </p>
              </section>
            </div>
            <p className="text-muted-foreground">
              Ad partners use pixel tags and device fingerprinting. Control via cookie settings.
            </p>
          </CardContent>
        </Card>

        {/* Contact & Compliance */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Contact & Compliance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="space-y-2">
                <h3 className="font-semibold">Data Controller</h3>
                <p className="text-muted-foreground">
                  Indibe Ltd<br />
                  124 City Road, London EC1V 2NX<br />
                  Company No. 13231736
                </p>
              </section>
              <section className="space-y-2">
                <h3 className="font-semibold">Regulatory Authority</h3>
                <p className="text-muted-foreground">
                  <Link
                    to="https://ico.org.uk"
                    className="text-pink-600 hover:underline"
                    rel="noopener noreferrer"
                    target="_blank">
                    UK Information Commissioner's Office
                  </Link>
                </p>
              </section>
            </div>
            <div className="pt-4 border-t">
              <p className="text-muted-foreground">
                Email: <Link to="mailto:info@indibe.net" className="text-pink-600 hover:underline">info@indibe.net</Link>
                <br />
                Response time: 30 days for data requests
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CCPA Opt-Out */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">CCPA Opt-Out</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              <Link 
                to="/ccpa-opt-out"
                className="text-pink-600 hover:underline block mt-2">
                Do Not Sell My Personal Information
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Data Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Invoice records retained for 6 years as required by UK tax law.
              Analytics data stored for 26 months from last activity.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 