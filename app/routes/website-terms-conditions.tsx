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
        {/* Introduction Section */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-pink-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Website Terms & Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-600 leading-relaxed">
              Please read these terms and conditions carefully before using our website.
            </p>
          </CardContent>
        </Card>

        {/* General Terms */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">General Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              By accessing and using INDIBE, you agree to be bound by these terms and conditions,
              our privacy policy, and all applicable laws and regulations.
            </p>
          </CardContent>
        </Card>

        {/* User Responsibilities */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">User Responsibilities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Users must provide accurate information when creating an account or making purchases.
              You are responsible for maintaining the confidentiality of your account details.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 