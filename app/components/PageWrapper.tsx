import { cn } from "@/lib/styles";

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-b from-background to-muted",
      className
    )}>
      {children}
    </div>
  );
} 