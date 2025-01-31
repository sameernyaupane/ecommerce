import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Privacy Policy - Indibe" },
    { 
      name: "description",
      content: "Indibe's privacy policy outlining data collection, usage, and protection practices. Learn about your GDPR and CCPA rights."
    },
  ];
};

export default function PrivacyPolicyRoute() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Main Header - Updated */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-pink-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Your Privacy Matters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              <strong>Last Updated:</strong> 13th August 2023
            </p>
            <p className="text-muted-foreground">
              We uphold the highest data protection standards in compliance with GDPR and CCPA regulations.
            </p>
          </CardContent>
        </Card>

        {/* Data Collection - Full Text Version */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Data We Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <section className="space-y-4">
              <h3 className="font-semibold">Categories of Data Being Processed</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Basic identifiable data: name, email address, physical address</li>
                <li>Electronic identifiable data: Cookies, IP addresses, telephone numbers, beacons</li>
                <li>Electronic location data: tracking technology</li>
                <li>Financial identifiable data: to process payments for our products</li>
                <li>Information protected against security breaches, e.g., name, password</li>
                <li>Commercial information, e.g., records of services purchased</li>
                <li>Internet activity, e.g., browsing history, search history</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h3 className="font-semibold">Data Sources</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Directly from you (e.g., account registration)</li>
                <li>Indirectly from you (e.g., website activity observation)</li>
              </ul>
            </section>
          </CardContent>
        </Card>

        {/* Google Analytics - Exact Text Preservation */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Google Analytics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Google Analytics is an analytics service which supplies statistics and basic analytical tools for search engine optimisation and marketing purposes.
            </p>
            <div className="space-y-2">
              <h3 className="font-semibold">Examples of Collected Information:</h3>
              <ul className="list-disc pl-6 text-muted-foreground">
                <li>Terms you search for</li>
                <li>Views and interactions with content and ads</li>
                <li>People with whom you communicate or share content</li>
                <li>Activity on third-party sites and apps using Google services</li>
              </ul>
            </div>
            <p className="text-muted-foreground">
              Location data collection: GPS, device sensors, and IP address
              <br />
              Technologies used: Cookies, pixel tags, local storage, server logs
            </p>
            <div className="pt-4 space-y-2">
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
                Google Privacy Notice
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* New Legal Basis Section */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Legal Basis for Processing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">GDPR Article 6 Compliance</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Contractual necessity for service delivery</li>
                <li>Legal obligations for tax records</li>
                <li>Legitimate interest for security & analytics</li>
                <li>Explicit consent for marketing communications</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Updated Data Retention */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Data Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-muted-foreground">
                Financial records retained for 6 years under UK tax law.
                <br />
                Analytics data preserved for 26 months from last activity.
                <br />
                Marketing consent data maintained until withdrawal.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Updated Contact Section */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Contact & Complaints</CardTitle>
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
                <h3 className="font-semibold">Supervisory Authority</h3>
                <p className="text-muted-foreground">
                  UK Information Commissioner's Office<br />
                  <Link
                    to="https://ico.org.uk"
                    className="text-pink-600 hover:underline"
                    rel="noopener noreferrer"
                    target="_blank">
                    ico.org.uk
                  </Link>
                </p>
              </section>
            </div>
            <div className="pt-4 border-t">
              <p className="text-muted-foreground">
                Email: <Link to="mailto:info@indibe.net" className="text-pink-600 hover:underline">info@indibe.net</Link>
                <br />
                <span className="block mt-2">Response timeframe: 30 days for data subject requests</span>
              </p>
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

        {/* CCPA Opt-Out - Updated with Missing Text */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">CCPA Opt-Out</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                The California Consumer Privacy Act (CCPA) gives you rights concerning how your data 
                or personal information is treated. California residents can choose to opt out of 
                the "sale" of their personal information to third parties.
              </p>
              <p className="text-muted-foreground">
                <strong>Important Notes:</strong>
                <br />
                • We have not sold any categories of personal information in the preceding 12 months
                <br />
                • We do not sell the personal data of children under 16
              </p>
              <p className="text-muted-foreground">
                <Link 
                  to="/ccpa-opt-out"
                  className="text-pink-600 hover:underline block mt-2">
                  Do Not Sell My Personal Information
                </Link>
                <span className="block mt-2 text-sm">
                  (Must be browsing from California to opt-out)
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Marketing & Opt-Out */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Marketing Communications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We may send newsletters by email using consent as our legal basis (Article 6(1)(a) GDPR). 
              You must opt-in through clear affirmative action like checkbox selection.
            </p>
            <div className="pt-4">
              <p className="text-muted-foreground">
                To withdraw consent: <Link to="mailto:info@indibe.net" className="text-pink-600 hover:underline">info@indibe.net</Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Children's Data */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Children's Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We do not knowingly collect data from anyone under 13 without parental consent.
              <br /><br />
              Only users 18+ may register. No one under 18 should use our services.
            </p>
          </CardContent>
        </Card>

        {/* Expanded Rights Section */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Your Data Rights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="space-y-2">
                <h3 className="font-semibold">GDPR Specific Rights</h3>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Right to access (Article 15)</li>
                  <li>Right to rectification (Article 16)</li>
                  <li>Right to erasure (Article 17)</li>
                  <li>Right to restrict processing (Article 18)</li>
                  <li>Right to data portability (Article 20)</li>
                  <li>Right to object (Article 21)</li>
                </ul>
              </section>
              <section className="space-y-2">
                <h3 className="font-semibold">CCPA Specific Rights</h3>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Know what personal data is collected</li>
                  <li>Request deletion of collected data</li>
                  <li>Opt-out of data sales</li>
                  <li>Non-discrimination protection</li>
                </ul>
              </section>
            </div>
          </CardContent>
        </Card>

        {/* Data Sharing */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Data Sharing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We share data with necessary service providers including:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Postal operators for delivery</li>
              <li>Hosting providers for infrastructure</li>
              <li>Legal and accounting firms for compliance</li>
              <li>Payment processors for transactions</li>
            </ul>
          </CardContent>
        </Card>

        {/* Full Accountability Section */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Accountability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">UK Supervisory Authority</h3>
              <p className="text-muted-foreground">
                Information Commissioner's Office<br />
                Wycliffe House, Water Lane<br />
                Wilmslow, Cheshire SK9 5AF<br />
                Tel: 0303 123 1113
              </p>
            </div>
            <div className="pt-4">
              <p className="text-muted-foreground">
                Non-UK residents should contact their local data protection authority.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 