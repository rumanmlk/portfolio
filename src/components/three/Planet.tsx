'use client';

/* three.js objects and uniforms are mutated imperatively every frame by design. */
/* eslint-disable react-hooks/immutability */

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { BackSide, Color, Vector3, type Group, type MeshBasicMaterial } from 'three';

import { hasFinePointer } from '@/lib/device';
import { subscribeTheme } from '@/lib/theme';

const VERTEX = /* glsl */ `
  varying vec3 vN;
  varying vec3 vP;
  void main() {
    vN = normalize(normalMatrix * normal);
    vP = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  uniform vec3 uLight;
  uniform vec3 uBase;
  uniform vec3 uDot;
  uniform float uCell;
  varying vec3 vN;
  varying vec3 vP;
  void main() {
    float l = dot(normalize(vN), normalize(uLight));
    float f = sin(vP.x*3.2+1.3) * sin(vP.y*2.6-0.7) * sin(vP.z*3.4+2.1);
    float band = 0.5 + 0.5*sin(vP.y*9.0 + f*2.0);
    float pt = smoothstep(0.05, 0.18, f);
    float sh = clamp(0.62 - 0.62*l + 0.30*pt + 0.10*band, 0.0, 1.0);
    vec2 p = gl_FragCoord.xy / uCell;
    vec2 r = mat2(0.7071,-0.7071,0.7071,0.7071) * p;
    float m = step(length(fract(r) - 0.5), sh*0.78);
    gl_FragColor = vec4(mix(uBase, uDot, m), 1.0);
    #include <colorspace_fragment>
  }
`;

const MOONS = [
  { radius: 0.34, orbit: 3.8, speed: 0.75, phase: 0, tilt: 0.5, token: '--yellow' },
  { radius: 0.24, orbit: 4.1, speed: -0.5, phase: 2.2, tilt: -0.4, token: '--sky' },
] as const;

function token(style: CSSStyleDeclaration, name: string): Color {
  const v = style.getPropertyValue(name).trim();
  // Tokens always exist once the stylesheet is applied; an empty value yields black, not a throw.
  return v ? new Color(v) : new Color();
}

/** Geometries and materials are JSX children, so R3F disposes them on unmount. */
function Scene({ reduced }: { reduced: boolean }) {
  const { gl, invalidate } = useThree();
  const tilt = useRef<Group>(null);
  const planet = useRef<Group>(null);
  const ringGroup = useRef<Group>(null);
  const orbits = useRef<(Group | null)[]>([]);

  const uniforms = useMemo(
    () => ({
      uLight: { value: new Vector3(0.5, 0.5, 0.85) },
      uBase: { value: new Color() },
      uDot: { value: new Color() },
      uCell: { value: 9 },
    }),
    [],
  );

  const hullMat = useRef<MeshBasicMaterial>(null);
  const ringMat = useRef<MeshBasicMaterial>(null);
  const moonMats = useRef<(MeshBasicMaterial | null)[]>([]);
  const moonHullMats = useRef<(MeshBasicMaterial | null)[]>([]);

  const pointer = useRef({ tx: 0, ty: 0, x: 0, y: 0 });
  const clock = useRef(0);

  // Colors come from the CSS tokens now and again whenever the theme flips.
  useEffect(() => {
    const apply = () => {
      const style = getComputedStyle(document.documentElement);
      const line = token(style, '--line');
      uniforms.uBase.value.copy(token(style, '--surface'));
      uniforms.uDot.value.copy(token(style, '--accent'));
      hullMat.current?.color.copy(line);
      ringMat.current?.color.copy(line);
      moonHullMats.current.forEach((m) => m?.color.copy(line));
      MOONS.forEach((m, i) => moonMats.current[i]?.color.copy(token(style, m.token)));
      const dom = gl.domElement;
      dom.dataset.base = `#${uniforms.uBase.value.getHexString()}`;
      dom.dataset.dot = `#${uniforms.uDot.value.getHexString()}`;
      invalidate();
    };
    apply();
    return subscribeTheme(apply);
  }, [gl, invalidate, uniforms]);

  // Pointer position inside the canvas, fine pointers only.
  useEffect(() => {
    if (!hasFinePointer() || reduced) return;
    const onMove = (e: PointerEvent) => {
      const r = gl.domElement.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const clamp = (v: number) => Math.max(-1, Math.min(1, v));
      pointer.current.tx = clamp(((e.clientX - r.left) / r.width - 0.5) * 2);
      pointer.current.ty = clamp(-((e.clientY - r.top) / r.height - 0.5) * 2);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [gl, reduced]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    // Reduced motion renders one still frame at a fixed pose.
    const t = reduced ? 1.2 : (clock.current += dt);
    const p = pointer.current;
    p.x += (p.tx - p.x) * 0.07;
    p.y += (p.ty - p.y) * 0.07;

    if (planet.current && !reduced) planet.current.rotation.y += dt * 0.45;
    if (ringGroup.current) {
      ringGroup.current.rotation.y = Math.sin(t * 0.4) * 0.55;
      ringGroup.current.rotation.x = Math.sin(t * 0.27 + 1) * 0.12;
    }
    for (let i = 0; i < MOONS.length; i += 1) {
      const o = orbits.current[i];
      if (o) o.rotation.y = MOONS[i].phase + t * MOONS[i].speed;
    }
    if (tilt.current) {
      tilt.current.position.y = Math.sin(t * 0.9) * 0.08;
      tilt.current.rotation.x += (p.y * 0.3 - tilt.current.rotation.x) * 0.07;
    }
    const a = t * 0.55;
    uniforms.uLight.value.set(
      Math.sin(a) * 1.2 + p.x * 0.8,
      0.45 + Math.cos(a * 0.7) * 0.25 + p.y * 0.8,
      0.85,
    );
    const cell = 9 * gl.getPixelRatio();
    if (uniforms.uCell.value !== cell) uniforms.uCell.value = cell;
    // Frame counter is only exposed for the reduced-motion (still frame) check.
    if (reduced) {
      const dom = gl.domElement;
      dom.dataset.frames = String(Number(dom.dataset.frames ?? 0) + 1);
    }
  });

  return (
    <>
      <group ref={tilt} rotation={[0, 0, -0.35]}>
        <group ref={planet}>
          <mesh>
            <sphereGeometry args={[2.2, 56, 40]} />
            <shaderMaterial uniforms={uniforms} vertexShader={VERTEX} fragmentShader={FRAGMENT} />
          </mesh>
        </group>
        <mesh scale={1.045}>
          <sphereGeometry args={[2.2, 40, 28]} />
          <meshBasicMaterial ref={hullMat} side={BackSide} />
        </mesh>
        <group ref={ringGroup}>
          <mesh rotation={[1.25, 0, 0]}>
            <torusGeometry args={[3.4, 0.07, 8, 140]} />
            <meshBasicMaterial ref={ringMat} />
          </mesh>
        </group>
      </group>

      {MOONS.map((m, i) => (
        <group
          key={m.token}
          ref={(g) => {
            orbits.current[i] = g;
          }}
          rotation={[m.tilt, m.phase, 0]}
        >
          <group position={[m.orbit, 0, 0]}>
            <mesh>
              <sphereGeometry args={[m.radius, 20, 14]} />
              <meshBasicMaterial
                ref={(x) => {
                  moonMats.current[i] = x;
                }}
              />
            </mesh>
            <mesh>
              <sphereGeometry args={[m.radius + 0.06, 20, 14]} />
              <meshBasicMaterial
                side={BackSide}
                ref={(x) => {
                  moonHullMats.current[i] = x;
                }}
              />
            </mesh>
          </group>
        </group>
      ))}
    </>
  );
}

type Props = {
  /** Paused when the hero is off screen or the tab is hidden. */
  running: boolean;
  /** Reduced motion: one static frame, no loop. */
  reduced: boolean;
  onContextLost: () => void;
};

/** Decorative only: pointer-events none, aria-hidden, low-power, dpr capped at 1.5. */
export default function Planet({ running, reduced, onContextLost }: Props) {
  // r3f force-loses the context when the canvas unmounts (e.g. window shrinks below the
  // desktop breakpoint). That deliberate loss must not be reported as a real one, or the
  // loader would give up on 3D for the rest of the session.
  const alive = useRef(true);
  const lostCb = useRef(onContextLost);
  useEffect(() => {
    lostCb.current = onContextLost;
  }, [onContextLost]);
  // Layout effect: its cleanup must run before r3f tears the renderer down.
  useLayoutEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  return (
    <Canvas
      className="planet-canvas"
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: 'low-power', alpha: true }}
      frameloop={reduced ? 'demand' : running ? 'always' : 'never'}
      // The canvas bleeds 25% past the planet box on every side (1.5x) so moons and the ring
      // can swing wide and in front without touching the canvas edge. The camera sits at 14,
      // which makes the planet about 1.35x its original size.
      camera={{ position: [0, 0, 14], fov: 38 }}
      // Explicit size: r3f's wrapper defaults to 100% x 100%, which would beat the inset.
      style={{
        pointerEvents: 'none',
        position: 'absolute',
        left: '-25%',
        top: '-25%',
        width: '150%',
        height: '150%',
      }}
      aria-hidden="true"
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault();
          if (alive.current) lostCb.current();
        });
      }}
    >
      <Scene reduced={reduced} />
    </Canvas>
  );
}
