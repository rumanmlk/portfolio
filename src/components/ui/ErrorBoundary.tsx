'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  /** Rendered when a child throws. Defaults to nothing: the feature disappears, the page stays. */
  fallback?: ReactNode;
  /** Optional hook for logging or cleanup (restoring scroll, hiding overlays). */
  onError?: (error: Error, info: ErrorInfo) => void;
};

type State = { failed: boolean };

/**
 * Isolates non-critical features (intro, avatar motion, planet, smooth
 * scroll). If any of them throws, it unmounts and the site keeps working.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
    if (process.env.NODE_ENV !== 'production') {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? null;
    return this.props.children;
  }
}
