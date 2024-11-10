import { Button } from "@/components/ui/button";

interface GoogleAuthButtonProps {
  mode: "login" | "signup";
  redirectTo?: string | null;
}

export function GoogleAuthButton({ mode, redirectTo }: GoogleAuthButtonProps) {
  console.log("GoogleAuthButton redirectTo:", redirectTo);
  const searchParams = new URLSearchParams();
  if (redirectTo) {
    searchParams.set('redirectTo', redirectTo);
  }

  const finalUrl = `/auth/google?${searchParams.toString()}`;
  console.log("GoogleAuthButton final URL:", finalUrl);

  return (
    <form action={finalUrl} method="get">
      <Button 
        type="submit"
        variant="outline"
        className="w-full flex items-center justify-center gap-2"
      >
        <img 
          src="/images/google-icon.svg" 
          alt="Google" 
          className="w-5 h-5"
        />
        {mode === "login" ? "Log in with Google" : "Sign up with Google"}
      </Button>
    </form>
  );
} 