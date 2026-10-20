/**
 * Inline scripts injected into <head>. They run synchronously before first
 * paint so the theme and the intro visibility are correct on the very first
 * frame (B11, B13). Keep them tiny and dependency free.
 */

import { THEME_KEY } from '@/lib/theme';

export const INTRO_SEEN_KEY = 'intro-seen';

/** Sets data-theme from storage; light when nothing is stored or storage is blocked. */
export const themeScript = `(function(){var t='light';try{var s=localStorage.getItem('${THEME_KEY}');if(s==='dark'||s==='light')t=s;}catch(e){}var d=document.documentElement;d.setAttribute('data-theme',t);try{var m=document.querySelector('meta[name="theme-color"]:not([media])');if(m)m.setAttribute('content',t==='dark'?'#0B0B0C':'#FFFBF2');}catch(e){}})();`;

/**
 * Decides whether the entry sequence shows. Skips for deep links, reduced
 * motion, data saver, landscape phones and returning visitors in the session.
 * When `enabled` is false (content.features.intro), always off.
 */
export function getIntroScript(enabled: boolean): string {
  if (!enabled) {
    return `(function(){document.documentElement.setAttribute('data-intro','off');})();`;
  }
  return `(function(){var on=true;try{var h=location.hash;if(h==='#inventory')h='#stack';if(h&&h.length>1)on=false;if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)on=false;var c=navigator.connection;if(c&&c.saveData)on=false;if(window.innerHeight<500)on=false;try{if(sessionStorage.getItem('${INTRO_SEEN_KEY}'))on=false;}catch(e){}}catch(e){on=false;}var d=document.documentElement;d.setAttribute('data-intro',on?'on':'off');if(!on)return;window.addEventListener('keydown',function(e){if(e.key!=='Escape'||d.getAttribute('data-intro')!=='on')return;e.preventDefault();e.stopPropagation();window.__introEscape=1;try{sessionStorage.setItem('${INTRO_SEEN_KEY}','1');}catch(err){}d.setAttribute('data-intro','done');d.style.overflow='';d.classList.remove('intro-avatar-hidden');var site=document.getElementById('site');if(site)site.removeAttribute('inert');if(typeof window.__skipIntro==='function')window.__skipIntro();},true);})();`;
}
