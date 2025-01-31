import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function FeesPolicyRoute() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Main Header */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-pink-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Fees Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-600 leading-relaxed">
              <strong>Last Updated:</strong> 1st August 2023
            </p>
          </CardContent>
        </Card>

        {/* Fee Structure */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Transaction Fees</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="space-y-2">
                <h3 className="font-semibold">Listing Fees</h3>
                <p className="text-muted-foreground">
                  Currently <strong className="text-pink-600">no charge</strong> for listing items
                </p>
              </section>
              <section className="space-y-2">
                <h3 className="font-semibold">Sales Commission</h3>
                <p className="text-muted-foreground">
                  <strong className="text-purple-600">5%</strong> transaction fee on successful sales
                </p>
              </section>
            </div>
          </CardContent>
        </Card>

        {/* Payment Processing */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="space-y-2">
                <h3 className="font-semibold">Processing Fees</h3>
                <p className="text-muted-foreground">
                  Third-party payment gateway charges may apply
                </p>
              </section>
              <section className="space-y-2">
                <h3 className="font-semibold">Currency Exchange</h3>
                <p className="text-muted-foreground">
                  Rates determined by financial institutions
                </p>
              </section>
            </div>
          </CardContent>
        </Card>

        {/* Shipping & Compliance */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Logistics & Regulations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="space-y-2">
                <h3 className="font-semibold">Shipping</h3>
                <p className="text-muted-foreground">
                  Arranged directly between buyers and sellers
                </p>
              </section>
              <section className="space-y-2">
                <h3 className="font-semibold">Legal Compliance</h3>
                <p className="text-muted-foreground">
                  Users responsible for tax and regulatory obligations
                </p>
              </section>
            </div>
          </CardContent>
        </Card>

        {/* Policy Management */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Policy Updates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We reserve the right to modify fees with prior notice. Continued use constitutes acceptance.
            </p>
            <div className="pt-4 border-t">
              <p className="text-muted-foreground">
                Questions? Contact <a href="mailto:support@indibe.net" className="text-pink-600 hover:underline">support@indibe.net</a>
              </p>
            </div>
            <div className="pt-4 border-t">
              <p className="text-muted-foreground">
                Cross-border transactions may incur additional bank currency conversion fees.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 