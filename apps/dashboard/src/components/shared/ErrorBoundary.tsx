"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ClawShield ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="rounded-xl border border-block/30 bg-block/5 p-8 text-center">
          <h2 className="text-lg font-semibold text-block">Something went wrong</h2>
          <p className="mt-2 text-sm text-text-muted">
            {this.state.error?.message ?? "An unexpected error occurred"}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="mt-4 rounded-lg bg-surface-elevated px-4 py-2 text-sm text-text hover:bg-surface"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
