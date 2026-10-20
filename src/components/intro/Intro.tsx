'use client';

import { IntroSequence } from '@/components/intro/IntroSequence';
import { abortIntro } from '@/components/intro/useIntroState';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { features } from '@/content/features';

/**
 * Entry sequence (B11). Server rendered above the page so the first
 * frame is right; if anything inside throws, the overlay unmounts and the page
 * is unlocked.
 */
export function Intro() {
  if (!features.intro) return null;
  return (
    <ErrorBoundary onError={abortIntro}>
      <IntroSequence />
    </ErrorBoundary>
  );
}
