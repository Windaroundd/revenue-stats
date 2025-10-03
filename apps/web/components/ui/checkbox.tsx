import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/app/lib/utils";

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, ...props }, ref) => {
    return (
      <div className="relative inline-flex">
        <input
          type="checkbox"
          className={cn(
            "peer h-4 w-4 shrink-0 rounded-sm border border-slate-900 shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-50 dark:focus-visible:ring-slate-300 appearance-none bg-white checked:bg-slate-900 checked:border-slate-900 dark:checked:bg-slate-50 dark:checked:border-slate-50",
            className
          )}
          ref={ref}
          onChange={(e) => {
            props.onChange?.(e);
            onCheckedChange?.(e.target.checked);
          }}
          {...props}
        />
        <Check className="pointer-events-none absolute left-0 top-0 h-4 w-4 text-white dark:text-slate-900 opacity-0 peer-checked:opacity-100" />
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
