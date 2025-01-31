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
        {/* Main Help Section */}
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

        {/* Getting Started */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-6">
              <section className="space-y-2">
                <h3 className="font-semibold">How to Register</h3>
                <p className="text-muted-foreground">
                  Learn how to join the vibrant beauty community of INDIBE as <strong>a Vendor or Customer</strong>.
                  Follow these simple steps:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Visit <a href="https://indibe.net" className="text-pink-600 hover:underline">www.indibe.net</a></li>
                  <li>Click <a href="https://indibe.net/my-account-2/" className="text-pink-600 hover:underline">Register</a></li>
                  <li>Choose account type (Vendor/Customer)</li>
                  <li>Vendor registration: <a href="https://indibe.net/vendor-register/" className="text-pink-600 hover:underline">indibe.net/vendor-register</a></li>
                  <li>Complete verification process</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold">Vendor Setup</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Access Vendor Dashboard post-registration</li>
                  <li>Customize storefront with brand assets</li>
                  <li>Configure shipping and return policies</li>
                </ul>
              </section>
            </div>
          </CardContent>
        </Card>

        {/* Product Listing & Attributes */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Product Listing & Attributes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <section className="space-y-2">
                <h3 className="font-semibold">Listing Basics</h3>
                <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                  <li>Choose appropriate categories</li>
                  <li>Specify product attributes (skin type, hair concerns)</li>
                  <li>Add custom attributes when needed</li>
                  <li>Optimize with relevant tags</li>
                </ul>
              </section>
              <section className="space-y-2">
                <h3 className="font-semibold">Enhanced Visibility</h3>
                <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                  <li>Use high-quality product images</li>
                  <li>Set competitive pricing strategies</li>
                  <li>Utilize catalogue search features</li>
                  <li>Create promotional offers</li>
                </ul>
              </section>
            </div>
          </CardContent>
        </Card>

        {/* Selling on INDIBE */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Selling on INDIBE</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <section className="space-y-2">
                <h3 className="font-semibold">Order Management</h3>
                <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                  <li>Real-time order tracking</li>
                  <li>Shipping configuration</li>
                  <li>Inventory management</li>
                </ul>
              </section>
              <section className="space-y-2">
                <h3 className="font-semibold">Business Growth</h3>
                <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                  <li>Sales analytics dashboard</li>
                  <li>Customer engagement tools</li>
                  <li>Marketing campaign setup</li>
                </ul>
              </section>
            </div>
          </CardContent>
        </Card>

        {/* Buying on INDIBE */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Buying on INDIBE</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <section className="space-y-2">
                <h3 className="font-semibold">Shopping Features</h3>
                <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                  <li>Advanced product filtering</li>
                  <li>Secure payment gateway</li>
                  <li>Order tracking system</li>
                </ul>
              </section>
              <section className="space-y-2">
                <h3 className="font-semibold">Sustainability</h3>
                <p className="text-muted-foreground">
                  We prioritize eco-friendly practices and partner with sustainable brands
                </p>
              </section>
            </div>
          </CardContent>
        </Card>

        {/* Product Types */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Product Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <section className="space-y-2">
                <h3 className="font-semibold">Simple Products</h3>
                <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                  <li>Single variant items</li>
                  <li>Basic pricing setup</li>
                  <li>Straightforward inventory</li>
                </ul>
              </section>
              <section className="space-y-2">
                <h3 className="font-semibold">Variable Products</h3>
                <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                  <li>Multiple variants (size/color)</li>
                  <li>Attribute-based pricing</li>
                  <li>Variant-specific images</li>
                </ul>
              </section>
            </div>
          </CardContent>
        </Card>

        {/* Security & Support */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Security & Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <section className="space-y-2">
                <h3 className="font-semibold">Account Security</h3>
                <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                  <li>Password recovery system</li>
                  <li>Two-factor authentication</li>
                  <li>Compliance guidelines</li>
                </ul>
              </section>
              <section className="space-y-2">
                <h3 className="font-semibold">Contact Support</h3>
                <div className="space-y-1">
                  <p>Email: <a href="mailto:support@indibe.net" className="text-pink-600 hover:underline">support@indibe.net</a></p>
                  <p>Phone: <a href="tel:+441234567890" className="text-pink-600 hover:underline">+44 1234 567890</a></p>
                  <p>Live Chat: Available 24/7</p>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 