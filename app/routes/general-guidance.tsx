import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { title, description } from "@/config.shared";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: title("General Guidance") },
    { name: "description", content: description("General guidance and information about using INDIBE") },
  ];
};

export default function GeneralGuidanceRoute() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Introduction Section */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-pink-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              General Guidance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-600 leading-relaxed">
              Everything you need to know about shopping on INDIBE and making the most of your experience.
            </p>
          </CardContent>
        </Card>

        {/* Shopping Guide */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Shopping Guide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Browse our curated selection of indie beauty products, add items to your cart,
              and checkout securely. Create an account to track orders and save your favorites.
            </p>
          </CardContent>
        </Card>

        {/* Product Quality */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Product Quality</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              All products on INDIBE are carefully selected from trusted indie beauty creators.
              We ensure all products meet safety and quality standards.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 