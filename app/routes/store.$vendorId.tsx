import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { VendorModel } from "@/models/VendorModel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@remix-run/react";
import { MapPin, Globe, Phone, Mail, Facebook, Instagram, Twitter, Youtube, Linkedin, Pinterest } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { sanitizeHtml } from "@/lib/sanitize";
import { ProductModel } from "@/models/ProductModel";
import { ProductActions } from "@/components/ProductActions";

export async function loader({ params }: LoaderFunctionArgs) {
  const vendorId = parseInt(params.vendorId as string);
  const vendor = await VendorModel.findById(vendorId);
  
  if (!vendor) {
    throw new Response("Vendor not found", { status: 404 });
  }

  const products = await ProductModel.getPaginated({
    page: 1,
    limit: 100, // Adjust as needed
    sort: 'created_at',
    direction: 'desc',
    vendorId: vendor.user_id  // Use user_id instead of vendor.id
  });

  return json({ vendor, products: products.products });
}

export default function StoreRoute() {
  const { vendor, products } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen">
      {/* Store Banner */}
      <div className="relative h-[300px] w-full">
        {vendor.banner_type === 'video' && vendor.banner_video ? (
          <video
            src={vendor.banner_video}
            autoPlay
            muted
            loop
            className="w-full h-full object-cover"
          />
        ) : vendor.store_banner_url ? (
          <img
            src={vendor.store_banner_url}
            alt={`${vendor.brand_name} banner`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-pink-100 to-purple-100" />
        )}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <div className={`text-center ${vendor.store_name_position || 'center'}`}>
            <h1 className="text-4xl font-bold text-white">{vendor.brand_name}</h1>
            {vendor.gravatar_url && (
              <img
                src={vendor.gravatar_url}
                alt={vendor.brand_name}
                className="w-20 h-20 rounded-full mx-auto mt-4 border-2 border-white"
              />
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Store Info */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>About Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {vendor.show_description && (
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: sanitizeHtml(vendor.product_description) 
                  }}
                />
              )}

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vendor.show_address && vendor.address_line1 && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>
                      {vendor.address_line1}
                      {vendor.address_line2 && <>, {vendor.address_line2}</>}
                      {vendor.city && <>, {vendor.city}</>}
                      {vendor.state && <>, {vendor.state}</>}
                      {vendor.postal_code && <> {vendor.postal_code}</>}
                    </span>
                  </div>
                )}

                {vendor.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <a href={vendor.website} target="_blank" rel="noopener noreferrer" 
                       className="text-primary hover:underline">
                      Visit Website
                    </a>
                  </div>
                )}

                {vendor.show_phone && vendor.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{vendor.phone}</span>
                  </div>
                )}

                {vendor.show_email && vendor.store_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <a href={`mailto:${vendor.store_email}`} 
                       className="text-primary hover:underline">
                      {vendor.store_email}
                    </a>
                  </div>
                )}
              </div>

              {/* Social Links */}
              {(vendor.social_facebook || vendor.social_instagram || vendor.social_twitter || 
                vendor.social_youtube || vendor.social_pinterest || vendor.social_linkedin) && (
                <>
                  <Separator />
                  <div className="flex gap-4">
                    {vendor.social_facebook && (
                      <a href={vendor.social_facebook} target="_blank" rel="noopener noreferrer"
                         className="text-gray-500 hover:text-primary">
                        <Facebook className="h-5 w-5" />
                      </a>
                    )}
                    {vendor.social_instagram && (
                      <a href={vendor.social_instagram} target="_blank" rel="noopener noreferrer"
                         className="text-gray-500 hover:text-primary">
                        <Instagram className="h-5 w-5" />
                      </a>
                    )}
                    {vendor.social_twitter && (
                      <a href={vendor.social_twitter} target="_blank" rel="noopener noreferrer"
                         className="text-gray-500 hover:text-primary">
                        <Twitter className="h-5 w-5" />
                      </a>
                    )}
                    {vendor.social_youtube && (
                      <a href={vendor.social_youtube} target="_blank" rel="noopener noreferrer"
                         className="text-gray-500 hover:text-primary">
                        <Youtube className="h-5 w-5" />
                      </a>
                    )}
                    {vendor.social_pinterest && (
                      <a href={vendor.social_pinterest} target="_blank" rel="noopener noreferrer"
                         className="text-gray-500 hover:text-primary">
                        <Pinterest className="h-5 w-5" />
                      </a>
                    )}
                    {vendor.social_linkedin && (
                      <a href={vendor.social_linkedin} target="_blank" rel="noopener noreferrer"
                         className="text-gray-500 hover:text-primary">
                        <Linkedin className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </>
              )}

              {/* Business Hours */}
              {vendor.business_hours && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Business Hours</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(vendor.business_hours).map(([day, hours]) => (
                        <div key={day} className="flex justify-between">
                          <span className="font-medium">{day}:</span>
                          <span>{hours}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Policies */}
          {vendor.show_policy && (
            <div className="grid gap-6 md:grid-cols-2">
              {vendor.shipping_policy && (
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Policy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="text-gray-600"
                      dangerouslySetInnerHTML={{ 
                        __html: sanitizeHtml(vendor.shipping_policy) 
                      }}
                    />
                  </CardContent>
                </Card>
              )}
              
              {vendor.return_policy && (
                <Card>
                  <CardHeader>
                    <CardTitle>Return Policy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="text-gray-600"
                      dangerouslySetInnerHTML={{ 
                        __html: sanitizeHtml(vendor.return_policy) 
                      }}
                    />
                  </CardContent>
                </Card>
              )}

              {vendor.cancellation_policy && (
                <Card>
                  <CardHeader>
                    <CardTitle>Cancellation Policy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="text-gray-600"
                      dangerouslySetInnerHTML={{ 
                        __html: sanitizeHtml(vendor.cancellation_policy) 
                      }}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Products Grid */}
          <div className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle>Our Products</CardTitle>
                <CardDescription>Browse our collection of beauty products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <div key={product.id} className="group relative">
                      <div className="block">
                        {product.gallery_images?.[0] && (
                          <div className="aspect-square mb-3 overflow-hidden rounded-lg relative">
                            <Link
                              to={`/product/${product.id}`}
                              className="block"
                            >
                              <img
                                src={`/uploads/products/${product.gallery_images[0].image_name}`}
                                alt={product.name}
                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />
                            </Link>
                            <ProductActions 
                              productId={product.id}
                              className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 opacity-0 transition-all group-hover:opacity-100"
                            />
                          </div>
                        )}
                        <Link
                          to={`/product/${product.id}`}
                          className="block"
                        >
                          <h3 className="font-medium group-hover:text-primary">
                            {product.name}
                          </h3>
                          <p className="text-muted-foreground">
                            ${product.price}
                          </p>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {products.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      No products available from this vendor yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 