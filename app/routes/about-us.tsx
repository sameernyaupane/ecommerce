import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { title, description } from "@/config.shared";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: title("About Us") },
    { name: "description", content: description("Learn about INDIBE's mission to empower indie beauty creators and promote sustainable beauty") },
  ];
};

export default function AboutUs() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Introduction Section */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-pink-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to INDIBE
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800">Founded by Renju Karki: Empowering Indie Beauty Creators</h2>
              <p className="text-gray-600 leading-relaxed">
                Founded by Renju Karki, our platform emerged from her deep understanding of evolving consumer preferences and her passion for supporting indie beauty creators.
              </p>
            </div>
            <Separator className="bg-purple-200" />
          </CardContent>
        </Card>

        {/* Empowering Choices Section */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Your Beauty, Your Way
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 leading-relaxed">
              In today's beauty landscape, we recognize that consumers seek products that align with their individual preferences and values.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Our platform exclusively supports indie beauty creators, ensuring you have access to a diverse range of products tailored to your unique journey.
            </p>
          </CardContent>
        </Card>

        {/* Sustainability Section */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Sustainable Beauty, Community Thrive</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              At INDIBE, sustainability is not just a trend; it's a core value ingrained in everything we do. We champion eco-friendly practices and advocate for the use of environmentally friendly ingredients and packaging.
            </p>
            <p className="text-muted-foreground mt-4">
              By prioritizing sustainability, we aim to pave the way for a cleaner, greener future that benefits both consumers and the planet. Additionally, we foster a close-knit community that shares our commitment to sustainability.
            </p>
          </CardContent>
        </Card>

        {/* Safety Section */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Ensuring Consumer Safety</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              At INDIBE, your safety comes first. We proudly welcome products that have undergone the necessary tests required by relevant regulations, ensuring they are declared safe for consumer use.
            </p>
            <p className="text-muted-foreground mt-4">
              We understand the importance of transparency and adherence to stringent safety standards. Join us in our commitment to offering products that prioritize your well-being without compromise.
            </p>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center space-y-4 bg-gradient-to-br from-pink-50 to-purple-50 p-8 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Join Our Journey
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Explore the world of indie beauty online. Be part of our journey to redefine beauty on your terms.
          </p>
          <p className="text-2xl font-semibold mt-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Together, let's LOOK GOOD FEEL COOL
          </p>
        </div>
      </div>
    </div>
  );
} 