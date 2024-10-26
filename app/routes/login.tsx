import { Form, useActionData } from "@remix-run/react";
import { ActionFunction, json, redirect } from "@remix-run/node";
import { login } from "@/controllers/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Define the expected data structure for form data
type ActionData = {
  error?: string;
};

// Action function for login form submission
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return json<ActionData>({ error: "Email and password are required" }, { status: 400 });
  }

  try {
    // Call backend service to log the user in
    const user = await login({ email, password });
    return redirect("/dashboard");
  } catch (error) {
    return json<ActionData>({ error: "Login failed, check your credentials." }, { status: 400 });
  }
};

const Login: React.FC = () => {
  const actionData = useActionData<ActionData>();

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <Form method="post" className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input type="email" name="email" id="email" placeholder="Your Email" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input type="password" name="password" id="password" placeholder="Your Password" />
        </div>
        {actionData?.error && (
          <p className="text-red-500">{actionData.error}</p>
        )}
        <Button type="submit">Login</Button>
      </Form>
    </div>
  );
};

export default Login;
