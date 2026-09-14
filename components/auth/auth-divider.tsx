export function AuthDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center" aria-hidden>
        <div className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-[13px]">
        <span className="bg-background px-3 text-muted">{label}</span>
      </div>
    </div>
  );
}
