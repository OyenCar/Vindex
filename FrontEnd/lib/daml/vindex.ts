/**
 * Typed helpers over the REAL generated bindings (`@daml.js/vindex-0.1.0`).
 * No values are invented — every template/choice here is the one compiled from Vindex.daml.
 */
import { Vindex } from "@daml.js/vindex-0.1.0";

export { Vindex };

/** Daml `Numeric`/`Int` are JSON strings. */
export const num = (n: number | string): string => (typeof n === "number" ? n.toString() : n);

/** Build a Daml `RelTime` from seconds (`RelTime = { microseconds: Int }`). */
export const relTimeSeconds = (seconds: number) => ({
  microseconds: Math.round(seconds * 1_000_000).toString(),
});
export const hours = (h: number) => relTimeSeconds(h * 3600);
export const days = (d: number) => relTimeSeconds(d * 86400);

export type VotingModel = Vindex.VotingModel;
export type MStatus = Vindex.MStatus;

/** Human labels for the milestone state machine. */
export const STATUS_LABEL: Record<string, string> = {
  Inactive: "Inactive",
  Active: "Active",
  Submitted: "Awaiting review",
  RejPending: "Awaiting AI verdict",
  Revision: "In revision",
  Accepted: "Accepted",
  Completed: "Completed",
  Failed: "Failed",
};
