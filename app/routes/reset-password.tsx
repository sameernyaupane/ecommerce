import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { resetPasswordSchema } from "@/schemas/passwordResetSchema";
import { UserModel } from "@/models/UserModel";
import { verifyPasswordResetToken } from "@/utils/passwordReset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return redirect("/forgot-password");
  }

  const email = await verifyPasswordResetToken(token);
  
  if (!email) {
    return json({ 
      error: "This password reset link has expired or is invalid." 
    });
  }

  return json({ token });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: resetPasswordSchema });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const { password, token } = submission.value;
  const email = await verifyPasswordResetToken(token);

  if (!email) {
    return json({ 
      error: "This password reset link has expired or is invalid." 
    });
  }

  const user = await UserModel.findByEmail(email);
  if (!user) {
    return json({ error: "User not found." });
  }

  await UserModel.update(user.id, {
    name: user.name,
    email: user.email,
    password,
  });

  return redirect("/login?passwordReset=success");
}

export default function ResetPassword() {
  const loaderData = useLoaderData<typeof loader>();
  const lastResult = useActionData<typeof action>();

  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: resetPasswordSchema });
    },
    shouldValidate: "onSubmit",
  });

  if (loaderData.error) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-800">{loaderData.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
      
      <Form method="post" {...getFormProps(form)}>
        <input type="hidden" name="token" value={loaderData.token} />
        
        <div className="mb-4">
          <Label htmlFor="password">New Password</Label>
          <Input
            type="password"
            {...getInputProps(fields.password, { type: "password" })}
            placeholder="Enter new password"
          />
          {fields.password.errors && (
            <div className="text-red-500">{fields.password.errors}</div>
          )}
        </div>

        {lastResult?.error && (
          <div className="text-red-500 mb-4">{lastResult.error}</div>
        )}
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={lastResult?.isSubmitting}
        >
          {lastResult?.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </Button>
      </Form>
    </div>
  );
}
