"use client";

import { useState } from "react";
import { Landmark, Hammer, LogOut, Loader2, Wifi, WifiOff, Wallet } from "lucide-react";
import { useDaml } from "@/components/daml/DamlProvider";
import { damlConfig, type Role } from "@/lib/daml/config";
import { Button } from "@/components/ui/button";

const ROLES: { role: Role; label: string; icon: typeof Landmark }[] = [
  { role: "investor", label: "Investor Party", icon: Landmark },
  { role: "worker", label: "Worker", icon: Hammer },
];

function shorten(p: string) {
  return p.length > 22 ? `${p.slice(0, 12)}…${p.slice(-8)}` : p;
}

/** Party authentication + account management (the Canton analog of "connect wallet"). */
export function PartyConnect() {
  const { session, connect, connectLoop, disconnect, connecting, error, online } = useDaml();
  const [role, setRole] = useState<Role>("investor");
  const [party, setParty] = useState(damlConfig.parties.investor);
  const [allocating, setAllocating] = useState(false);
  const [allocError, setAllocError] = useState<string | null>(null);

  if (session) {
    return (
      <div className="brutal-card-flat flex flex-wrap items-center gap-3 p-4">
        <span
          className={`flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider ${online ? "text-[var(--success)]" : "text-[var(--text-muted)]"}`}
        >
          {online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          {online ? "Online" : "Connecting…"}
        </span>
        <span className="h-4 w-px bg-[var(--border-light)]" />
        <span className="text-[12px] uppercase font-bold text-[var(--text-secondary)]">{session.role}</span>
        <span className="font-mono text-[12px] text-[var(--text-primary)]" title={session.party}>
          {shorten(session.party)}
        </span>
        <Button
          size="sm"
          variant="secondary"
          className="ml-auto"
          onClick={disconnect}
        >
          <LogOut className="h-4 w-4" />
          Disconnect
        </Button>
      </div>
    );
  }

  const onRole = (r: Role) => {
    setRole(r);
    setParty(damlConfig.parties[r]);
  };

  // Registration = allocate a brand-new Canton party on the participant (real ledger op).
  const allocate = async () => {
    setAllocating(true);
    setAllocError(null);
    try {
      const hint = `${role}-${Math.random().toString(36).slice(2, 8)}`;
      const res = await fetch("/api/daml-party", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ identifierHint: hint }),
      });
      const data = (await res.json()) as { party?: string; error?: string };
      if (!res.ok || !data.party) throw new Error(data.error ?? "allocation failed");
      setParty(data.party);
    } catch (e) {
      setAllocError(e instanceof Error ? e.message : String(e));
    } finally {
      setAllocating(false);
    }
  };

  return (
    <div className="brutal-card flex flex-col gap-4 p-5">
      <div className="grid grid-cols-2 gap-3">
        {ROLES.map(({ role: r, label, icon: Icon }) => (
          <button
            key={r}
            onClick={() => onRole(r)}
            className={`flex flex-col items-center gap-2 border-2 px-4 py-4 rounded-xl text-[12px] font-bold uppercase tracking-wider transition-all ${
              role === r
                ? "border-[var(--border)] bg-[var(--accent)] text-white shadow-[var(--shadow-brutal-sm)]"
                : "border-[var(--border-light)] text-[var(--text-secondary)] hover:border-[var(--border)] hover:bg-[var(--surface-hover)]"
            }`}
          >
            <Icon className="h-6 w-6" />
            {label}
          </button>
        ))}
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Party ID</span>
        <input
          value={party}
          onChange={(e) => setParty(e.target.value)}
          placeholder="e.g. Investor::1220ab…"
          className="brutal-input"
        />
      </label>

      <button
        onClick={allocate}
        disabled={allocating}
        className="self-start text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider hover:underline disabled:opacity-50"
      >
        {allocating ? "Allocating…" : "+ Register new party"}
      </button>

      {(error || allocError) && (
        <p className="text-[12px] font-mono text-[var(--danger)] border-2 border-[var(--danger)] rounded-xl p-2 bg-[var(--danger)]/10">{error ?? allocError}</p>
      )}

      <Button onClick={() => connect(party, role)} disabled={connecting || !party}>
        {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {connecting ? "Authenticating…" : "Connect →"}
      </Button>

      <div className="flex items-center gap-2 my-1">
        <span className="h-px bg-[var(--border-light)] flex-1" />
        <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">or wallet signing</span>
        <span className="h-px bg-[var(--border-light)] flex-1" />
      </div>

      <Button
        onClick={() => connectLoop(role)}
        disabled={connecting}
        variant="secondary"
        className="w-full flex items-center justify-center gap-2"
      >
        {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
        {connecting ? "Connecting Wallet…" : "Connect with Loop Wallet"}
      </Button>
    </div>
  );
}
