'use client';

import {
  useAvatarMotion,
  type AvatarMotionOptions,
  type AvatarPartRefs,
} from '@/components/avatar/useAvatarMotion';

type Props = { parts: AvatarPartRefs; options?: AvatarMotionOptions };

/** Renders nothing; attaches the B9 behaviors to an already rendered avatar. */
export default function AvatarMotion({ parts, options }: Props) {
  useAvatarMotion(parts, options);
  return null;
}
