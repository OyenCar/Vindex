"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}
interface State {
  error: Error | null;
}

/** Catches render-time errors in the dapp subtree so one broken panel can't blank the page. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    // Real apps would forward this to Sentry/Datadog; we keep it local.
    console.error("[Vindex dapp error]", error);
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (error) {
      if (this.props.fallback) return this.props.fallback(error, this.reset);
      return (
        <div className="glass flex flex-col items-start gap-3 rounded-2xl p-6">
          <span className="flex items-center gap-2 text-warning">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-semibold">Something went wrong</span>
          </span>
          <p className="text-sm text-text-secondary">{error.message}</p>
          <button
            onClick={this.reset}
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-text-primary hover:bg-white/5"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
