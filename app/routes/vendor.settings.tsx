import * as React from "react";
import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
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
import { vendorRegistrationSchema } from "@/schemas/vendorRegistrationSchema";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { VendorModel } from "@/models/VendorModel";

export async function loader({ request }: LoaderFunctionArgs) {
  const { vendorDetails, ...user } = await requireVendor(request);
  return json({ vendor: vendorDetails, user });
}

export async function action({ request }: ActionFunctionArgs) {
  const { vendorDetails } = await requireVendor(request);
  
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: vendorRegistrationSchema });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  try {
    const updatedVendor = await VendorModel.update(vendorDetails.id, {
      brand_name: submission.value.brandName,
      website: submission.value.website,
      phone: submission.value.phone,
      product_description: submission.value.productDescription,
    });

    return json(
      { 
        success: true,
        message: "Store settings updated successfully",
        vendor: updatedVendor
      },
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
  const formFetcher = useFetcher();
  const { toast } = useToast();

  const [form, fields] = useForm({
    id: "vendor-form",
    defaultValue: {
      brandName: formFetcher.data?.vendor?.brand_name || vendor.brand_name,
      website: formFetcher.data?.vendor?.website || vendor.website || "",
      phone: formFetcher.data?.vendor?.phone || vendor.phone,
      productDescription: formFetcher.data?.vendor?.product_description || vendor.product_description,
    },
    lastResult: formFetcher.data,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: vendorRegistrationSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  // Handle form submission result
  React.useEffect(() => {
    if (formFetcher.data?.success) {
      toast({
        description: formFetcher.data.message,
      });
    } else if (formFetcher.data?.error) {
      toast({
        variant: "destructive",
        description: formFetcher.data.error,
      });
    }
  }, [formFetcher.data, toast]);

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
            <formFetcher.Form 
              method="post" 
              {...getFormProps(form)}
              className="space-y-6"
              action="/vendor/settings"
            >
              <div className="space-y-2">
                <Label htmlFor={fields.brandName.id}>Brand Name</Label>
                <Input
                  {...getInputProps(fields.brandName, { type: "text" })}
                  placeholder="Enter your brand name"
                />
                {fields.brandName.errors && (
                  <p className="text-red-500 text-sm">{fields.brandName.errors}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={fields.website.id}>Website (Optional)</Label>
                <Input
                  {...getInputProps(fields.website, { type: "url" })}
                  placeholder="Enter your website URL"
                />
                {fields.website.errors && (
                  <p className="text-red-500 text-sm">{fields.website.errors}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={fields.phone.id}>Phone Number</Label>
                <Input
                  {...getInputProps(fields.phone, { type: "tel" })}
                  placeholder="Enter your phone number"
                />
                {fields.phone.errors && (
                  <p className="text-red-500 text-sm">{fields.phone.errors}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={fields.productDescription.id}>Product Description</Label>
                <Textarea
                  {...getInputProps(fields.productDescription, { type: "text" })}
                  placeholder="Describe the types of products you sell"
                  rows={4}
                />
                {fields.productDescription.errors && (
                  <p className="text-red-500 text-sm">{fields.productDescription.errors}</p>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={formFetcher.state !== "idle"}
                >
                  {formFetcher.state !== "idle" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </formFetcher.Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 