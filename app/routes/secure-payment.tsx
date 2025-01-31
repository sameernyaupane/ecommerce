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
        {/* Main Header */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-pink-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Secure Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <h2 className="text-3xl font-bold">Ensuring the Safety of Your Online Transactions</h2>
            <p className="text-gray-600 leading-relaxed">
              In the digital age, online shopping has become an integral part of our lives. However, with the convenience of making purchases from the comfort of our homes comes the concern of security. At INDIBE, we understand the importance of safeguarding your payment information and ensuring a secure shopping experience. In this article, we will explore the measures we have put in place to prioritize the security of your online transactions.
            </p>
          </CardContent>
        </Card>

        {/* Security Features */}
        <div className="space-y-8">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-3xl font-bold">Payment Security Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="space-y-2">
                  <h3 className="text-xl font-semibold">Multiple Payment Options</h3>
                  <p className="text-gray-600 leading-relaxed">
                    At INDIBE, we believe in providing flexibility to our customers when it comes to making payments. We offer multiple payment options to cater to your preferences. Whether you prefer credit/debit cards, or other payment methods, we've got you covered. Our aim is to make the payment process smooth and convenient for you.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-xl font-semibold">Trusted Payment Gateways</h3>
                  <p className="text-gray-600 leading-relaxed">
                    To ensure the highest level of security, we have partnered with reputable payment gateways. These industry-leading platforms are renowned for their robust security measures and have earned the trust of millions of users worldwide. When you choose to pay through these gateways, you can be confident that your payment information is in safe hands.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-xl font-semibold">Encryption & Transmission</h3>
                  <p className="text-gray-600 leading-relaxed">
                    When you initiate a payment on our platform, rest assured that we utilize industry-standard encryption protocols to protect your sensitive data. Encryption ensures that your payment information is scrambled into a code that can only be decrypted by authorized parties.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-xl font-semibold">Data Protection Compliance</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Respecting your privacy and adhering to data protection regulations are of utmost importance to us. We handle your information with the highest level of care and ensure compliance with relevant laws. Your trust is valuable to us, and we are committed to maintaining the confidentiality of your personal and financial data.
                  </p>
                </section>
              </div>
            </CardContent>
          </Card>

          {/* Security Measures */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-3xl font-bold">Advanced Security Measures</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="space-y-2">
                  <h3 className="text-xl font-semibold">No Payment Storage</h3>
                  <p className="text-gray-600 leading-relaxed">
                    At INDIBE, we take your security seriously. For this reason, we do not store any credit card or payment information on our servers. Once your transaction is complete, we let go of your data to minimize any potential risks. By not retaining sensitive information, we eliminate the possibility of unauthorized access.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-xl font-semibold">Proactive Monitoring</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Our dedicated team continuously monitors our payment infrastructure for any signs of suspicious activity or potential vulnerabilities. We stay vigilant to detect and respond to any threats promptly. Additionally, we keep our systems up-to-date with the latest security patches and practices to fortify our defences against emerging risks.
                  </p>
                </section>
              </div>
            </CardContent>
          </Card>

          {/* Conclusion */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-3xl font-bold">Our Commitment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                At INDIBE, our commitment to providing a secure payment system is unwavering. We want you to shop with confidence, knowing that your online transactions are protected by stringent security measures. We value your trust in us, and it motivates us to maintain the highest standards of security and customer service.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 