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

        {/* Regulations Guide Container */}
        <div className="space-y-12">
          {/* Main Regulations Title Card */}
          <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardHeader>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Guide to Selling Cosmetics Products in the UK, EU, and Worldwide
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Individual Regulation Cards */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Introduction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 leading-relaxed">
                Welcome to our online platform for selling personal and beauty care products. As a seller, it's crucial to comply with the regulations set forth by the UK, EU, and international cosmetic authorities to ensure the safety and legality of your products. This guide provides an overview of the essential guidelines and requirements for selling cosmetics products in the UK, EU, and worldwide. Please note that this guide serves only for informational purposes, and it's essential to consult legal experts and authorities for specific compliance measures.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Understanding Cosmetics Regulations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 leading-relaxed">
                Cosmetics are regulated to ensure consumer safety and product quality. In the UK and EU, cosmetics products are subject to strict regulations to protect public health. These regulations govern product composition, labelling, testing, and marketing. As you expand your reach worldwide, it's crucial to familiarize yourself with the specific regulations in each target market.
              </p>
            </CardContent>
          </Card>

          {/* Continue this pattern for each section */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Product Composition and Safety</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Ensure that your cosmetics products are safe for human use and do not contain banned or restricted substances. Refer to the EU Cosmetics Regulation (EC) No 1223/2009 and the UK Cosmetics Regulation (UK Cosmetics Regulation 2008) for a list of prohibited and restricted ingredients.</li>
                <li>Perform safety assessments for your cosmetics products by qualified professionals to comply with EU and UK requirements.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Product Labelling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Follow the EU Cosmetics Regulation and UK Cosmetics Regulation guidelines for labelling your products. The label must be in English (and other applicable languages) and include:
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>Product name and function</li>
                    <li>Ingredients list (INCI format)</li>
                    <li>Net quantity (weight/volume)</li>
                    <li>Batch number or reference</li>
                    <li>Manufacturer's name and address</li>
                    <li>Period-after-opening (PAO) symbol (for products with a shelf life of less than 30 months)</li>
                  </ul>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Cosmetic Product Safety Report (CPSR)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>The EU requires a Cosmetic Product Safety Report for all cosmetics products before they can be placed on the market. This report assesses the safety of the product and its compliance with EU regulations.</li>
                <li>For products sold in the UK, a similar safety assessment is required.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Product Testing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Conduct necessary tests (e.g., stability, microbial, challenge, etc.) to ensure the safety and quality of your cosmetics products.</li>
                <li>Keep records of all tests performed and make them available upon request.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Notification and Registration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>In the EU, cosmetic products should be notified through the Cosmetic Product Notification Portal (CPNP) before being placed on the market.</li>
                <li>In the UK, products may need registration with the Office for Product Safety and Standards (OPSS) under the UK Product Safety and Metrology etc. (Amendment etc.) (EU Exit) Regulations 2019.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Packaging and Environmental Considerations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Comply with EU and UK packaging regulations, including restrictions on certain materials (e.g., microplastics) and recyclability requirements.</li>
                <li>Be aware of potential restrictions on certain packaging materials in specific markets worldwide.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Protect your brand and product formulations by securing patents, trademarks, and copyrights as necessary.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Responsible Person Requirement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>In both the UK and EU, the concept of a "Responsible Person" (RP) is crucial for the sale of cosmetic products. The Responsible Person is a legal entity or person who is designated to ensure that the cosmetic product complies with all the applicable regulations and requirements.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Responsibilities of the Responsible Person</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>The Responsible Person takes on the following key responsibilities:
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li><strong>Ensuring Product Compliance</strong>: The RP must ensure that the cosmetic product meets all the safety, quality, and labelling requirements set forth in the respective regulations.</li>
                    <li><strong>Product Information File (PIF)</strong>: The RP is responsible for creating and maintaining the Product Information File containing all relevant data and test results.</li>
                    <li><strong>Notification or Registration</strong>: Handle product notifications through CPNP (EU) or OPSS registration (UK).</li>
                    <li><strong>Post-Market Surveillance</strong>: Monitor product performance and safety post-launch.</li>
                    <li><strong>Cooperation with Authorities</strong>: Work with MHRA (UK) or NCAs (EU) as needed.</li>
                  </ul>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Selling Non-Manufactured Products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>The Responsible Person requirement applies even if you're not the manufacturer. Sellers must identify a designated RP for each product.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Changes Post-Brexit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>UK now has separate regulations including UK-based Responsible Person requirements and distinct labelling rules.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Compliance with Both UK and EU Regulations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Dual compliance requires separate Responsible Persons and adherence to both regulatory systems for cross-market sales.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Conclusion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Selling cosmetics globally requires strict adherence to evolving regulations. Stay updated and consult legal experts to maintain compliance across markets.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">References</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>EU Cosmetics Regulation: <a href="https://ec.europa.eu/growth/sectors/cosmetics_en" className="text-pink-600 hover:underline">ec.europa.eu</a></li>
                <li>UK Guidance: <a href="https://www.gov.uk/guidance/cosmetics" className="text-pink-600 hover:underline">gov.uk</a></li>
                <li>Cosmetics Europe: <a href="https://www.cosmeticseurope.eu/" className="text-pink-600 hover:underline">cosmeticseurope.eu</a></li>
                <li>MHRA: <a href="https://www.gov.uk/guidance/cosmetics" className="text-pink-600 hover:underline">gov.uk/mhra</a></li>
                <li>ICCR: <a href="https://www.iccr-cosmetics.org/" className="text-pink-600 hover:underline">iccr-cosmetics.org</a></li>
                <li>Business Companion: <a href="https://www.businesscompanion.info/en/quick-guides/product-safety/cosmetic-products" className="text-pink-600 hover:underline">businesscompanion.info</a></li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Disclaimer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 leading-relaxed">
                The information provided in this guide is for general informational purposes only and does not constitute legal advice. Cosmetics regulations may vary over time and across different regions. It is crucial to seek advice from legal experts and regulatory authorities to ensure compliance with specific and up-to-date requirements for selling cosmetics products in your target markets.
              </p>
            </CardContent>
          </Card>
        </div>

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