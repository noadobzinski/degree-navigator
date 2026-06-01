import { Button } from "@/components/ui/button";
import { casLoginUrl } from "@/lib/coursetable";

type YaleNetIdButtonProps = {
  variant?: "default" | "outline";
  className?: string;
  label?: string;
};

export function YaleNetIdButton({
  variant = "outline",
  className,
  label = "Sign in with Yale NetID",
}: YaleNetIdButtonProps) {
  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      onClick={() => {
        const redirect = `${window.location.origin}/coursetable/callback`;
        window.location.href = casLoginUrl(redirect);
      }}
    >
      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden>
        <rect width="24" height="24" rx="2" fill="#00356b" />
        <text x="12" y="16" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
          Y
        </text>
      </svg>
      {label}
    </Button>
  );
}
