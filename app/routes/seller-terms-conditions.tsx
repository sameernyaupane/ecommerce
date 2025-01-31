import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Seller Terms & Conditions - Indibe" },
    { 
      name: "description",
      content: "Legal terms for sellers using Indibe's marketplace platform. Review commission rates, obligations, and seller policies."
    },
  ];
};

export default function SellerTermsConditionsRoute() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Main Header */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-pink-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Seller Terms & Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-600 leading-relaxed">
              <strong>Effective Date:</strong> 13th August 2023
              <br /><br />
              These Terms and Conditions represent a binding agreement between you and Indibe Ltd.
            </p>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">About Indibe Ltd</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We are Indibe Ltd., registered in England and Wales (Company No. 14558307).
              <br /><br />
              <strong>Address:</strong><br />
              124 City Road, London EC1V 2NX, United Kingdom
            </p>
          </CardContent>
        </Card>

        {/* Marketplace Overview */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Marketplace Operations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="space-y-2">
                <h3 className="font-semibold">Platform Services</h3>
                <p className="text-muted-foreground">
                  We provide an online marketplace for beauty products and lab equipment. 
                  All seller activities are monitored and must comply with these terms.
                </p>
              </section>
              <section className="space-y-2">
                <h3 className="font-semibold">Product Scope</h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Beauty products from independent businesses</li>
                  <li>New/used lab equipment & ingredients</li>
                  <li>Third-party advertisements</li>
                </ul>
              </section>
            </div>
          </CardContent>
        </Card>

        {/* Financial Terms */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Payment Structure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="space-y-2">
                <h3 className="font-semibold">Commission & Fees</h3>
                <p className="text-muted-foreground">
                  5% commission on all sales<br />
                  Monthly electronic invoicing<br />
                  Immediate payment required
                </p>
              </section>
              <section className="space-y-2">
                <h3 className="font-semibold">Payment Processing</h3>
                <p className="text-muted-foreground">
                  Secure transactions via Stripe/PayPal<br />
                  Tax compliance responsibility<br />
                  Self-employed status maintained
                </p>
              </section>
              <section className="space-y-2">
                <h3 className="font-semibold">Tax Compliance</h3>
                <p className="text-muted-foreground">
                  Sellers must comply with VAT regulations and any applicable international tax laws.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>

        {/* Selling Requirements */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Seller Obligations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="space-y-2">
                <h3 className="font-semibold">Product Listings</h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Accurate descriptions & pricing</li>
                  <li>Compliance with consumer laws</li>
                  <li>Clear shipping/returns policies</li>
                </ul>
              </section>
              <section className="space-y-2">
                <h3 className="font-semibold">Order Fulfillment</h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Contract directly with customers</li>
                  <li>Dispatch confirmation required</li>
                  <li>Quality control maintained</li>
                </ul>
              </section>
            </div>
          </CardContent>
        </Card>

        {/* Legal Protections */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Legal Framework</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="space-y-2">
                <h3 className="font-semibold">Returns Policy</h3>
                <p className="text-muted-foreground">
                  14-day cooling-off period for EU/UK customers<br />
                  Exceptions for hygiene-sensitive products<br />
                  Must comply with Consumer Rights Act 2015
                </p>
              </section>
              <section className="space-y-2">
                <h3 className="font-semibold">Intellectual Property</h3>
                <p className="text-muted-foreground">
                  No unauthorized use of Indibe trademarks<br />
                  Respect third-party IP rights<br />
                  Confidentiality maintained for 3 years
                </p>
              </section>
            </div>
          </CardContent>
        </Card>

        {/* Additional Terms */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Additional Provisions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="space-y-2">
                <h3 className="font-semibold">Termination</h3>
                <p className="text-muted-foreground">
                  1-year initial term with auto-renewal<br />
                  30-day termination notice required<br />
                  Immediate removal for violations
                </p>
              </section>
              <section className="space-y-2">
                <h3 className="font-semibold">Liability</h3>
                <p className="text-muted-foreground">
                  Not liable for third-party actions<br />
                  Force majeure protection<br />
                  Insurance coverage required
                </p>
              </section>
            </div>
          </CardContent>
        </Card>

        {/* Contact & Legal */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Legal Compliance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <section className="space-y-2">
                <h3 className="font-semibold">Dispute Resolution</h3>
                <p className="text-muted-foreground">
                  30-day mediation period<br />
                  English court jurisdiction<br />
                  Prevailing party recovers costs
                </p>
              </section>
              <section className="space-y-2">
                <h3 className="font-semibold">Contact</h3>
                <p className="text-muted-foreground">
                  <strong>Email:</strong> info@indibe.net<br />
                  <strong>Address:</strong> 124 City Road, London EC1V 2NX<br />
                  Written notices required
                </p>
              </section>
            </div>
          </CardContent>
        </Card>

        {/* Warranties */}
        <div className="pt-4 border-t">
          <p className="text-muted-foreground">
            Products must meet EU cosmetic regulations (EC) No 1223/2009 and UK equivalents.
          </p>
        </div>
      </div>
    </div>
  );
} 