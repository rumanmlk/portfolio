import type { Metadata } from 'next';

import { AvatarSvg } from '@/components/avatar/AvatarSvg';
import { AvatarTile } from '@/components/avatar/AvatarTile';
import { Button } from '@/components/ui/Button';
import { Sparkle } from '@/components/ui/Sparkle';
import { Sticker } from '@/components/ui/Sticker';
import { content } from '@/content/content';

export const metadata: Metadata = {
  title: content.ui.notFound.title,
  robots: { index: false, follow: false },
};

export default function NotFound() {
  const { ui } = content;
  return (
    <main id="main" className="not-found">
      <div className="not-found-inner">
        <AvatarTile size={156} shadow={5}>
          <AvatarSvg size={144} label={ui.avatarAlt} />
        </AvatarTile>
        <Sticker fill="pixel" tilt={-3} as="div" className="pixel">
          {ui.notFound.code}
        </Sticker>
        <h1 className="not-found-title">
          {ui.notFound.title}
          <Sparkle size={26} fill="yellow" className="ml-3 inline-block align-top" />
        </h1>
        <p className="not-found-body">{ui.notFound.body}</p>
        <Button href="/" variant="accent">
          {ui.notFound.home}
        </Button>
      </div>
    </main>
  );
}
