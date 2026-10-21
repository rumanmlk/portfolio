/**
 * Pure CSS planet: halftone disc, ring and two moons. Same box as the WebGL
 * canvas so nothing shifts when the 3D scene takes over (or never loads).
 */
export function StaticPlanet() {
  return (
    <div className="planet-static" aria-hidden="true">
      <span className="planet-static-ring" />
      <span className="planet-static-disc" />
      <span className="planet-static-moon-a" />
      <span className="planet-static-moon-b" />
    </div>
  );
}
