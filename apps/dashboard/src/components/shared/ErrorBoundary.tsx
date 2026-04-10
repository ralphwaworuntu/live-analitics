"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class DashboardErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Tactical System Crash:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-12 bg-red-950/20 border border-red-500/30 rounded-3xl m-6 backdrop-blur-xl">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-6 animate-pulse">
            <AlertTriangle className="text-red-500" size={32} />
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-tighter italic mb-2">
            Module System Failure
          </h2>
          <p className="text-slate-400 text-sm font-mono max-w-md text-center mb-8">
            An unexpected error occurred in {this.props.fallbackTitle || 'this tactical module'}.
            Sentinel-AI Core has isolated the process.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-red-500/20"
          >
            <RefreshCcw size={14} />
            Initialize Recovery Sequence
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default DashboardErrorBoundary;
