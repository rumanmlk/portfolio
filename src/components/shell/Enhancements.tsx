'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

import { ResumeTriggers } from '@/components/resume/ResumeTriggers';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { whenIdle } from '@/lib/device';

/** Non-critical, lazily loaded behaviors. Each one fails in isolation (B17). */
const SmoothScroll = dynamic(() => import('@/components/shell/SmoothScroll'), { ssr: false });
const StackTips = dynamic(() => import('@/components/sections/StackTips'), { ssr: false });

export function Enhancements() {
  const [ready, setReady] = useState(false);

  useEffect(() => whenIdle(() => setReady(true)), []);

  return (
    <>
      <ResumeTriggers />
      <ErrorBoundary>
        {ready ? (
          <>
            <SmoothScroll />
            <StackTips />
          </>
        ) : null}
      </ErrorBoundary>
    </>
  );
}
