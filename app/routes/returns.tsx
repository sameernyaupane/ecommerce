import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { title, description } from "@/config.shared";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: title("Returns") },
    { name: "description", content: description("Learn about INDIBE's return and refund policies") },
  ];
};

export default function ReturnsRoute() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Introduction Section */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-pink-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Returns Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-600 leading-relaxed">
              We want you to be completely satisfied with your purchase. Learn about our returns process and policies.
            </p>
          </CardContent>
        </Card>

        {/* Return Process */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Return Process</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <h3 className="font-semibold">How to Return</h3>
              <p className="text-muted-foreground">
                1. Contact our customer service within 30 days of receiving your order<br />
                2. Obtain a return authorization number<br />
                3. Package your unused item in its original packaging<br />
                4. Ship the item back using the provided return label
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Return Conditions */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Return Conditions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Items must be unused, in original packaging, and returned within 30 days of delivery.
              Some items, such as personal care products that have been opened, cannot be returned for hygiene reasons.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 