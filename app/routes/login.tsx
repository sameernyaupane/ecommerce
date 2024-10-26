// src/routes/login.tsx
import type { ActionFunctionArgs } from "@remix-run/node"; // Import the correct type
import { json, redirect } from "@remix-run/node"; // Import necessary functions
import { Form, useActionData } from "@remix-run/react"; // Import React components for the form
import { login } from "@/controllers/auth"; // Your login function
import { loginSchema } from "@/schemas/loginSchema"; // Your validation schema
import { getFormProps, getInputProps, useForm } from '@conform-to/react'; // Conform library
import { parseWithZod } from '@conform-to/zod'; // Zod parser
import { Button } from "@/components/ui/button"; // ShadCN Button
import { Input } from "@/components/ui/input"; // ShadCN Input
import { Label } from "@/components/ui/label"; // ShadCN Label

// Define the action function
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: loginSchema });

  if (submission.status !== 'success') {
    return json(submission.reply());
  }

  const { email, password } = submission.value;

  try {
    // Call your backend service to log in the user
    return await login({ email, password });

    return redirect("/dashboard"); // Redirect to a protected route after login
  } catch (error) {
    console.error(error);
    return json({ error: "Login failed, please try again." }, { status: 500 });
  }
}

// Define the Login component
const Login: React.FC = () => {
  const lastResult = useActionData();

  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: loginSchema });
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
  });

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Log In</h1>
      <Form method="post" id={form.id} onSubmit={form.onSubmit} noValidate>
        <div className="mb-4">
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            {...getInputProps(fields.email, { required: true })} // Pass the field and options
            placeholder="Your Email"
          />
          {fields.email.errors && <div className="text-red-500">{fields.email.errors}</div>}
        </div>
        <div className="mb-4">
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            {...getInputProps(fields.password, { required: true })} // Pass the field and options
            placeholder="Your Password"
          />
          {fields.password.errors && <div className="text-red-500">{fields.password.errors}</div>}
        </div>
        {lastResult?.error && (
          <p className="text-red-500">{lastResult.error}</p>
        )}
        <Button type="submit" className="w-full">Log In</Button>
      </Form>
    </div>
  );
};

export default Login;
