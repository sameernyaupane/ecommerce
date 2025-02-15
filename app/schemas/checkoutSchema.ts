import { z } from "zod";

export const checkoutSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  address: z.string().min(1, { message: "Address is required" }),
  city: z.string().min(1, { message: "City is required" }),
  postcode: z.string().min(1, { message: "Postcode is required" }),
  country: z.string().min(1, { message: "Country is required" }),
  paymentMethod: z.enum([ 
    'cash_on_delivery',
    'amazon-pay',
    'google-pay',
    'square',
    'paypal'
  ]),
  notes: z.string().optional(),
  saveAddress: z.boolean().optional().default(false),
  selectedAddressId: z.string().optional(),
}); 