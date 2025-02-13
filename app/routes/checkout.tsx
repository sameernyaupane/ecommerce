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
import { Loader2, Banknote, CreditCard } from "lucide-react";
import { OrderModel } from "@/models/OrderModel";
import { getUserFromSession } from "@/sessions";
import { CartModel } from "@/models/CartModel";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ShippingAddressModel } from "@/models/ShippingAddressModel";
import { requireAuth } from "@/controllers/auth";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { ShippingForm } from "@/components/ShippingForm";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAuth(request);
  
  if (!user) {
    return redirect('/login?redirectTo=/checkout');
  }

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

    // If using saved address and save address is checked, update the address
    let shippingDetails;
    if (selectedAddressId && saveAddress) {
      await ShippingAddressModel.update(selectedAddressId, {
        firstName,
        lastName,
        email,
        address,
        city,
        postcode
      });
    }

    // Create shipping details object
    shippingDetails = {
      firstName,
      lastName,
      email,
      address,
      city,
      postcode,
    };

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
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: checkoutSchema });
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
  });

  // Add new state to track form field values
  const [formValues, setFormValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    postcode: '',
    country: ''
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
            <ShippingForm
              addresses={addresses}
              fields={fields}
              formValues={formValues}
              setFormValues={setFormValues}
              selectedAddressId={selectedAddressId}
              setSelectedAddressId={setSelectedAddressId}
            />

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
                  onValueChange={(value) => {
                    setSelectedPayment(value);
                    // Update the form field value
                    const input = document.querySelector(`input[name="${fields.paymentMethod.name}"]`) as HTMLInputElement;
                    if (input) {
                      input.value = value;
                      input.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                  }}
                  value={fields.paymentMethod.value || selectedPayment || ""}
                >
                  <div className="relative">
                    <RadioGroupItem
                      value="cash_on_delivery"
                      id="cash_on_delivery"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="cash_on_delivery"
                      className="cursor-pointer flex flex-col items-center justify-between rounded-md border-2 border-input bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-[&[data-state=checked]]:border-primary"
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
                          <div className="rounded-full border-2 border-input p-1">
                            <div className={`h-2 w-2 rounded-full ${selectedPayment === 'cash_on_delivery' ? 'bg-primary' : ''}`} />
                          </div>
                        </div>
                      </div>
                    </Label>
                  </div>

                  <div className="relative">
                    <RadioGroupItem
                      value="paypal"
                      id="paypal"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="paypal"
                      className="cursor-pointer flex flex-col items-center justify-between rounded-md border-2 border-input bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-[&[data-state=checked]]:border-primary"
                    >
                      <div className="flex w-full items-center justify-between space-x-4">
                        <div className="flex items-center space-x-2">
                          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.067 8.478c.492.315.844.825.983 1.47.545 2.537.357 4.359-1.053 5.84-1.41 1.482-3.937 2.083-7.583 1.83-.523-.036-1.121.143-1.606.465-1.01.669-1.765 1.841-2.703 3.577L7.777 22H5.937L9.94 8.908c.117-.38.475-.643.875-.643h4.533c.147 0 .295.015.44.044.908.183 1.362.373 1.707.574 1.347.75 2.038 1.94 2.572 3.021v-3.426zM7.26 3.926C8.096 2.444 10.723 2 14.47 2c.514 0 1.112.15 1.597.472 1.01.669 1.765 1.841 2.703 3.577L19.097 6.4h1.84l-4.003 13.092a1.03 1.03 0 01-.875.643h-4.533a1.03 1.03 0 01-.44-.044c-2.537-.545-4.359-.357-5.84 1.053-1.482 1.41-2.083 3.937-1.83 7.583.036.523-.143 1.121-.465 1.606-.669 1.01-1.841 1.765-3.577 2.703L2 22.223V20.063l13.092-4.003c.38-.117.643-.475.643-.875v-4.533a1.03 1.03 0 00-.044-.44c-.183-.908-.373-1.362-.574-1.707-.75-1.347-1.94-2.038-3.021-2.572h3.426z"/>
                          </svg>
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">
                              PayPal
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Pay securely with PayPal
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="rounded-full border-2 border-input p-1">
                            <div className={`h-2 w-2 rounded-full ${selectedPayment === 'paypal' ? 'bg-primary' : ''}`} />
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

            {/* Add general form error display */}
            {form.error && (
              <div className="text-red-500 text-sm mt-4 p-3 rounded bg-red-50">
                {form.error}
              </div>
            )}

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