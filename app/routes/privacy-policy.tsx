import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { title, description } from "@/config.shared";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: title("Privacy Policy") },
    { name: "description", content: description("Learn about how we protect and handle your personal information") },
  ];
};

export default function PrivacyPolicyRoute() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Introduction Section */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-pink-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-600 leading-relaxed">
              At INDIBE, we take your privacy seriously. This policy outlines how we collect, use, and protect your personal information.
            </p>
          </CardContent>
        </Card>

        {/* Information Collection */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Information We Collect</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We collect information that you provide directly to us, including name, email address, shipping address, and payment information when you make a purchase.
              We also automatically collect certain information about your device and how you interact with our website.
            </p>
          </CardContent>
        </Card>

        {/* Information Usage */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We use your information to process orders, communicate with you about your purchases, and improve our services.
              We may also use your information to send you marketing communications, subject to your preferences.
            </p>
          </CardContent>
        </Card>

        {/* Data Protection */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Data Protection</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We implement appropriate technical and organizational measures to protect your personal information
              against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 