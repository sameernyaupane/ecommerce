// src/routes/signup.tsx
import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import type { ActionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import { signup } from "@/controllers/auth"; // Assuming you have this defined
import { signupSchema } from "@/schemas/signupSchema"; // Import the schema
import { Button } from "@/components/ui/button"; // ShadCN Button
import { Input } from "@/components/ui/input"; // ShadCN Input
import { Label } from "@/components/ui/label"; // ShadCN Label

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: signupSchema });

  if (submission.status !== 'success') {
    return json(submission.reply());
  }

  const { name, email, password } = submission.value;

  try {
    // Call backend service to sign up the user
    await signup({ name, email, password });

    return redirect("/login");
  } catch (error) {
    console.error(error);
    return json({ error: "Signup failed, please try again." }, { status: 500 });
  }
}

const Signup: React.FC = () => {
  const lastResult = useActionData<typeof action>();
  
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
