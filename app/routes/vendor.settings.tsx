import * as React from "react";
import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useFetcher, Form } from "@remix-run/react";
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
import { vendorRegistrationSchema } from "@/schemas/vendorRegistrationSchema";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { VendorModel } from "@/models/VendorModel";

const vendorSettingsSchema = z.object({
  brandName: z.string().min(1, "Brand name is required"),
  website: z.string().url().optional().or(z.literal("")),
  phone: z.string().min(1, "Phone number is required"),
  productDescription: z.string().min(1, "Product description is required"),
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
  const { toast } = useToast();
  const fetcher = useFetcher();

  const [form, fields] = useForm({
    id: "vendor-settings",
    shouldValidate: "onSubmit",
    defaultValue: {
      brandName: vendor.brand_name,
      website: vendor.website || "",
      phone: vendor.phone,
      productDescription: vendor.product_description,
    },
    onValidate({ formData }) {
      const result = parseWithZod(formData, { schema: vendorSettingsSchema });
      return result;
    },
  });

  React.useEffect(() => {
    if (fetcher.data?.success) {
      toast({
        title: "Success",
        description: fetcher.data.message,
      });
    } else if (fetcher.data?.formErrors) {
      toast({
        variant: "destructive",
        title: "Error",
        description: fetcher.data.formErrors[0],
      });
    }
  }, [fetcher.data, toast]);

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
            <fetcher.Form 
              method="POST"
              {...getFormProps(form)}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label htmlFor="brandName">Brand Name</Label>
                <Input
                  name="brandName"
                  {...getInputProps(fields.brandName, { type: "text" })}
                  placeholder="Enter your brand name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website (Optional)</Label>
                <Input
                  name="website"
                  {...getInputProps(fields.website, { type: "url" })}
                  placeholder="Enter your website URL"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  name="phone"
                  {...getInputProps(fields.phone, { type: "tel" })}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="productDescription">Product Description</Label>
                <Textarea
                  name="productDescription"
                  {...getInputProps(fields.productDescription, { type: "text" })}
                  placeholder="Describe the types of products you sell"
                  rows={4}
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  type="submit"
                  disabled={fetcher.state !== "idle"}
                >
                  {fetcher.state !== "idle" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </fetcher.Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 