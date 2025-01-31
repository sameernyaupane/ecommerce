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
        {/* Main Policy Header */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Vendor Shipping Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-600 leading-relaxed">
              This <strong>Vendor Shipping Policy</strong> outlines the shipping arrangements and guidelines for vendors/sellers utilizing our website. By using our platform as a vendor/seller, you agree to comply with the terms and conditions set forth in this policy.
            </p>
          </CardContent>
        </Card>

        {/* Policy Sections */}
        <div className="space-y-8">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Welcome to INDIBE!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                This <strong>Vendor Shipping Policy</strong> outlines the shipping arrangements and guidelines for vendors/sellers utilizing our website.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Shipping Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                As a vendor/seller, you have the flexibility to choose from a wide range of shipping methods available within the UK, Europe and International.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Shipping Costs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                As a responsible vendor/seller, it is essential to determine and set reasonable shipping costs for your products.
                <br /><br />
                Your shipping costs should accurately reflect expenses related to packaging, handling, and shipping the items to ensure a transparent transaction with buyers.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Shipping Restrictions and Limitations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                Be mindful of any shipping restrictions or limitations enforced by carriers or relevant regulations.
                <br /><br />
                Always ensure that the products you offer for sale comply with all applicable shipping regulations and restrictions to avoid any shipping complications.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Shipping Times and Order Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                Provide buyers with a seamless shopping experience by processing and shipping orders promptly according to the chosen shipping methods and timeframes.
                <br /><br />
                Clearly communicate any estimated order processing times and shipping durations to set accurate expectations for your customers.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Order Tracking and Communication</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                Enhance customer satisfaction by providing accurate and up-to-date tracking information for their orders whenever possible.
                <br /><br />
                Maintain open and timely communication with buyers regarding their shipment status, potential delays, and promptly address any shipping-related inquiries or concerns.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Shipping Support and Disputes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                In the rare event of shipping-related disputes, promptly address the issue with the buyer in a professional and customer-centric manner.
                <br /><br />
                Seek assistance from our dedicated customer support team if needed to facilitate communication and resolve shipping-related disputes amicably.
                <br /><br />
                Please note that INDIBE reserves the right to modify this Vendor Shipping Policy at any time. Any updates or changes to the policy will be promptly communicated to vendors/sellers through appropriate channels.
                <br /><br />
                By utilizing our platform as a vendor/seller, you acknowledge and agree to the terms and conditions outlined in this Vendor Shipping Policy.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 