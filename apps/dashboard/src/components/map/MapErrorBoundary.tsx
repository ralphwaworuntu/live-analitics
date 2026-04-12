"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, WifiOff, Map } from "lucide-react";
import { TacticalCompass } from "./TacticalCompass";

interface Props {
  children: ReactNode;
  personnelName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorType: "api" | "runtime" | "network" | "unknown";
}

export class MapErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorType: "unknown",
  };

  public static getDerivedStateFromError(error: Error): State {
    let errorType: State["errorType"] = "unknown";
    
    if (error.message.includes("Google Maps JavaScript API")) {
      errorType = "api";
    } else if (error.message.includes("network") || error.message.includes("fetch")) {
      errorType = "network";
    } else if (error.message.includes("TypeError") || error.message.includes("ReferenceError")) {
      errorType = "runtime";
    }

    return { hasError: true, error, errorInfo: null, errorType };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[MapErrorBoundary] Caught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: "unknown",
    });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full relative">
          {/* Tactical Compass Fallback */}
          <TacticalCompass personnelName={this.props.personnelName} />

          {/* Error Overlay Banner */}
          <div className="absolute bottom-0 left-0 right-0 bg-red-950/90 border-t border-red-500/30 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between max-w-md mx-auto">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  {this.state.errorType === "network" ? (
                    <WifiOff size={20} className="text-red-400" />
                  ) : this.state.errorType === "api" ? (
                    <Map size={20} className="text-red-400" />
                  ) : (
                    <AlertTriangle size={20} className="text-red-400" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-black text-white uppercase tracking-tight">
                    {this.state.errorType === "network" && "Network Error - Map Unavailable"}
                    {this.state.errorType === "api" && "Google Maps API Error"}
                    {this.state.errorType === "runtime" && "Map Rendering Error"}
                    {this.state.errorType === "unknown" && "Unknown Map Error"}
                  </div>
                  <div className="text-xs text-slate-400 font-mono truncate max-w-xs">
                    {this.state.error?.message || "Unknown error occurred"}
                  </div>
                </div>
              </div>

              <button
                onClick={this.handleRetry}
                className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-black rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#D4AF37]/90 transition-all"
              >
                <RefreshCw size={14} />
                Retry
              </button>
            </div>
          </div>

          {/* Full Screen Error Message (shown briefly) */}
          <div className="absolute inset-0 bg-[#07111F]/95 flex flex-col items-center justify-center p-8 pointer-events-none opacity-0 animate-pulse z-50">
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
              <AlertTriangle size={40} className="text-red-400" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-2">
              Map Module Failure
            </h2>
            <p className="text-slate-400 text-sm font-mono max-w-lg text-center">
              The map engine encountered an error. Tactical Compass is showing position data as fallback.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default MapErrorBoundary;