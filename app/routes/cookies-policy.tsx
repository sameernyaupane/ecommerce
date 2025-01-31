import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Cookies Policy - Indibe" },
    { 
      name: "description",
      content: "Understand how Indibe uses cookies and tracking technologies to enhance your browsing experience. Manage your cookie preferences."
    },
  ];
};

export default function CookiesPolicyRoute() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Main Header */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-pink-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Cookies Policy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              <strong>Last Updated:</strong> 13th August 2023
            </p>
          </CardContent>
        </Card>

        {/* Consent Section */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Consent & Control</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We use cookies to enhance your experience. Manage settings via our cookie banner.
              Non-essential cookies require explicit consent.
            </p>
          </CardContent>
        </Card>

        {/* Cookie Types */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Cookie Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="space-y-2">
                <h3 className="font-semibold">Essential Cookies</h3>
                <p className="text-muted-foreground">
                  Required for website functionality. Cannot be disabled.
                </p>
              </section>
              <section className="space-y-2">
                <h3 className="font-semibold">Analytics Cookies</h3>
                <p className="text-muted-foreground">
                  Track usage patterns via Google Analytics. 
                  <a href="https://tools.google.com/dlpage/gaoptout" 
                     className="text-pink-600 hover:underline ml-1">
                    Opt-out available
                  </a>
                </p>
              </section>
              <section className="space-y-2">
                <h3 className="font-semibold">Advertising Cookies</h3>
                <p className="text-muted-foreground">
                  Used by third-party advertisers to deliver relevant ads
                </p>
              </section>
              <section className="space-y-2">
                <h3 className="font-semibold">Security Cookies</h3>
                <p className="text-muted-foreground">
                  Protect user data and prevent unauthorized access
                </p>
              </section>
            </div>
          </CardContent>
        </Card>

        {/* Management Section */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Cookie Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="space-y-2">
                <h3 className="font-semibold">Browser Settings</h3>
                <div className="space-y-1 text-muted-foreground">
                  <p>Manage cookies through:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><a href="https://support.google.com/chrome" className="text-pink-600 hover:underline">Chrome</a></li>
                    <li><a href="https://support.mozilla.org" className="text-pink-600 hover:underline">Firefox</a></li>
                    <li><a href="https://support.apple.com" className="text-pink-600 hover:underline">Safari</a></li>
                  </ul>
                </div>
              </section>
              <section className="space-y-2">
                <h3 className="font-semibold">Tracking Technologies</h3>
                <p className="text-muted-foreground">
                  We use web beacons and pixel tags. Control via cookie settings.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>

        {/* Contact & Legal */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">More Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Full Details</h3>
              <p className="text-muted-foreground">
                Review our <a href="/privacy-policy" className="text-pink-600 hover:underline">Privacy Policy</a> 
                for complete information on data practices
              </p>
            </div>
            <div className="pt-4 border-t">
              <p className="text-muted-foreground">
                Contact us at <a href="mailto:support@indibe.net" className="text-pink-600 hover:underline">support@indibe.net</a>
                <br />
                124 City Road, London EC1V 2NX
              </p>
            </div>
          </CardContent>
        </Card>

        {/* New section for tracking technologies */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Tracking Technologies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="space-y-2">
                <h3 className="font-semibold">Session Cookies</h3>
                <p className="text-muted-foreground">
                  Temporary cookies deleted after each session, essential for checkout functionality.
                  Permanent cookies expire after 2 years unless manually cleared.
                </p>
              </section>
              <section className="space-y-2">
                <h3 className="font-semibold">Opt-Out</h3>
                <p className="text-muted-foreground">
                  Opt-out of tracking technologies:
                </p>
                <a href="https://optout.networkadvertising.org" 
                   className="text-pink-600 hover:underline">
                  Network Advertising Initiative Opt-Out
                </a>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 