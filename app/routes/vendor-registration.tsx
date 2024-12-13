import { json } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ActionFunctionArgs } from "@remix-run/node";
import { useActionData, useNavigation } from "@remix-run/react";
import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { vendorRegistrationSchema } from "@/schemas/vendorRegistrationSchema";
import { Loader2 } from "lucide-react";
import { VendorModel } from "@/models/VendorModel";
import { redirect } from "@remix-run/node";
import { UserModel } from "@/models/UserModel";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: vendorRegistrationSchema });

  if (submission.status !== 'success') {
    return json(submission.reply());
  }

  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      brandName,
      website,
      businessType,
      productDescription
    } = submission.value;

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return json(
        { error: "An account with this email already exists." },
        { status: 400 }
      );
    }

    // Create vendor account
    const { user, tempPassword } = await VendorModel.create({
      firstName,
      lastName,
      email,
      phone,
      brandName,
      website,
      businessType,
      productDescription
    });

    // TODO: Send welcome email with temporary password
    console.log('Temporary password:', tempPassword);

    // Redirect to success page
    return redirect('/vendor-registration-success');
  } catch (error: any) {
    console.error(error);
    return json(
      { error: error.message || "Registration failed, please try again." },
      { status: error.status || 500 }
    );
  }
}

export default function VendorRegistration() {
  const lastResult = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: vendorRegistrationSchema });
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
  });

  return (
    <div>
      {/* Banner */}
      <div className="relative h-[300px] w-full">
        <img
          src="/images/vendor-registration.jpg"
          alt="Vendor registration banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-4xl font-bold tracking-tight text-white">Vendor Registration</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Register Your Beauty Brand</CardTitle>
              <CardDescription>
                Complete the form below to start your journey with INDIBE
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form method="post" className="space-y-6" {...getFormProps(form)}>
                {/* Business Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Business Information</h3>
                  
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="brandName">Brand Name *</Label>
                      <Input {...getInputProps(fields.brandName, { type: "text" })} />
                      {fields.brandName.errors && (
                        <p className="text-sm text-red-500">{fields.brandName.errors}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website (if available)</Label>
                      <Input {...getInputProps(fields.website, { type: "url" })} />
                      {fields.website.errors && (
                        <p className="text-sm text-red-500">{fields.website.errors}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessType">Business Type *</Label>
                      <Select {...getInputProps(fields.businessType, { type: "select" })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sole-trader">Sole Trader</SelectItem>
                          <SelectItem value="limited-company">Limited Company</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                        </SelectContent>
                      </Select>
                      {fields.businessType.errors && (
                        <p className="text-sm text-red-500">{fields.businessType.errors}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Contact Information</h3>
                  
                  <div className="grid gap-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input {...getInputProps(fields.firstName, { type: "text" })} />
                        {fields.firstName.errors && (
                          <p className="text-sm text-red-500">{fields.firstName.errors}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input {...getInputProps(fields.lastName, { type: "text" })} />
                        {fields.lastName.errors && (
                          <p className="text-sm text-red-500">{fields.lastName.errors}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input {...getInputProps(fields.email, { type: "email" })} />
                      {fields.email.errors && (
                        <p className="text-sm text-red-500">{fields.email.errors}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input {...getInputProps(fields.phone, { type: "tel" })} />
                      {fields.phone.errors && (
                        <p className="text-sm text-red-500">{fields.phone.errors}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Product Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Product Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="productDescription">Tell us about your products *</Label>
                    <Textarea
                      {...getInputProps(fields.productDescription, { type: "textarea" })}
                      placeholder="Describe your product range, ingredients, and unique selling points"
                      className="h-32"
                    />
                    {fields.productDescription.errors && (
                      <p className="text-sm text-red-500">{fields.productDescription.errors}</p>
                    )}
                  </div>
                </div>

                {lastResult?.error && (
                  <div className="p-3 rounded bg-red-50 text-red-700 text-sm">
                    {lastResult.error}
                  </div>
                )}

                <div className="pt-4">
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Registration"
                    )}
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground text-center">
                  By submitting this form, you agree to our Terms of Service and Privacy Policy
                </p>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 