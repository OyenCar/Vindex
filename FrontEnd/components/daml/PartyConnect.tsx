"use client";

import { useState } from "react";
import { Landmark, Hammer, BrainCircuit, LogOut, Loader2, Wifi, WifiOff } from "lucide-react";
import { useDaml } from "@/components/daml/DamlProvider";
import { damlConfig, type Role } from "@/lib/daml/config";
import { Button } from "@/components/ui/button";

const ROLES: { role: Role; label: string; icon: typeof Landmark }[] = [
  { role: "investor", label: "Investor Party", icon: Landmark },
  { role: "worker", label: "Worker", icon: Hammer },
  { role: "agent", label: "AI Agent", icon: BrainCircuit },
];

function shorten(p: string) {
  return p.length > 22 ? `${p.slice(0, 12)}…${p.slice(-8)}` : p;
}

/** Party authentication + account management (the Canton analog of "connect wallet"). */
export function PartyConnect() {
  const { session, connect, disconnect, connecting, error, online } = useDaml();
  const [role, setRole] = useState<Role>("investor");
  const [party, setParty] = useState(damlConfig.parties.investor);
  const [allocating, setAllocating] = useState(false);
  const [allocError, setAllocError] = useState<string | null>(null);

  if (session) {
    return (
      <div className="glass flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3">
        <span
          className={`flex items-center gap-1.5 text-[12px] ${online ? "text-success" : "text-text-secondary"}`}
        >
          {online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          {online ? "Participant online" : "Connecting…"}
        </span>
        <span className="h-4 w-px bg-white/10" />
        <span className="text-[13px] capitalize text-text-secondary">{session.role}</span>
        <span className="font-mono text-[13px] text-text-primary" title={session.party}>
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
    <div className="glass flex flex-col gap-4 rounded-2xl p-5">
      <div className="grid grid-cols-3 gap-2">
        {ROLES.map(({ role: r, label, icon: Icon }) => (
          <button
            key={r}
            onClick={() => onRole(r)}
            className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-3 text-[12px] transition-colors ${
              role === r
                ? "border-accent/50 bg-accent/10 text-text-primary"
                : "border-white/8 text-text-secondary hover:bg-white/5"
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </button>
        ))}
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-[12px] text-text-secondary">Party ID</span>
        <input
          value={party}
          onChange={(e) => setParty(e.target.value)}
          placeholder="e.g. Investor::1220ab…"
          className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 font-mono text-[13px] text-text-primary outline-none focus:border-accent/50"
        />
      </label>

      <button
        onClick={allocate}
        disabled={allocating}
        className="self-start text-[12px] text-accent-soft hover:underline disabled:opacity-50"
      >
        {allocating ? "Allocating…" : "+ Register a new party on the ledger"}
      </button>

      {(error || allocError) && (
        <p className="text-[12px] text-red-300">{error ?? allocError}</p>
      )}

      <Button onClick={() => connect(party, role)} disabled={connecting || !party}>
        {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {connecting ? "Authenticating…" : "Connect party"}
      </Button>
    </div>
  );
}
