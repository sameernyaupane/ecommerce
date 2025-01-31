import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { title, description } from "@/config.shared";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: title("Refund Policy") },
    { name: "description", content: description("Learn about INDIBE's refund policy and process") },
  ];
};

export default function RefundPolicyRoute() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Introduction Section */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-pink-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Refund Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-600 leading-relaxed">
              Understanding our refund process and when you're eligible for a refund.
            </p>
          </CardContent>
        </Card>

        {/* Refund Eligibility */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Refund Eligibility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Refunds are available for:
              <br />• Unopened items returned within 30 days
              <br />• Damaged or defective items
              <br />• Incorrect items received
            </p>
          </CardContent>
        </Card>

        {/* Refund Process */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Refund Process</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Once we receive and inspect your return, we will notify you about the status of your refund.
              If approved, your refund will be processed using your original payment method.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 