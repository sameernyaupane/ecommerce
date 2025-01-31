import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { title, description } from "@/config.shared";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: title("Cookie Policy") },
    { name: "description", content: description("Learn about how we use cookies to enhance your browsing experience") },
  ];
};

export default function CookiePolicyRoute() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Introduction Section */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-pink-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Cookie Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-600 leading-relaxed">
              This Cookie Policy explains how we use cookies and similar tracking technologies on our website.
            </p>
          </CardContent>
        </Card>

        {/* What Are Cookies Section */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">What Are Cookies?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Cookies are small text files that are stored on your device when you visit our website. 
              They help us provide you with a better experience by remembering your preferences and actions.
            </p>
          </CardContent>
        </Card>

        {/* How We Use Cookies Section */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">How We Use Cookies</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We use cookies to enhance your browsing experience, analyze site traffic, 
              and understand where our visitors are coming from.
            </p>
          </CardContent>
        </Card>

        {/* Your Choices Section */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Your Choices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You can choose to accept or decline cookies. Most web browsers automatically accept cookies, 
              but you can usually modify your browser settings to decline cookies if you prefer.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 