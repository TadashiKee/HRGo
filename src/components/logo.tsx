
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-end gap-0.5">
        <span className="h-5 w-3.5 rounded-t-full bg-primary" />
        <span className="h-7 w-3.5 rounded-t-full bg-accent" />
        <span className="h-3 w-3.5 rounded-t-full bg-primary/70" />
      </div>
      <h1 className="text-xl font-headline font-semibold tracking-tight">HRGo</h1>
    </div>
  );
}
