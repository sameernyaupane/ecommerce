import { useEffect, useState } from "react";
import { useNavigate, Form, useActionData, useNavigation, useLoaderData } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useShoppingState } from "@/hooks/use-shopping-state";
import { formatPrice } from "@/lib/utils";
import { QuantityControls } from "@/components/QuantityControls";
import { json, redirect } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { checkoutSchema } from "@/schemas/checkoutSchema";
import { Loader2, Banknote } from "lucide-react";
import { OrderModel } from "@/models/OrderModel";
import { getUserFromSession } from "@/sessions";
import { CartModel } from "@/models/CartModel";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ShippingAddressModel } from "@/models/ShippingAddressModel";
import { requireAuth } from "@/controllers/auth";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUserFromSession(request);
  if (!user) return { addresses: [] };

  const addresses = await ShippingAddressModel.getByUserId(user.id);
  return { addresses };
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireAuth(request);
  
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: checkoutSchema });

  if (submission.status !== 'success') {
    return json(submission.reply());
  }

  try {
    const { 
      firstName, 
      lastName, 
      email, 
      address, 
      city, 
      postcode, 
      paymentMethod,
      notes,
      saveAddress,
      selectedAddressId
    } = submission.value;

    // Get cart items and calculate totals
    const cartItems = await CartModel.getByUserId(user.id);
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingFee = 10; // You might want to make this dynamic
    const totalAmount = subtotal + shippingFee;

    // If using saved address, get it from the database
    let shippingDetails;
    if (selectedAddressId) {
      const savedAddress = await ShippingAddressModel.getById(selectedAddressId);
      shippingDetails = {
        firstName: savedAddress.first_name,
        lastName: savedAddress.last_name,
        email: savedAddress.email,
        address: savedAddress.address,
        city: savedAddress.city,
        postcode: savedAddress.postcode,
      };
    } else {
      shippingDetails = {
        firstName,
        lastName,
        email,
        address,
        city,
        postcode,
      };
    }

    // Create the order with shipping details
    const order = await OrderModel.create({
      userId: user.id,
      items: cartItems.map(item => ({
        productId: item.product_id,
        quantity: item.quantity,
        price: item.price
      })),
      shippingDetails,
      totalAmount,
      shippingFee,
      paymentMethod,
      notes,
      saveAddress: saveAddress && !selectedAddressId
    });

    return redirect(`/order-confirmation/${order.id}`);
  } catch (error: any) {
    return json(
      { error: error.message || "Order creation failed" },
      { status: error.status || 500 }
    );
  }
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartDetails, updateCartQuantity } = useShoppingState();
  const [isLoading, setIsLoading] = useState(true);
  const lastResult = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const { addresses } = useLoaderData<typeof loader>();
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");

  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: checkoutSchema });
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
  });

  useEffect(() => {
    setIsLoading(false);
  }, [cartDetails]);

  const getItemImage = (item: ProductDetails) => {
    if (!item.main_image?.image_name) {
      return '/images/product-placeholder.jpg';
    }
    return `/uploads/products/${item.main_image.image_name}`;
  };

  const handleQuantityChange = async (productId: number, newQuantity: number) => {
    await updateCartQuantity(productId, newQuantity);
  };

  if (isLoading) {
    return <div className="container max-w-7xl py-8">Loading...</div>;
  }

  if (cartDetails.length === 0) {
    return (
      <div className="container max-w-7xl py-8">
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground mb-4">Add some items to your cart to proceed with checkout.</p>
        <Button onClick={() => navigate('/')}>Continue Shopping</Button>
      </div>
    );
  }

  const subtotal = cartDetails.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 10;
  const total = subtotal + shipping;

  return (
    <div className="container max-w-7xl py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <Form method="post" {...getFormProps(form)}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shipping Information - Left Column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
                <CardDescription>
                  {addresses.length > 0 
                    ? "Select a saved address or enter a new one"
                    : "Enter your shipping details"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {addresses.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="selectedAddress">Select Saved Address</Label>
                    <Select
                      {...getInputProps(fields.selectedAddressId, { type: "select" })}
                      onValueChange={(value) => {
                        setSelectedAddressId(value);
                        if (value !== "new") {
                          const selected = addresses.find(addr => addr.id.toString() === value);
                          if (selected) {
                            // Instead of resetting the form, we can handle the selection differently
                            // For example, you might want to disable the input fields
                            // or populate them with the selected address details
                          }
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a saved address" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">Enter new address</SelectItem>
                        {addresses.map((addr) => (
                          <SelectItem key={addr.id} value={addr.id.toString()}>
                            {addr.first_name} {addr.last_name} - {addr.address}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Show form fields only if no address is selected */}
                {!selectedAddressId || selectedAddressId === "new" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          {...getInputProps(fields.firstName, { type: "text" })}
                          placeholder="John"
                        />
                        {fields.firstName.errors && (
                          <div className="text-red-500 text-sm">{fields.firstName.errors}</div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          {...getInputProps(fields.lastName, { type: "text" })}
                          placeholder="Doe"
                        />
                        {fields.lastName.errors && (
                          <div className="text-red-500 text-sm">{fields.lastName.errors}</div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        {...getInputProps(fields.email, { type: "email" })}
                        placeholder="john@example.com"
                      />
                      {fields.email.errors && (
                        <div className="text-red-500 text-sm">{fields.email.errors}</div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        {...getInputProps(fields.address, { type: "text" })}
                        placeholder="123 Main St"
                      />
                      {fields.address.errors && (
                        <div className="text-red-500 text-sm">{fields.address.errors}</div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          {...getInputProps(fields.city, { type: "text" })}
                          placeholder="New York"
                        />
                        {fields.city.errors && (
                          <div className="text-red-500 text-sm">{fields.city.errors}</div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postcode">Postcode</Label>
                        <Input
                          {...getInputProps(fields.postcode, { type: "text" })}
                          placeholder="10001"
                        />
                        {fields.postcode.errors && (
                          <div className="text-red-500 text-sm">{fields.postcode.errors}</div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          {...getInputProps(fields.saveAddress, { 
                            type: "checkbox",
                            defaultValue: "on"
                          })}
                          id="saveAddress"
                          defaultChecked={true}
                        />
                        <Label htmlFor="saveAddress" className="text-sm">
                          Save this address for future orders
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Saved addresses can be reused for your next purchases, making checkout faster.
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Move Payment Method and Order Notes here */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Select your preferred payment method</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  {...getInputProps(fields.paymentMethod, { type: "radio" })}
                  className="grid grid-cols-1 gap-4"
                  defaultValue="cash_on_delivery"
                >
                  <div>
                    <RadioGroupItem
                      value="cash_on_delivery"
                      id="cash_on_delivery"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="cash_on_delivery"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <div className="flex w-full items-center justify-between space-x-4">
                        <div className="flex items-center space-x-2">
                          <Banknote className="h-5 w-5" />
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">
                              Cash on Delivery
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Pay when you receive
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="rounded-full border-2 border-muted p-1">
                            <div className="h-2 w-2 rounded-full bg-primary peer-data-[state=checked]:bg-primary" />
                          </div>
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
                {fields.paymentMethod.errors && (
                  <div className="text-red-500 text-sm mt-2">{fields.paymentMethod.errors}</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Notes</CardTitle>
                <CardDescription>Add any special instructions for delivery (optional)</CardDescription>
              </CardHeader>
              <CardContent>
                <textarea
                  {...getInputProps(fields.notes, { type: "textarea" })}
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Any special instructions for delivery..."
                />
                {fields.notes.errors && (
                  <div className="text-red-500 text-sm mt-2">{fields.notes.errors}</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary - Right Column */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Review your order</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartDetails.map((item) => (
                  <div key={item.productId} className="flex justify-between items-center py-2">
                    <div className="flex gap-4">
                      <img 
                        src={getItemImage(item)} 
                        alt={item.name}
                        className="h-16 w-16 rounded-lg object-cover" 
                      />
                      <div className="space-y-2">
                        <p className="font-medium">{item.name}</p>
                        <QuantityControls
                          quantity={item.quantity}
                          onQuantityChange={(newQuantity) => handleQuantityChange(item.productId, newQuantity)}
                        />
                      </div>
                    </div>
                    <div className="flex items-center">
                      <p className="text-sm text-muted-foreground w-24 text-right">
                        × {formatPrice(item.price)}
                      </p>
                      <p className="font-medium w-24 text-right">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <div className="w-full space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </Button>
                
                {lastResult?.error && (
                  <div className="mt-4 p-3 rounded bg-red-50 text-red-700 text-sm">
                    {lastResult.error}
                  </div>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </Form>
    </div>
  );
} 