import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PanelProps {
  title?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  bodyClass?: string;
  accent?: boolean;
  children: ReactNode;
}

export function Panel({
  title,
  icon,
  action,
  className,
  bodyClass = "p-4",
  accent,
  children,
}: PanelProps) {
  return (
    <section
      className={cn(
        "relative flex flex-col rounded-md border border-line bg-panel/70",
        className,
      )}
    >
      {accent && <Corners />}
      {title && (
        <header className="flex h-11 shrink-0 items-center justify-between gap-2 border-b border-line px-4">
          <div className="flex min-w-0 items-center gap-2">
            {icon && <span className="text-amber">{icon}</span>}
            <h3 className="truncate text-[13px] font-semibold tracking-wide text-ink">
              {title}
            </h3>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={cn("flex-1", bodyClass)}>{children}</div>
    </section>
  );
}

export function Corners() {
  const base = "pointer-events-none absolute h-2 w-2 border-amber/70";
  return (
    <>
      <span className={cn(base, "left-0 top-0 border-l border-t")} />
      <span className={cn(base, "right-0 top-0 border-r border-t")} />
      <span className={cn(base, "bottom-0 left-0 border-b border-l")} />
      <span className={cn(base, "bottom-0 right-0 border-b border-r")} />
    </>
  );
}
