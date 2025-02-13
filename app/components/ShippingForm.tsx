import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { countries } from "@/lib/countries";

interface ShippingFormProps {
  addresses: any[];
  fields: any;
  formValues: any;
  setFormValues: (values: any) => void;
  selectedAddressId: string;
  setSelectedAddressId: (id: string) => void;
}

export function ShippingForm({
  addresses,
  fields,
  formValues,
  setFormValues,
  selectedAddressId,
  setSelectedAddressId
}: ShippingFormProps) {
  return (
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
                    setFormValues({
                      firstName: selected.first_name,
                      lastName: selected.last_name,
                      email: selected.email,
                      address: selected.address,
                      city: selected.city,
                      postcode: selected.postcode
                    });
                  }
                } else {
                  setFormValues({
                    firstName: '',
                    lastName: '',
                    email: '',
                    address: '',
                    city: '',
                    postcode: ''
                  });
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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              {...getInputProps(fields.firstName, { type: "text" })}
              placeholder="John"
              value={formValues.firstName}
              onChange={(e) => setFormValues(prev => ({ ...prev, firstName: e.target.value }))}
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
              value={formValues.lastName}
              onChange={(e) => setFormValues(prev => ({ ...prev, lastName: e.target.value }))}
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
            value={formValues.email}
            onChange={(e) => setFormValues(prev => ({ ...prev, email: e.target.value }))}
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
            value={formValues.address}
            onChange={(e) => setFormValues(prev => ({ ...prev, address: e.target.value }))}
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
              value={formValues.city}
              onChange={(e) => setFormValues(prev => ({ ...prev, city: e.target.value }))}
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
              value={formValues.postcode}
              onChange={(e) => setFormValues(prev => ({ ...prev, postcode: e.target.value }))}
            />
            {fields.postcode.errors && (
              <div className="text-red-500 text-sm">{fields.postcode.errors}</div>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Select
            {...getInputProps(fields.country, { type: "select" })}
            value={formValues.country}
            onValueChange={(value) => setFormValues(prev => ({ ...prev, country: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fields.country.errors && (
            <div className="text-red-500 text-sm">{fields.country.errors}</div>
          )}
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
      </CardContent>
    </Card>
  );
} 