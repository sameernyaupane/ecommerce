import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { title, description } from "@/config.shared";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: title("Secure Payment") },
    { name: "description", content: description("Learn about our secure payment methods and transaction security") },
  ];
};

export default function SecurePaymentRoute() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Introduction Section */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-pink-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Secure Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-600 leading-relaxed">
              Your security is our priority. Learn about our secure payment methods and how we protect your transactions.
            </p>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Payment Methods</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We accept various secure payment methods including:
              <br />• Credit/Debit Cards (Visa, Mastercard, American Express)
              <br />• PayPal
              <br />• Apple Pay
              <br />• Google Pay
            </p>
          </CardContent>
        </Card>

        {/* Security Measures */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Security Measures</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              All transactions are encrypted using industry-standard SSL technology.
              We never store your complete card details on our servers.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 