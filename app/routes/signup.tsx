// app/routes/signup.tsx
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"; // Import the correct type
import { json, redirect } from "@remix-run/node"; // Import necessary functions
import { Form, useActionData } from "@remix-run/react"; // Import React components for the form
import { signup } from "@/controllers/auth"; // Your signup function
import { signupSchema } from "@/schemas/signupSchema"; // Your validation schema
import { getFormProps, getInputProps, useForm } from '@conform-to/react'; // Conform library
import { parseWithZod } from '@conform-to/zod'; // Zod parser
import { Button } from "@/components/ui/button"; // ShadCN Button
import { Input } from "@/components/ui/input"; // ShadCN Input
import { Label } from "@/components/ui/label"; // ShadCN Label
import { getUserFromSession } from "@/sessions";

// Define the action function
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: signupSchema });

  if (submission.status !== 'success') {
    return json(submission.reply());
  }

  const { name, email, password } = submission.value;

  try {
    // Call your backend service to sign up the user
    return await signup({ name, email, password });
  } catch (error) {
    console.error(error);
    return json({ error: "Signup failed, please try again." }, { status: 500 });
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  // Check if user is already logged in
  const user = await getUserFromSession(request);
  if (user) {
    // Redirect to home page if already authenticated
    return redirect("/");
  }
  return json({});
}

// Define the Signup component
const Signup: React.FC = () => {
  const lastResult = useActionData();

  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: signupSchema });
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
  });

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      <Form method="post" id={form.id} onSubmit={form.onSubmit} noValidate>
        <div className="mb-4">
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            {...getInputProps(fields.name, { required: true })} // Pass the field and options
            placeholder="Your Name"
          />
          {fields.name.errors && <div className="text-red-500">{fields.name.errors}</div>}
        </div>
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
        <Button type="submit" className="w-full">Sign Up</Button>
      </Form>
    </div>
  );
};

export default Signup;
