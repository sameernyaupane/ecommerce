import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { title, description } from "@/config.shared";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: title("Help Centre") },
    { name: "description", content: description("Get help and support for your INDIBE experience") },
  ];
};

export default function HelpCentreRoute() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Introduction Section */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-pink-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Help Centre
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-600 leading-relaxed">
              Find answers to your questions and get the support you need.
            </p>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a href="/faqs" className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <h3 className="font-semibold mb-2">FAQs</h3>
                <p className="text-muted-foreground">Browse frequently asked questions</p>
              </a>
              <a href="/shipping" className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <h3 className="font-semibold mb-2">Shipping Information</h3>
                <p className="text-muted-foreground">Learn about shipping options and delivery times</p>
              </a>
              <a href="/returns" className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <h3 className="font-semibold mb-2">Returns & Refunds</h3>
                <p className="text-muted-foreground">Understand our return and refund policies</p>
              </a>
              <a href="/secure-payment" className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <h3 className="font-semibold mb-2">Payment Security</h3>
                <p className="text-muted-foreground">Learn about our secure payment methods</p>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Contact Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Need additional help? Our support team is here for you.
              Contact us at support@indibe.net
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 