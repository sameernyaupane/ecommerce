import * as React from "react";
import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useActionData, useNavigation, Form } from "@remix-run/react";
import { requireVendor } from "@/controllers/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { VendorModel } from "@/models/VendorModel";

const vendorSettingsSchema = z.object({
  brandName: z.string().min(1, { message: "Brand name is required" }),
  website: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  phone: z.string().min(1, { message: "Phone number is required" })
    .regex(/^\+?[\d\s-()]+$/, { message: "Please enter a valid phone number" }),
  productDescription: z.string().min(1, { message: "Product description is required" }),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  storeBannerUrl: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  socialFacebook: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  socialInstagram: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  socialTwitter: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  businessHours: z.record(z.string()).optional(),
  shippingPolicy: z.string().optional(),
  returnPolicy: z.string().optional(),
});

export async function loader({ request }: LoaderFunctionArgs) {
  const { vendorDetails, ...user } = await requireVendor(request);
  return json({ vendor: vendorDetails, user });
}

export async function action({ request }: ActionFunctionArgs) {
  const { vendorDetails } = await requireVendor(request);
  
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: vendorSettingsSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  try {
    const updatedVendor = await VendorModel.update(vendorDetails.id, {
      brand_name: submission.value.brandName,
      website: submission.value.website,
      phone: submission.value.phone,
      product_description: submission.value.productDescription,
      address_line1: submission.value.addressLine1,
      address_line2: submission.value.addressLine2,
      city: submission.value.city,
      state: submission.value.state,
      postal_code: submission.value.postalCode,
      country: submission.value.country,
      store_banner_url: submission.value.storeBannerUrl,
      social_facebook: submission.value.socialFacebook,
      social_instagram: submission.value.socialInstagram,
      social_twitter: submission.value.socialTwitter,
      business_hours: submission.value.businessHours,
      shipping_policy: submission.value.shippingPolicy,
      return_policy: submission.value.returnPolicy,
    });

    return json(
      submission.reply({
        formErrors: [],
        resetForm: false,
      })
    );
  } catch (error: any) {
    return json(
      submission.reply({
        formErrors: [error.message || "Failed to update store settings"]
      }), 
      { status: 400 }
    );
  }
}

export default function VendorSettings() {
  const { vendor } = useLoaderData<typeof loader>();
  const { toast } = useToast();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [form, fields] = useForm({
    id: "vendor-settings",
    lastResult: actionData,
    defaultValue: {
      brandName: vendor.brand_name,
      website: vendor.website || "",
      phone: vendor.phone,
      productDescription: vendor.product_description,
      addressLine1: vendor.address_line1 || "",
      addressLine2: vendor.address_line2 || "",
      city: vendor.city || "",
      state: vendor.state || "",
      postalCode: vendor.postal_code || "",
      country: vendor.country || "",
      storeBannerUrl: vendor.store_banner_url || "",
      socialFacebook: vendor.social_facebook || "",
      socialInstagram: vendor.social_instagram || "",
      socialTwitter: vendor.social_twitter || "",
      businessHours: vendor.business_hours || {},
      shippingPolicy: vendor.shipping_policy || "",
      returnPolicy: vendor.return_policy || "",
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: vendorSettingsSchema });
    },
    shouldValidate: "onInput",
  });

  React.useEffect(() => {
    if (actionData?.status === 'success') {
      toast({
        title: "Success",
        description: "Store settings updated successfully!",
      });
    } else if (actionData?.status === 'error') {
      toast({
        variant: "destructive",
        title: "Error",
        description: actionData.formErrors?.[0] || "Failed to update settings",
      });
    }
  }, [actionData, toast]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Store Settings</h1>
        <p className="text-muted-foreground">
          Manage your store information and preferences
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
            <CardDescription>
              Update your store details and business information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form
              {...getFormProps(form)}
              className="space-y-6"
              method="POST"
            >
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={fields.brandName.id}>Brand Name</Label>
                    <Input {...getInputProps(fields.brandName, { type: "text" })} />
                    {fields.brandName.errors && (
                      <p className="text-sm text-destructive">
                        {fields.brandName.errors[0]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={fields.phone.id}>Phone</Label>
                    <Input {...getInputProps(fields.phone, { type: "tel" })} />
                    {fields.phone.errors && (
                      <p className="text-sm text-destructive">
                        {fields.phone.errors[0]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={fields.productDescription.id}>Product Description</Label>
                    <Textarea {...getInputProps(fields.productDescription, { type: "text" })} rows={4} />
                    {fields.productDescription.errors && (
                      <p className="text-sm text-destructive">
                        {fields.productDescription.errors[0]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={fields.website.id}>Website (Optional)</Label>
                    <Input {...getInputProps(fields.website, { type: "url" })} />
                    {fields.website.errors && (
                      <p className="text-sm text-destructive">
                        {fields.website.errors[0]}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Address Information</h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="addressLine1">Address Line 1</Label>
                    <Input {...getInputProps(fields.addressLine1, { type: "text" })} />
                    {fields.addressLine1.errors && (
                      <p className="text-sm text-destructive">
                        {fields.addressLine1.errors[0]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="addressLine2">Address Line 2</Label>
                    <Input {...getInputProps(fields.addressLine2, { type: "text" })} />
                    {fields.addressLine2.errors && (
                      <p className="text-sm text-destructive">
                        {fields.addressLine2.errors[0]}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input {...getInputProps(fields.city, { type: "text" })} />
                      {fields.city.errors && (
                        <p className="text-sm text-destructive">
                          {fields.city.errors[0]}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input {...getInputProps(fields.state, { type: "text" })} />
                      {fields.state.errors && (
                        <p className="text-sm text-destructive">
                          {fields.state.errors[0]}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input {...getInputProps(fields.postalCode, { type: "text" })} />
                      {fields.postalCode.errors && (
                        <p className="text-sm text-destructive">
                          {fields.postalCode.errors[0]}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input {...getInputProps(fields.country, { type: "text" })} />
                      {fields.country.errors && (
                        <p className="text-sm text-destructive">
                          {fields.country.errors[0]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="storeBannerUrl">Store Banner URL</Label>
                <Input {...getInputProps(fields.storeBannerUrl, { type: "url" })} />
                {fields.storeBannerUrl.errors && (
                  <p className="text-sm text-destructive">
                    {fields.storeBannerUrl.errors[0]}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Social Media</h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="socialFacebook">Facebook</Label>
                    <Input {...getInputProps(fields.socialFacebook, { type: "url" })} />
                    {fields.socialFacebook.errors && (
                      <p className="text-sm text-destructive">
                        {fields.socialFacebook.errors[0]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="socialInstagram">Instagram</Label>
                    <Input {...getInputProps(fields.socialInstagram, { type: "url" })} />
                    {fields.socialInstagram.errors && (
                      <p className="text-sm text-destructive">
                        {fields.socialInstagram.errors[0]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="socialTwitter">Twitter</Label>
                    <Input {...getInputProps(fields.socialTwitter, { type: "url" })} />
                    {fields.socialTwitter.errors && (
                      <p className="text-sm text-destructive">
                        {fields.socialTwitter.errors[0]}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Store Policies</h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shippingPolicy">Shipping Policy</Label>
                    <Textarea {...getInputProps(fields.shippingPolicy, { type: "text" })} rows={4} />
                    {fields.shippingPolicy.errors && (
                      <p className="text-sm text-destructive">
                        {fields.shippingPolicy.errors[0]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="returnPolicy">Return Policy</Label>
                    <Textarea {...getInputProps(fields.returnPolicy, { type: "text" })} rows={4} />
                    {fields.returnPolicy.errors && (
                      <p className="text-sm text-destructive">
                        {fields.returnPolicy.errors[0]}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {form.errors && (
                <p className="text-sm text-destructive">
                  {form.errors[0]}
                </p>
              )}

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={navigation.state === 'submitting'}
                  className="scroll-mt-24"
                >
                  {navigation.state === 'submitting' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 