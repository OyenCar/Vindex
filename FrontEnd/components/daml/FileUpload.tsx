"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Paperclip } from "lucide-react";
import { uploadToIpfs, ipfsUrl } from "@/lib/daml/storage";

/**
 * File picker that uploads to IPFS and reports the resulting CID up to the parent.
 * The parent stores the CID in its form state and submits it on-ledger.
 */
export function FileUpload({
  label,
  cid,
  onUploaded,
}: {
  label: string;
  cid: string;
  onUploaded: (cid: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [warn, setWarn] = useState<string | null>(null);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setErr(null);
    setWarn(null);
    try {
      const r = await uploadToIpfs(file);
      setWarn(r.warning ?? null);
      onUploaded(r.cid);
    } catch (x) {
      setErr(x instanceof Error ? x.message : String(x));
      onUploaded("");
    } finally {
      setBusy(false);
    }
  };

  const url = ipfsUrl(cid);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] text-text-secondary">{label}</span>
      <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2">
        <Paperclip className="h-3.5 w-3.5 shrink-0 text-text-secondary" />
        <input
          type="file"
          onChange={onPick}
          className="min-w-0 flex-1 text-[12px] text-text-secondary file:mr-2 file:rounded file:border-0 file:bg-accent/20 file:px-2 file:py-1 file:text-[11px] file:text-text-primary"
        />
        {busy && <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-accent-soft" />}
        {!busy && cid && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />}
      </div>
      {cid && (
        <span className="break-all text-[10.5px] text-text-secondary">
          CID: <span className="font-mono text-text-primary">{cid}</span>
          {url && (
            <>
              {" · "}
              <a href={url} target="_blank" rel="noreferrer" className="text-accent-soft hover:underline">
                view
              </a>
            </>
          )}
        </span>
      )}
      {err && <span className="text-[10.5px] text-red-300">{err}</span>}
      {warn && (
        <span className="text-[10.5px] text-amber-300">
          {warn} (stored locally — the flow still works, but the file isn’t retrievable).
        </span>
      )}
    </div>
  );
}
