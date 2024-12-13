import { Link } from "@remix-run/react";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VendorRegistrationSuccess() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <Card className="border-none shadow-lg text-center">
          <CardHeader>
            <div className="flex justify-center mb-6">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Registration Successful!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Thank you for registering as a vendor with INDIBE. We're excited to have you join our community!
              </p>
              
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">
                  We've sent you an email with your temporary password and next steps.
                  Please check your inbox and follow the instructions to complete your account setup.
                </p>
              </div>

              <p className="text-muted-foreground">
                If you don't receive the email within a few minutes, please check your spam folder.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild variant="default">
                <Link to="/vendor-login">
                  Go to Vendor Login
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/">
                  Return to Homepage
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
