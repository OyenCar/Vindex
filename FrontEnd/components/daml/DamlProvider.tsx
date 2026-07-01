"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type Ledger from "@daml/ledger";
import { fetchToken, makeLedger, pingLedger } from "@/lib/daml/ledger";
import type { Role } from "@/lib/daml/config";

export interface Session {
  party: string;
  role: Role;
  ledger: Ledger;
}

interface DamlContextValue {
  session: Session | null;
  connecting: boolean;
  error: string | null;
  /** Real participant reachability (network detection). */
  online: boolean;
  connect: (party: string, role: Role) => Promise<void>;
  disconnect: () => void;
}

const DamlContext = createContext<DamlContextValue | null>(null);
const STORAGE_KEY = "Vindex.session";

export function useDaml(): DamlContextValue {
  const ctx = useContext(DamlContext);
  if (!ctx) throw new Error("useDaml must be used within <DamlProvider>");
  return ctx;
}

export function DamlProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [online, setOnline] = useState(false);
  const didAuto = useRef(false);

  const connect = useCallback(async (party: string, role: Role) => {
    setConnecting(true);
    setError(null);
    try {
      const token = await fetchToken(party.trim());
      const ledger = makeLedger(token);
      setSession({ party: party.trim(), role, ledger });
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ party: party.trim(), role }));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setSession(null);
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setSession(null);
    setError(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Auto-reconnect: restore the previous party/role after a reload.
  useEffect(() => {
    if (didAuto.current) return;
    didAuto.current = true;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const { party, role } = JSON.parse(raw) as { party: string; role: Role };
      if (party && role) void connect(party, role);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [connect]);

  // Liveness polling for the connection indicator.
  useEffect(() => {
    let active = true;
    const tick = async () => {
      const ok = await pingLedger();
      if (active) setOnline(ok);
    };
    void tick();
    const id = setInterval(tick, 10000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  return (
    <DamlContext.Provider
      value={{ session, connecting, error, online, connect, disconnect }}
    >
      {children}
    </DamlContext.Provider>
  );
}
