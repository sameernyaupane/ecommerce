// app/routes/login.tsx
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { login } from "@/controllers/auth";
import { loginSchema } from "@/schemas/loginSchema";
import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getUserFromSession } from "@/sessions";
import { GoogleAuthButton } from "@/components/GoogleAuthButton";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";

function isValidRedirectUrl(url: string | null) {
  if (!url) return false;
  try {
    return url.startsWith('/') && !url.startsWith('//');
  } catch {
    return false;
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: loginSchema });
  const redirectTo = formData.get('redirectTo') as string | null;
  const safeRedirectTo = isValidRedirectUrl(redirectTo) ? redirectTo : "/";

  if (submission.status !== 'success') {
    return json(submission.reply());
  }

  const { email, password } = submission.value;

  try {
    return await login({ email, password, redirectTo: safeRedirectTo });
  } catch (error) {
    console.error(error);
    return json({ error: "Login failed, please try again." }, { status: 500 });
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUserFromSession(request);
  
  if (user) {
    const url = new URL(request.url);
    const redirectTo = url.searchParams.get("redirectTo");
    const safeRedirectTo = isValidRedirectUrl(redirectTo) ? redirectTo : "/";
    return redirect(safeRedirectTo);
  }

  return json({});
}

// Define the Login component
const Login: React.FC = () => {
  const lastResult = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

  // Get page name from redirectTo
  const getPageName = (url: string) => {
    return url.split('/').pop()?.charAt(0).toUpperCase() + url.split('/').pop()?.slice(1);
  };

  const pageTitle = redirectTo 
    ? `Login to continue to ${getPageName(redirectTo)}`
    : "Log In";

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
      <h1 className="text-2xl font-bold mb-4">{pageTitle}</h1>
      <div className="mb-6">
        <GoogleAuthButton 
          mode="login" 
          redirectTo={redirectTo || undefined}
        />
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
      </div>
      <Form method="post" id={form.id} onSubmit={form.onSubmit} noValidate>
        <input type="hidden" name="redirectTo" value={redirectTo || ''} />
        <div className="mb-4">
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            {...getInputProps(fields.email, { required: true })}
            placeholder="Your Email"
          />
          {fields.email.errors && <div className="text-red-500">{fields.email.errors}</div>}
        </div>
        <div className="mb-4">
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            {...getInputProps(fields.password, { required: true })}
            placeholder="Your Password"
          />
          {fields.password.errors && <div className="text-red-500">{fields.password.errors}</div>}
        </div>
        {lastResult?.error && (
          <p className="text-red-500">{lastResult.error}</p>
        )}
        <Button 
          type="submit" 
          className="w-full"
          disabled={lastResult?.isSubmitting}
        >
          {lastResult?.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging in...
            </>
          ) : (
            "Log In"
          )}
        </Button>
      </Form>
    </div>
  );
};

export default Login;
