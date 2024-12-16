import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { requestPasswordResetSchema } from "@/schemas/passwordResetSchema";
import { UserModel } from "@/models/UserModel";
import { generatePasswordResetToken } from "@/utils/passwordReset";
import { queueEmail, getPasswordResetEmail } from "@/utils/email";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: requestPasswordResetSchema });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const { email } = submission.value;
  const user = await UserModel.findByEmail(email);

  // Always return success even if email doesn't exist (security best practice)
  if (!user) {
    return json({ success: true });
  }

  const token = await generatePasswordResetToken(email);
  const emailContent = getPasswordResetEmail(email, token);
  
  await queueEmail({
    to: email,
    subject: emailContent.subject,
    html: emailContent.html,
  });

  return json({ success: true });
}

export default function ForgotPassword() {
  const lastResult = useActionData<typeof action>();
  
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: requestPasswordResetSchema });
    },
    shouldValidate: "onSubmit",
  });

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>
      
      {lastResult?.success ? (
        <div className="bg-green-50 p-4 rounded-md mb-4">
          <p className="text-green-800">
            If an account exists with that email, we've sent password reset instructions.
          </p>
        </div>
      ) : (
        <Form method="post" {...getFormProps(form)}>
          <div className="mb-4">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              {...getInputProps(fields.email, { type: "email" })}
              placeholder="Enter your email"
            />
            {fields.email.errors && (
              <div className="text-red-500">{fields.email.errors}</div>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={lastResult?.isSubmitting}
          >
            {lastResult?.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Reset Instructions"
            )}
          </Button>
        </Form>
      )}
    </div>
  );
}
