// app/routes/signup.tsx
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"; // Import the correct type
import { json, redirect } from "@remix-run/node"; // Import necessary functions
import { Form, useActionData, Link, useNavigation } from "@remix-run/react"; // Import React components for the form
import { signup } from "@/controllers/auth"; // Your signup function
import { signupSchema } from "@/schemas/signupSchema"; // Your validation schema
import { getFormProps, getInputProps, useForm } from '@conform-to/react'; // Conform library
import { parseWithZod } from '@conform-to/zod'; // Zod parser
import { Button } from "@/components/ui/button"; // ShadCN Button
import { Input } from "@/components/ui/input"; // ShadCN Input
import { Label } from "@/components/ui/label"; // ShadCN Label
import { getUserFromSession } from "@/sessions";
import { GoogleAuthButton } from "@/components/GoogleAuthButton";
import { Loader2 } from "lucide-react";

// Define the action function
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: signupSchema });

  if (submission.status !== 'success') {
    return json(submission.reply());
  }

  const { name, email, password, acceptTerms } = submission.value;

  if (!acceptTerms) {
    return json(
      { error: "You must accept the terms and conditions" },
      { status: 400 }
    );
  }

  try {
    return await signup({ name, email, password });
  } catch (error: any) {
    console.error(error);
    return json(
      { error: error.message || "Signup failed, please try again." },
      { status: error.status || 500 }
    );
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
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: signupSchema });
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
  });

  return (
    <div className="max-w-md mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Create an Account</h1>
      
      {/* Google Auth Section */}
      <div className="mb-6">
        <GoogleAuthButton mode="signup" />
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with email
            </span>
          </div>
        </div>
      </div>

      <Form method="post" id={form.id} onSubmit={form.onSubmit} noValidate>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              type="text"
              {...getInputProps(fields.name, { required: true })}
              placeholder="Your Name"
              className="mt-1"
            />
            {fields.name.errors && (
              <div className="text-red-500 text-sm mt-1">{fields.name.errors}</div>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              {...getInputProps(fields.email, { required: true })}
              placeholder="your.email@example.com"
              className="mt-1"
            />
            {fields.email.errors && (
              <div className="text-red-500 text-sm mt-1">{fields.email.errors}</div>
            )}
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              {...getInputProps(fields.password, { required: true })}
              placeholder="••••••••"
              className="mt-1"
            />
            {fields.password.errors && (
              <div className="text-red-500 text-sm mt-1">{fields.password.errors}</div>
            )}
          </div>

          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              {...getInputProps(fields.acceptTerms, { type: "checkbox" })}
              className="mt-1"
            />
            <Label htmlFor="acceptTerms" className="text-sm leading-none">
              I agree to the{" "}
              <Link to="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </Label>
          </div>
          {fields.acceptTerms.errors && (
            <div className="text-red-500 text-sm">{fields.acceptTerms.errors}</div>
          )}
        </div>

        {lastResult?.error && (
          <div className="mt-4 p-3 rounded bg-red-50 text-red-700 text-sm">
            {lastResult.error}
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full mt-6" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </p>
      </Form>
    </div>
  );
};

export default Signup;
