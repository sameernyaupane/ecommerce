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
        {/* Main Policy Header */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-pink-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Return Policy (Including UK) at INDIBE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 leading-relaxed">
              At<strong> INDIBE</strong>, we serve as a platform connecting buyers and sellers of beauty products. While we are not responsible for the return items as we are solely a platform, we strive to facilitate a smooth transaction process and provide assistance in case of any issues that may arise. Please read our return policy carefully, as it outlines the guidelines and procedures for returns on our platform.
            </p>
          </CardContent>
        </Card>

        {/* General Return Guidelines */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">General Return Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <section className="space-y-4">
                <h3 className="text-2xl font-semibold">Eligibility</h3>
                <p className="text-gray-600 leading-relaxed">
                  All customers, including those from the European Union (EU), the United States of America (USA), the United Kingdom (UK), and other countries, can initiate return requests.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-2xl font-semibold">Condition of Items</h3>
                <p className="text-gray-600 leading-relaxed">
                  For beauty products, the items must be unopened, unused, and in their original packaging to be eligible for return.
                  <br /><br />
                  Hygienic products, such as cosmetics, skincare, personal care items, and any product that comes into direct contact with the body, cannot be returned once opened, due to health and safety reasons.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-2xl font-semibold">Return Period</h3>
                <p className="text-gray-600 leading-relaxed">
                  Customers must request a return within [XX] days from the date of delivery, following the guidelines set by the respective vendor.
                  <br /><br />
                  Late return requests may not be accepted unless there are exceptional circumstances.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-2xl font-semibold">Return Shipping Costs</h3>
                <p className="text-gray-600 leading-relaxed">
                  The return shipping costs are the responsibility of the customer, unless otherwise agreed upon by the vendor.
                  <br /><br />
                  Customers should refer to the vendor's policy for specific information on return shipping cost arrangements.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-2xl font-semibold">Mediation and Assistance</h3>
                <p className="text-gray-600 leading-relaxed">
                  While we are not directly responsible for return items, we are committed to providing support and acting as a mediator between buyers and sellers to help resolve any issues that may arise.
                  <br /><br />
                  If there is a dispute or concern regarding a return, customers can contact our customer support team, and we will do our best to assist in reaching a satisfactory resolution.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>

        {/* EU and UK Returns Policy */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">EU and UK Returns Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <section className="space-y-4">
                <h3 className="text-2xl font-semibold">Right of Withdrawal (EU)</h3>
                <p className="text-gray-600 leading-relaxed">
                  Customers from the European Union have the right to withdraw from the purchase within 14 days from the date of delivery, without providing a reason, as per EU consumer protection regulations.
                  <br /><br />
                  To exercise this right, customers must follow the return instructions provided by the respective vendor.
                  <br /><br />
                  The customer is responsible for the return shipping costs unless otherwise agreed upon by the vendor
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-2xl font-semibold">UK Returns (Consumer Contracts Regulations)</h3>
                <p className="text-gray-600 leading-relaxed">
                  Customers from the United Kingdom have the right to cancel their order and return the goods within 14 days from the date of delivery, as per the Consumer Contracts Regulations.
                  <br /><br />
                  To exercise this right, customers must follow the return instructions provided by the respective vendor.
                  <br /><br />
                  The customer is responsible for the return shipping costs unless otherwise agreed upon by the vendor.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-2xl font-semibold">Third Country Returns</h3>
                <p className="text-gray-600 leading-relaxed">
                  Returns from other countries outside the EU, USA, and UK will follow the general return guidelines outlined in section 1.
                  <br /><br />
                  Customers should familiarize themselves with their country's specific customs and shipping regulations when returning items.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>

        {/* Exclusions */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Exclusions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <section className="space-y-4">
                <h3 className="text-2xl font-semibold">Final Sale Items</h3>
                <p className="text-gray-600 leading-relaxed">
                  Some items may be marked as "final sale" or non-returnable. Customers should carefully review the product description and return policy provided by the vendor before making a purchase.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-2xl font-semibold">Contact Us</h3>
                <p className="text-gray-600 leading-relaxed">
                  If you have any questions or require assistance regarding a return or dispute, please contact our customer support team at <a href="mailto:returns@indibe.com" className="text-pink-600 hover:underline">returns@indibe.com</a>.
                  <br /><br />
                  Please note that this return policy is subject to change without prior notice. It is advisable to review the policy before making a purchase or initiating a return.
                  <br /><br />
                  Thank you for choosing INDIBE. We appreciate your business.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 