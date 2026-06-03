import { Button } from "@/components/ui/Button";
import { AppIcon } from "@/components/ui/AppIcon";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-4 rounded-xl border border-rose-500/30 bg-rose-950/20 px-6 py-12 text-center"
    >
      <span
        className="flex h-14 w-14 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/25"
        aria-hidden="true"
      >
        <AppIcon name="alert" size={28} />
      </span>
      <div>
        <h2 className="text-lg font-semibold text-rose-200">{title}</h2>
        <p className="mt-1 max-w-md text-sm text-rose-100/80">{message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
