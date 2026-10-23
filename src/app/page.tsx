import { Contact } from '@/components/sections/Contact';
import { Experience } from '@/components/sections/Experience';
import { Hero } from '@/components/sections/Hero';
import { Stack } from '@/components/sections/Stack';
import { Work } from '@/components/sections/Work';
import { Writing } from '@/components/sections/Writing';
import { Intro } from '@/components/intro/Intro';
import { Footer } from '@/components/shell/Footer';
import { MobileHeader } from '@/components/shell/MobileHeader';
import { Sidebar } from '@/components/shell/Sidebar';

export default function Page() {
  return (
    <>
      <div className="site" id="site">
        <Sidebar />
        <MobileHeader />
        <div className="site-column">
          <main id="main" className="site-main" tabIndex={-1}>
            <Hero />
            <Work />
            <Experience />
            <Stack />
            <Writing />
            <Contact />
          </main>
          <Footer />
        </div>
      </div>
      <Intro />
    </>
  );
}
