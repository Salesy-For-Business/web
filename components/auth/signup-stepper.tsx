import clsx from "clsx";

const steps = [
  { id: 1, label: "Profile" },
  { id: 2, label: "Business" },
] as const;

export function SignupStepper({ current }: { current: 1 | 2 }) {
  return (
    <ol className="mb-8 flex items-center gap-3" aria-label="Sign up progress">
      {steps.map((step, index) => {
        const done = current > step.id;
        const active = current === step.id;
        return (
          <li key={step.id} className="flex flex-1 items-center gap-3">
            <div className="flex items-center gap-2">
              <span
                className={clsx(
                  "flex size-7 items-center justify-center rounded-full text-[13px] font-medium",
                  done || active
                    ? "bg-primary text-white"
                    : "border border-border bg-background text-muted",
                )}
                aria-current={active ? "step" : undefined}
              >
                {step.id}
              </span>
              <span
                className={clsx(
                  "text-[13px] font-medium",
                  active || done ? "text-heading" : "text-muted",
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 ? (
              <div
                className={clsx(
                  "h-px flex-1",
                  done ? "bg-primary" : "bg-border",
                )}
                aria-hidden
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
