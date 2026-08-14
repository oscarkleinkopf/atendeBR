import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md bg-teal-900/8 px-2 py-0.5 text-xs font-medium text-teal-900",
        className,
      )}
    >
      {children}
    </span>
  );
}
