import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { title, description } from "@/config.shared";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: title("Website Terms & Conditions") },
    { name: "description", content: description("Read our website terms and conditions") },
  ];
};

export default function WebsiteTermsConditionsRoute() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Main Header */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-pink-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Website Terms & Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-600 leading-relaxed">
              <strong>Last Updated:</strong> 13th August 2023
              <br /><br />
              Please read the following Terms and Conditions carefully. They are important and represent a binding agreement between you and Indibe Ltd
            </p>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">About Us</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We are Indibe Ltd., a company registered in England and Wales.
              <br /><br />
              <strong>Address:</strong><br />
              124 City Road,<br />
              London<br />
              EC1V 2NX<br />
              United Kingdom<br />
              <strong>Company Number:</strong> 14558307
            </p>
          </CardContent>
        </Card>

        {/* Services Section */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">What We Do</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Indibe Ltd operates an online marketplace at www.indibe.net where independent sellers can display their beauty products created by independently owned businesses. These products are available to customers who have registered with us.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Sellers may display new lab equipment or related tools and cosmetic ingredients</li>
              <li>Excess cosmetic ingredients or used lab equipment</li>
              <li>Third-party services such as advertisements</li>
            </ul>
          </CardContent>
        </Card>

        {/* Cookies Policy */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Cookies Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Our website uses cookies; by using our website or agreeing to these Terms and Conditions, 
              you consent to our use of cookies following the terms of our Privacy and Cookie Policy.
            </p>
          </CardContent>
        </Card>

        {/* Products & Definitions */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Products & Definitions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="space-y-2">
                <h3 className="font-semibold">Product Listings</h3>
                <p className="text-muted-foreground">
                  Sellers display products with descriptions and prices. We reserve the right to 
                  correct pricing errors and refuse orders with incorrect listings.
                </p>
              </section>
              <section className="space-y-2">
                <h3 className="font-semibold">Key Definitions</h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>"Site" means www.indibe.net</li>
                  <li>"Customer" means registered buyer</li>
                  <li>"Products" mean items sold by third-party sellers</li>
                </ul>
              </section>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Buying Process */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Order Process</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <section className="space-y-2">
                <h3 className="font-semibold">Order Steps</h3>
                <ol className="list-decimal pl-6 space-y-1 text-muted-foreground">
                  <li>Select products and add to cart</li>
                  <li>Create account/sign in</li>
                  <li>Complete payment via secure system</li>
                  <li>Receive dispatch confirmation</li>
                </ol>
              </section>
              <section className="space-y-2">
                <h3 className="font-semibold">Contract Formation</h3>
                <p className="text-muted-foreground">
                  Contract forms when product is dispatched. Email confirmation of dispatch 
                  serves as acceptance of your offer.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>

        {/* Legal Protections */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Legal Protections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="space-y-2">
                <h3 className="font-semibold">Limitation of Liability</h3>
                <p className="text-muted-foreground">
                  We are not liable for third-party products, website errors, hacking attempts, 
                  or delays beyond our control. Does not affect statutory rights.
                </p>
              </section>
              <section className="space-y-2">
                <h3 className="font-semibold">Indemnification</h3>
                <p className="text-muted-foreground">
                  You agree to cover costs arising from breaches of these terms, including 
                  legal fees and third-party claims.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>

        {/* Additional Legal Sections */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Additional Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <section className="space-y-2">
                <h3 className="font-semibold">Force Majeure</h3>
                <p className="text-muted-foreground">
                  Not liable for delays caused by events beyond our control including 
                  natural disasters, pandemics, or infrastructure failures.
                </p>
              </section>
              <section className="space-y-2">
                <h3 className="font-semibold">Assignment</h3>
                <p className="text-muted-foreground">
                  Rights under this agreement cannot be transferred without written consent. 
                  We may assign our rights to successors.
                </p>
              </section>
              <section className="space-y-2">
                <h3 className="font-semibold">Severability</h3>
                <p className="text-muted-foreground">
                  If any clause is found invalid, remaining terms stay enforceable. 
                  Invalid provisions to be replaced with valid equivalents.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>

        {/* User Agreements */}
        <div className="space-y-8">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Using Our Site</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="space-y-2">
                  <h3 className="font-semibold">Eligibility</h3>
                  <p className="text-muted-foreground">
                    To access or use our Site, you must be 18 years or older. Persons under 18 are prohibited from using the Site.
                  </p>
                </section>
                <section className="space-y-2">
                  <h3 className="font-semibold">Account Requirements</h3>
                  <p className="text-muted-foreground">
                    You must provide accurate information and maintain account security. Prohibited activities include impersonation and illegal use.
                  </p>
                </section>
              </div>
            </CardContent>
          </Card>

          {/* Transactions */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Purchasing Process</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="space-y-2">
                  <h3 className="font-semibold">Payment & Pricing</h3>
                  <p className="text-muted-foreground">
                    Prices may change and are set by sellers. You agree to pay all charges through our secure payment system.
                  </p>
                </section>
                <section className="space-y-2">
                  <h3 className="font-semibold">Delivery & Fulfillment</h3>
                  <p className="text-muted-foreground">
                    Delivery organized by sellers. Contract forms when product is dispatched. Color/product variations may occur.
                  </p>
                </section>
              </div>
            </CardContent>
          </Card>

          {/* Legal Sections */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Policies & Liabilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="space-y-2">
                  <h3 className="font-semibold">Refunds & Returns</h3>
                  <p className="text-muted-foreground">
                    All refunds handled by sellers. Contact seller directly for returns. INDIBE acts as mediator only.
                  </p>
                </section>
                <section className="space-y-2">
                  <h3 className="font-semibold">Intellectual Property</h3>
                  <p className="text-muted-foreground">
                    Content protected by copyright. No unauthorized use of trademarks or site content without written consent.
                  </p>
                </section>
              </div>
            </CardContent>
          </Card>

          {/* Legal Framework */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Legal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="space-y-2">
                  <h3 className="font-semibold">Governing Law</h3>
                  <p className="text-muted-foreground">
                    English law applies. Disputes resolved through mediation or English courts. Legal costs recoverable by prevailing party.
                  </p>
                </section>
                <section className="space-y-2">
                  <h3 className="font-semibold">Limitations</h3>
                  <p className="text-muted-foreground">
                    Not liable for third-party content or technical issues. Force majeure events may affect service delivery.
                  </p>
                </section>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Information Section */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              To access this website and use some of its resources, we may ask you to provide details or information to register for or buy Products. It is a condition of use that all the information you give us is accurate, true, and current.
            </p>
            <p className="text-muted-foreground">
              You acknowledge and agree that our Privacy Policy regulates any information you give us to register. You also agree to all our actions concerning your information according to that Privacy Policy.
            </p>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Intellectual Property Rights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="space-y-2">
                <h3 className="font-semibold">Ownership</h3>
                <p className="text-muted-foreground">
                  Our Site contains intellectual property owned by Indibe Ltd including trademarks, copyrights, proprietary information. You may not modify, publish, transmit, participate in transfer/sale of, create derivative works from, or exploit any Site Content without prior written consent.
                </p>
              </section>
              <section className="space-y-2">
                <h3 className="font-semibold">Third-Party Rights</h3>
                <p className="text-muted-foreground">
                  Sellers or any third party may not use our trademarks in connection with any Products in confusing or harmful ways. Other trademarks belong to respective owners and must be respected.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>

        {/* Terms Modification */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Changes & Termination</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <section className="space-y-2">
                <h3 className="font-semibold">Change of Terms</h3>
                <p className="text-muted-foreground">
                  We may change these Terms at any time. Amendments are effective when posted. Continued use constitutes acceptance. We may change/discontinue any Site feature subject to seller obligations.
                </p>
              </section>
              <section className="space-y-2">
                <h3 className="font-semibold">Termination</h3>
                <p className="text-muted-foreground">
                  We may terminate your access without notice for violations. Contract duration with sellers lasts until performance completion. Termination by mutual written agreement.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>

        {/* Third-Party Links */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">External Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Our Site may contain third-party links. We are not responsible for their availability, accuracy, or policies. Links don't imply endorsement. You assume all risk using external resources.
            </p>
          </CardContent>
        </Card>

        {/* Comprehensive Agreements */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Complete Understanding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <section className="space-y-2">
                <h3 className="font-semibold">Entire Agreement</h3>
                <p className="text-muted-foreground">
                  These Terms with Privacy Policy constitute the whole agreement. Supersedes all prior understandings. We rely on these written Terms exclusively.
                </p>
              </section>
              <section className="space-y-2">
                <h3 className="font-semibold">Notices</h3>
                <p className="text-muted-foreground">
                  All communications must be in writing to:<br />
                  Email: info@indibe.net<br />
                  Address: 124 City Road, London EC1V 2NX<br />
                  Contact sellers directly for product-related notices.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>

        {/* Legal Framework */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Legal Provisions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="space-y-2">
                <h3 className="font-semibold">Dispute Resolution</h3>
                <p className="text-muted-foreground">
                  Unresolved disputes within 30 days may be mediated through accredited service. Failing settlement, disputes go to English courts. Initial mediation costs shared equally.
                </p>
              </section>
              <section className="space-y-2">
                <h3 className="font-semibold">Cost Recovery</h3>
                <p className="text-muted-foreground">
                  Prevailing party in legal action entitled to recover reasonable attorney fees and costs. Applies to enforcement actions and breach proceedings.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>

        {/* Contact & Updates */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Contact & Updates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              <strong>Email:</strong> <a href="mailto:info@indibe.net" className="text-pink-600 hover:underline">info@indibe.net</a><br />
              We reserve the right to update these terms. Continued use constitutes acceptance of changes.
            </p>
          </CardContent>
        </Card>

        {/* Age Verification */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Age Restrictions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              To access or use our Site, you must be 18 years of age or older. Persons under 18 are strictly prohibited from using the Site.
            </p>
          </CardContent>
        </Card>

        {/* Product Details */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Product Specifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <section className="space-y-2">
                <h3 className="font-semibold">Color Variations</h3>
                <p className="text-muted-foreground">
                  Product colors/textures may vary due to materials and manufacturing processes. Contact sellers directly for specific product queries.
                </p>
              </section>
              <section className="space-y-2">
                <h3 className="font-semibold">Packaging Requirements</h3>
                <p className="text-muted-foreground">
                  You are responsible for following all packaging instructions and ensuring no infringement of third-party rights.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>

        {/* Financial Terms */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Financial Policies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="space-y-2">
                <h3 className="font-semibold">Electronic Invoicing</h3>
                <p className="text-muted-foreground">
                  You agree to receive sales invoices electronically where applicable.
                </p>
              </section>
              <section className="space-y-2">
                <h3 className="font-semibold">Order Refusal</h3>
                <p className="text-muted-foreground">
                  We reserve the right to refuse any order without stating reasons. Orders only accepted after payment confirmation.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>

        {/* Conduct Guidelines */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Permitted Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              You agree not to post or transmit any material that is:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Threatening, abusive, or defamatory</li>
              <li>Racist, discriminatory, or invasive of privacy</li>
              <li>Obscene, vulgar, or profane</li>
              <li>Containing harmful formulas/instructions</li>
              <li>Encouraging criminal conduct</li>
            </ul>
          </CardContent>
        </Card>

        {/* Legal Enforcement */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Enforcement Rights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <section className="space-y-2">
                <h3 className="font-semibold">Right to Act</h3>
                <p className="text-muted-foreground">
                  Our failure to enforce any right doesn't constitute waiver. We retain full enforcement privileges.
                </p>
              </section>
              <section className="space-y-2">
                <h3 className="font-semibold">Legal Reliance</h3>
                <p className="text-muted-foreground">
                  These written Terms constitute our definitive agreement. Previous understandings are superseded.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 