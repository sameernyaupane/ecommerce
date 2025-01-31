import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { title, description } from "@/config.shared";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: title("FAQs") },
    { name: "description", content: description("Frequently asked questions about INDIBE's services and platform") },
  ];
};

export default function FAQsRoute() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Introduction Section */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-pink-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-600 leading-relaxed">
              Find answers to common questions about INDIBE's platform, services, and policies.
            </p>
          </CardContent>
        </Card>

        {/* Shopping & Orders */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Shopping & Orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">How do I place an order?</h3>
                <p className="text-muted-foreground">Browse our products, add items to your cart, and proceed to checkout. Follow the simple steps to complete your purchase.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                <p className="text-muted-foreground">We accept major credit cards, PayPal, and other secure payment methods.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping & Delivery */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Shipping & Delivery</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">How long does shipping take?</h3>
                <p className="text-muted-foreground">Shipping times vary by location. Domestic orders typically arrive within 3-5 business days.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Do you ship internationally?</h3>
                <p className="text-muted-foreground">Yes, we ship to select international destinations. Shipping times and costs vary by location.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Returns & Refunds */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Returns & Refunds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">What is your return policy?</h3>
                <p className="text-muted-foreground">We accept returns within 30 days of purchase. Items must be unused and in original packaging.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">How do I initiate a return?</h3>
                <p className="text-muted-foreground">Contact our customer service team to initiate a return. We'll provide a return shipping label and instructions.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 