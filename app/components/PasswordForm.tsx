import { useForm, getInputProps, getFormProps } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { changePasswordSchema, setPasswordSchema } from "@/schemas/passwordSchema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PasswordFormProps {
  user: {
    google_id?: string | null;
    has_password: boolean;
    email: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PasswordForm({ user, onSuccess, onCancel }: PasswordFormProps) {
  const passwordFetcher = useFetcher();
  const { toast } = useToast();
  const [showSetupForm, setShowSetupForm] = useState(false);

  console.log('User state:', {
    hasPassword: !!user.has_password,
    hasGoogleId: !!user.google_id,
    shouldShowCurrentPassword: user.has_password && !user.google_id
  });

  const [form, fields] = useForm({
    id: "password-form",
    defaultValue: user.has_password && !user.google_id
      ? {
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }
      : {
          newPassword: "",
          confirmPassword: "",
        },
    lastResult: passwordFetcher.data,
    onValidate({ formData }) {
      return parseWithZod(formData, { 
        schema: user.has_password && !user.google_id ? changePasswordSchema : setPasswordSchema
      });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  // Handle form submission result - match UserForm's approach
  useEffect(() => {
    if (passwordFetcher.data?.success) {
      toast({
        variant: "success",
        description: passwordFetcher.data.message,
      });
      onSuccess?.();
    } else if (passwordFetcher.data?.error) {
      // Only show toast for non-field errors
      if (typeof passwordFetcher.data.error === 'string') {
        toast({
          variant: "destructive",
          description: passwordFetcher.data.error,
        });
      }
    }
  }, [passwordFetcher.data, toast, onSuccess]);

  // Render the initial Google sign-in message
  if (user.google_id && !user.has_password && !showSetupForm) {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 text-blue-700 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
            >
              <path
                fill="#FFC107"
                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
              />
              <path
                fill="#FF3D00"
                d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
              />
              <path
                fill="#4CAF50"
                d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
              />
              <path
                fill="#1976D2"
                d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
              />
            </svg>
            <p className="font-medium">You're signed in with Google</p>
          </div>
          <p className="text-sm">
            You don't need a password to access your account since you're using Google Sign-In. 
            However, you can set up a password if you'd like to also be able to sign in with your email address.
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() => setShowSetupForm(true)}
          >
            <Mail className="h-4 w-4" />
            Set Up Email Password
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
            >
              Maybe Later
            </Button>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          Having both a password and Google Sign-In gives you flexibility in how you access your account.
        </p>
      </div>
    );
  }

  console.log('Rendering password form with conditions:', {
    hasPassword: !!user.has_password,
    hasGoogleId: !!user.google_id,
    shouldShowCurrentPassword: user.has_password && !user.google_id,
    fields: Object.keys(fields)
  });

  // Render the password form
  return (
    <div className="space-y-4">
      <passwordFetcher.Form
        method="post"
        action="/dashboard/password"
        {...getFormProps(form)}
        className="space-y-4"
      >
        {user.has_password && !user.google_id && (
          <div>
            <Label htmlFor={fields.currentPassword.id}>
              Current Password
            </Label>
            <Input
              {...getInputProps(fields.currentPassword, { type: "password" })}
              placeholder="Enter current password"
              autoComplete="current-password"
            />
            {fields.currentPassword.errors && (
              <p className="text-red-500 text-sm mt-1">{fields.currentPassword.errors}</p>
            )}
          </div>
        )}

        <div>
          <Label htmlFor={fields.newPassword.id}>
            {user.has_password ? "New Password" : "Password"}
          </Label>
          <Input
            {...getInputProps(fields.newPassword, { type: "password" })}
            placeholder={user.has_password ? "Enter new password" : "Enter password"}
            autoComplete="new-password"
          />
          {fields.newPassword.errors && (
            <p className="text-red-500 text-sm mt-1">{fields.newPassword.errors}</p>
          )}
        </div>

        <div>
          <Label htmlFor={fields.confirmPassword.id}>
            Confirm Password
          </Label>
          <Input
            {...getInputProps(fields.confirmPassword, { type: "password" })}
            placeholder="Confirm password"
            autoComplete="new-password"
          />
          {fields.confirmPassword.errors && (
            <p className="text-red-500 text-sm mt-1">{fields.confirmPassword.errors}</p>
          )}
        </div>

        {/* Match UserForm's error display approach */}
        {passwordFetcher.data?.fieldErrors && Object.entries(passwordFetcher.data.fieldErrors).map(([field, errors]) => (
          <p key={field} className="text-red-500 text-sm">{errors}</p>
        ))}
        {passwordFetcher.data?.formErrors?.length > 0 && (
          <div className="text-red-500 text-sm">
            {passwordFetcher.data.formErrors.map((error, index) => (
              <p key={index}>{error}</p>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={passwordFetcher.state !== "idle"}
          >
            {passwordFetcher.state !== "idle" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {user.has_password ? "Updating..." : "Setting up..."}
              </>
            ) : (
              user.has_password ? "Update Password" : "Set Password"
            )}
          </Button>
          {(onCancel || showSetupForm) && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (showSetupForm) {
                  setShowSetupForm(false);
                } else {
                  onCancel?.();
                }
              }}
            >
              Cancel
            </Button>
          )}
        </div>

        {user.google_id && (
          <p className="text-sm text-muted-foreground mt-4">
            Having both a password and Google Sign-In gives you flexibility in how you access your account.
          </p>
        )}
      </passwordFetcher.Form>
    </div>
  );
} 