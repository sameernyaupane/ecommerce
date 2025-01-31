import type { MetaFunction } from "@remix-run/node";
import { VendorModel } from "@/models/VendorModel";
import { useLoaderData } from "@remix-run/react";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@remix-run/react";
import { Separator } from "@/components/ui/separator";
import { sanitizeHtml } from "@/lib/sanitize";

export const meta: MetaFunction = () => {
  return [{ title: "Our Stores" }];
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const vendors = await VendorModel.getAllVendors();
  return json({ vendors });
};

export default function Stores() {
  const { vendors } = useLoaderData<typeof loader>();

  return (
    <div>
      {/* Banner Section */}
      <div className="relative h-[300px] w-full">
        <img
          src="/uploads/vendors/Skincare-superheroes-whole-family-with-carrots-and-tomatoes.jpg"
          alt="Luxury beauty products arranged on marble surface"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold tracking-tight text-white">Our Stores</h1>
            <p className="text-xl text-white">Discover unique beauty brands and their stories</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Introduction Card */}
          <Card className="border-none shadow-lg bg-gradient-to-br from-pink-50 to-purple-50">
            <CardHeader>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Meet Our Beauty Creators
              </CardTitle>
              <CardDescription className="text-lg">
                Each vendor brings their unique perspective to beauty and self-care
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Vendors Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {vendors.map((vendor) => (
              <Card key={vendor.id} className="border-none shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                <CardHeader className="p-0 space-y-4">
                  {vendor.store_banner_url && (
                    <img
                      src={vendor.store_banner_url}
                      alt={`${vendor.brand_name} Banner`}
                      className="w-full aspect-video object-cover"
                      style={{ maxHeight: '200px' }}
                    />
                  )}
                  <CardTitle className="text-xl font-semibold px-6">{vendor.brand_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription 
                    className="line-clamp-3 text-sm text-gray-600"
                    dangerouslySetInnerHTML={{ 
                      __html: sanitizeHtml(vendor.product_description?.substring(0, 150) + '...') 
                    }}
                  />
                  <Separator className="my-4" />
                  <div className="flex justify-between items-center pt-2 gap-2">
                    <div className="flex gap-2">
                      <Button asChild variant="default">
                        <Link to={`/store/${vendor.id}`}>
                          Visit Store
                        </Link>
                      </Button>
                      {vendor.website && (
                        <Button asChild variant="outline" className="hover:bg-primary/5">
                          <Link to={vendor.website} target="_blank" rel="noopener noreferrer">
                            Website
                          </Link>
                        </Button>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{vendor.time_ago}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Section */}
          <Card className="border-none shadow-lg bg-gradient-to-br from-pink-50 to-purple-50 text-center">
            <CardContent className="space-y-6 p-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Join Our Vendor Community
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Are you a beauty creator looking to reach more customers? Join our platform and showcase your products to our community.
              </p>
              <Button asChild size="lg" className="mt-4">
                <Link to="/sell-with-us">Become a Vendor</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 