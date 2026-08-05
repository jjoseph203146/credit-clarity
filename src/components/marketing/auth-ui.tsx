// Presentational pieces shared by the auth forms. Kept separate from
// AuthSplit so client components (e.g. the signup form) can import them
// without pulling the whole brand panel into the client bundle.

/** Primary submit for the auth forms — Solid Navy → Gradient Teal on hover. */
export function AuthSubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="group relative isolate mt-1 overflow-hidden rounded-full bg-navy py-3.5 text-[15px] font-semibold text-white shadow-[0_1px_2px_rgba(11,31,58,.20),0_10px_24px_-8px_rgba(11,31,58,.35)] transition-transform duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <span
        aria-hidden
        className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 group-active:opacity-100 motion-reduce:transition-none"
        style={{ backgroundImage: "var(--grad-teal)" }}
      />
      {children}
    </button>
  );
}

/** Field label — matched across all four auth forms. */
export function AuthLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-[5px] text-[12.5px] font-semibold text-[#3d5068]">{children}</div>;
}

export function AuthError({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-lg bg-[#fbecec] px-3 py-2 text-[13px] font-medium text-[#a33232]">
      {children}
    </div>
  );
}
