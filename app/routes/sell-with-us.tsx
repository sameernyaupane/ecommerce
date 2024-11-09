import { json } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Globe2, ShieldCheck, LayoutDashboard, Smartphone, Gift, HelpCircle } from "lucide-react";

export default function SellWithUs() {
  return (
    <div>
      {/* Banner Image */}
      <div className="relative h-[300px] w-full">
        <img
          src="/images/sell-with-us-banner.avif"
          alt="Sell with us banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold tracking-tight text-white">Sell With Us</h1>
            <p className="text-xl text-white">Join our community of independent beauty brands</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-16">
          {/* Key Benefits */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <Badge className="w-fit mb-4">Limited Time Offer</Badge>
              <CardTitle className="text-3xl">Become a Vendor</CardTitle>
              <CardDescription className="text-lg">
                Free listing and complete vendor setup support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-semibold">Your Own Online Store</h3>
                  <p className="text-muted-foreground">
                    Get your own customizable shop to showcase products securely
                  </p>
                </div>
                <div className="space-y-4">
                  <Gift className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-semibold">Hassle-Free Setup</h3>
                  <p className="text-muted-foreground">
                    Full setup assistance from our dedicated support team
                  </p>
                  <p className="text-sm font-medium text-primary">
                    ⏳ Limited-Time: Free store setup included!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <ShieldCheck className="h-6 w-6" />,
                title: "Secure Payments",
                description: "Trusted payment processing via Square and PayPal"
              },
              {
                icon: <LayoutDashboard className="h-6 w-6" />,
                title: "Seller Dashboard",
                description: "Comprehensive tools for order and inventory management"
              },
              {
                icon: <Globe2 className="h-6 w-6" />,
                title: "Global Reach",
                description: "Connect with customers worldwide from our UK platform"
              },
              {
                icon: <HelpCircle className="h-6 w-6" />,
                title: "Help Centre",
                description: "Dedicated support and guidance for vendors"
              },
              {
                icon: <Gift className="h-6 w-6" />,
                title: "Product Features",
                description: "Customizable variations and gift wrapping options"
              },
              {
                icon: <Smartphone className="h-6 w-6" />,
                title: "Mobile-Friendly",
                description: "Manage your store on any device, anywhere"
              }
            ].map((feature, index) => (
              <Card key={index} className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="p-2 w-fit rounded-lg bg-primary/10 text-primary">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Getting Started */}
          <Card className="border-none shadow-lg bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-2xl">Get Started Today</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Four simple steps to launch your store
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                {
                  step: "1",
                  title: "Register",
                  description: "Create your account at staging11.indibe.net"
                },
                {
                  step: "2",
                  title: "Verify",
                  description: "Confirm your email and complete your profile"
                },
                {
                  step: "3",
                  title: "Customize",
                  description: "Set up your store with logos and branding"
                },
                {
                  step: "4",
                  title: "Launch",
                  description: "Add products and start selling"
                }
              ].map((step, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary-foreground/20 text-sm font-medium">
                    {step.step}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-semibold">{step.title}</h4>
                    <p className="text-primary-foreground/80">{step.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  question: "Who Can Sell on INDIBE?",
                  answer: "Small beauty brands and their representatives are welcome to sell beauty products."
                },
                {
                  question: "What Can I Sell?",
                  answer: "Personal and beauty care products exclusively designed by small businesses."
                }
              ].map((faq, index) => (
                <Card key={index} className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                    <CardDescription>{faq.answer}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center space-y-6">
            <Button size="lg" className="px-8">
              Start Selling Today
            </Button>
            <p className="text-muted-foreground">
              Need help? Contact us at{" "}
              <a href="mailto:vendorsupport@indibe.net" className="text-primary hover:underline">
                vendorsupport@indibe.net
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 