import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { title, description } from "@/config.shared";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: title("FAQs") },
    { name: "description", content: description("Frequently asked questions about INDIBE's platform and services") },
  ];
};

export default function FAQsRoute() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Main Header Card */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-pink-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 leading-relaxed">
              INDIBE is an online marketplace that caters to various stakeholders in the beauty industry. 
              Brands/sellers can sell their brand-new beauty products on our platform.
            </p>
          </CardContent>
        </Card>

        {/* FAQ Cards Container */}
        <div className="space-y-6">
          {[
            {
              id: 1,
              target: "collapse295731",
              question: "How do I register as a vendor or customer?",
              answer: <>Visit <a href="https://www.indibe.net/" className="text-pink-600 hover:underline">www.indibe.net</a> and click the "Register" button. Choose account type and complete verification.</>
            },
            {
              id: 2,
              target: "collapse295732",
              question: "What are the benefits of registering as a vendor?",
              answer: "As a registered vendor, you can create your own storefront, list your beauty products for sale, manage your inventory, and reach a wider customer base. You'll also have access to various tools and features to help you manage and grow your business effectively."
            },
            {
              id: 3,
              target: "collapse295733",
              question: "How do I list my products on INDIBE?",
              answer: "Once you have registered as a vendor, you can log in to your account and navigate to the vendor dashboard. From there, you can easily add new products, provide product descriptions, set prices, upload product images, and manage your product inventory."
            },
            {
              id: 4,
              target: "collapse295734",
              question: "What payment methods are supported on INDIBE?",
              answer: "We currently support two popular payment gateways: Square and PayPal. These payment methods ensure secure and convenient transactions for both vendors and customers."
            },
            {
              id: 5,
              target: "collapse295735",
              question: "What is the shipping process for orders placed on INDIBE?",
              answer: "The shipping process may vary depending on the vendors and their chosen shipping methods. Some vendors may offer free shipping, while others may charge a shipping fee. We support Royal Mail shipping, which allows customers to choose from various shipping options."
            },
            {
              id: 6,
              target: "collapse295736",
              question: "Are the ingredients in the beauty products listed on your platform safe and approved?",
              answer: "We encourage our vendors to provide accurate and detailed product information, including the ingredients used in their beauty products. However, it's important to note that we do not personally verify or approve the ingredients/products. We recommend customers to review the product details and conduct their own research or consult with a relevant body if they have specific concerns or allergies."
            },
            {
              id: 7,
              target: "collapse295737",
              question: "How can I contact a specific vendor?",
              answer: "Each vendor on our platform has an Enquiry Tab to be contacted by customers."
            },
            {
              id: 8,
              target: "collapse295738",
              question: "What if I have an issue with an order or need to return a product?",
              answer: "If you encounter any issues with your order or need to return a product, we recommend contacting the vendor directly. Vendors are responsible for their own customer service and returns/exchange policies. However, if you're unable to reach a resolution with the vendor, you can reach out to our customer support team for further assistance."
            },
            {
              id: 9,
              target: "collapse295739",
              question: "How can I provide feedback or report a problem with INDIBE?",
              answer: "We value your feedback and strive to provide the best possible experience on our platform. If you have any feedback or encounter any problems while using INDIBE, please don't hesitate to contact our customer support team. We appreciate your input and will work to address any issues promptly."
            },
            {
              id: 10,
              target: "collapse2957310",
              question: "Return Policy:",
              answer: "Our platform encourages vendors to establish their own return policies. When purchasing a beauty product, we recommend reviewing the specific vendor's return policy listed on their storefront. Each vendor may have different return or exchange policies, so it's important to familiarize yourself with their terms before making a purchase. If you encounter any issues with a return or have questions regarding a vendor's return policy, we suggest contacting the vendor directly for assistance."
            },
            {
              id: 11,
              target: "collapse2957311",
              question: "Account Blocking:",
              answer: "In certain cases, your account may be blocked or suspended temporarily. This can happen due to violations of our platform's terms of service, fraudulent activity, or other breaches of our policies. If your account has been blocked, we advise reaching out to our customer support team to understand the reasons behind the block and to discuss possible solutions."
            },
            {
              id: 12,
              target: "collapse2957312",
              question: "Forgot Password:",
              answer: "If you forget your account password, you can easily reset it by following the \"Forgot Password\" link on the login page. You will receive instructions on how to reset your password via the email address associated with your account. If you do not receive the reset email, please check your spam or junk folder. If you continue to experience difficulties, contact our customer support team for further assistance."
            }
          ].map((faq) => (
            <Card key={faq.id} className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  {faq.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground">
                  {typeof faq.answer === 'string' ? 
                    <p>{faq.answer}</p> : 
                    faq.answer
                  }
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 