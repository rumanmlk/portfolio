/**
 * Feature flags only. Safe for client components — does not pull site copy,
 * projects, stack data, or site-url into the browser bundle.
 */
export const features = {
  intro: true,
  pointCloud: true,
  smoothScroll: true,
} as const;

export type Features = typeof features;
