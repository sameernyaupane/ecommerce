import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { title, description } from "@/config.shared";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: title("Shipping") },
    { name: "description", content: description("Learn about INDIBE's shipping options and delivery times") },
  ];
};

export default function ShippingRoute() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Introduction Section */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-pink-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Shipping Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-600 leading-relaxed">
              Find out everything you need to know about our shipping options, delivery times, and costs.
            </p>
          </CardContent>
        </Card>

        {/* Delivery Options */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Delivery Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <h3 className="font-semibold">Standard Delivery</h3>
              <p className="text-muted-foreground">3-5 working days</p>
              
              <h3 className="font-semibold">Express Delivery</h3>
              <p className="text-muted-foreground">1-2 working days</p>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Costs */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Shipping Costs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Shipping costs are calculated based on your location and chosen delivery method.
              Free shipping is available on orders over £50 within the UK.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 