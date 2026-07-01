import Link from "next/link";

const NAV = [
  {
    head: "Protocol",
    links: [
      { label: "System", href: "#system" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Tech stack", href: "#stack" },
    ],
  },
  {
    head: "App",
    links: [
      { label: "Console", href: "/app" },
      { label: "Live Explorer", href: "/app/explorer" },
    ],
  },
  {
    head: "Resources",
    links: [{ label: "Documentation", href: "https://github.com/OyenCar/Vindex" }],
  },
];

function Mark() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" fill="none" aria-hidden>
      <rect width="32" height="32" rx="9" fill="url(#fg)" />
      <path d="M9 11.5 L16 22 L23 11.5" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="9.5" r="1.7" fill="white" />
      <defs>
        <linearGradient id="fg" x1="0" y1="0" x2="32" y2="32">
          <stop stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#6D28D9" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="relative mt-12 border-t border-white/[0.06]">
      <div className="mx-auto grid w-full max-w-shell gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <Mark />
            <span className="text-[18px] font-semibold tracking-tight text-text-primary">Vindex</span>
          </div>
          <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-text-secondary">
            A Canton-native escrow and governance protocol for milestone-based work. The ledger is
            the source of truth.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-[12px] text-text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_8px_#10B981]" />
            Built on Canton + Daml
          </span>
        </div>

        {NAV.map((col) => (
          <div key={col.head}>
            <h4 className="text-[12px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
              {col.head}
            </h4>
            <ul className="mt-4 flex flex-col gap-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-[14px] text-text-primary/80 transition-colors hover:text-text-primary"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/[0.06]">
        <div className="mx-auto flex w-full max-w-shell flex-wrap items-center justify-between gap-3 px-5 py-6 text-[12px] text-text-secondary sm:px-8">
          <span>© {new Date().getFullYear()} Vindex. Not an EVM application.</span>
          <span>Canton · Daml · IPFS</span>
        </div>
      </div>
    </footer>
  );
}
