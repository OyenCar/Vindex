"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { VindexLedger } from "@/lib/daml/v2ledger";
import { fetchToken, makeLedger, pingLedger } from "@/lib/daml/ledger";
import type { Role } from "@/lib/daml/config";
import { damlConfig } from "@/lib/daml/config";
import { loop } from "@fivenorth/loop-sdk";
import { LoopLedger } from "@/lib/daml/loopLedger";

export interface Session {
  party: string;
  role: Role;
  ledger: VindexLedger;
}

interface DamlContextValue {
  session: Session | null;
  connecting: boolean;
  error: string | null;
  /** Real participant reachability (network detection). */
  online: boolean;
  connect: (party: string, role: Role) => Promise<void>;
  connectLoop: (role: Role) => Promise<void>;
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
  const activeRoleRef = useRef<Role | null>(null);
  const didAuto = useRef(false);

  // Initialize Loop SDK on load:
  useEffect(() => {
    loop.init({
      appName: damlConfig.loopAppName,
      network: damlConfig.loopNetwork,
      onAccept: (provider) => {
        const role = activeRoleRef.current ?? "worker";
        const loopLedger = new LoopLedger(provider, provider.party_id);
        setSession({
          party: provider.party_id,
          role,
          ledger: loopLedger as unknown as VindexLedger,
        });
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ party: provider.party_id, role, type: "loop" })
        );
        setConnecting(false);
      },
      onReject: () => {
        setError("Loop Wallet connection rejected or closed.");
        setConnecting(false);
      },
    });
  }, []);

  const connect = useCallback(async (party: string, role: Role) => {
    setConnecting(true);
    setError(null);
    try {
      const token = await fetchToken(party.trim());
      const ledger = makeLedger(token, party.trim());
      setSession({ party: party.trim(), role, ledger });
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ party: party.trim(), role, type: "m2m" })
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setSession(null);
    } finally {
      setConnecting(false);
    }
  }, []);

  const connectLoop = useCallback(async (role: Role) => {
    setConnecting(true);
    setError(null);
    activeRoleRef.current = role;
    try {
      await loop.connect();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setSession(null);
    setError(null);
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { type?: string };
        if (parsed.type === "loop") {
          loop.logout();
        }
      } catch {}
    }
    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Auto-reconnect: restore the previous party/role after a reload.
  useEffect(() => {
    if (didAuto.current) return;
    didAuto.current = true;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as { party: string; role: Role; type?: string };
      if (parsed.party && parsed.role) {
        if (parsed.type === "loop") {
          activeRoleRef.current = parsed.role;
          setConnecting(true);
          void loop.autoConnect().catch(() => {
            setConnecting(false);
            window.localStorage.removeItem(STORAGE_KEY);
          });
        } else {
          void connect(parsed.party, parsed.role);
        }
      }
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
      value={{ session, connecting, error, online, connect, connectLoop, disconnect }}
    >
      {children}
    </DamlContext.Provider>
  );
}
