'use client';

import { PointMaterial, Points } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Color, type Group } from 'three';

import { hasFinePointer } from '@/lib/device';
import { subscribeTheme } from '@/lib/theme';

const COUNT = 1500;
const ROTATION_SPEED = 0.05; // rad/s
const PARALLAX_MAX = 0.1; // rad

/** Loose torus-knot cluster with jitter: reads as an embedding space, not a shape. */
function makePositions(count: number, seed = 7): Float32Array {
  let s = seed;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  const out = new Float32Array(count * 3);
  const p = 2;
  const q = 3;
  for (let i = 0; i < count; i += 1) {
    const t = rand() * Math.PI * 2;
    const r = 1.35 + 0.5 * Math.cos(q * t);
    const jitter = 0.34;
    const x = r * Math.cos(p * t) + (rand() - 0.5) * jitter;
    const y = r * Math.sin(p * t) + (rand() - 0.5) * jitter;
    const z = 0.5 * Math.sin(q * t) + (rand() - 0.5) * jitter;
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z;
  }
  return out;
}

function readToken(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

type CloudProps = { running: boolean };

function Cloud({ running }: CloudProps) {
  const group = useRef<Group>(null);
  const positions = useMemo(() => makePositions(COUNT), []);
  const [color, setColor] = useState(() => new Color(readToken('--accent', '#FF4B3E')));
  const [opacity, setOpacity] = useState(() => parseFloat(readToken('--cloud-opacity', '0.35')));
  const target = useRef({ x: 0, y: 0 });

  // Follow the theme tokens live.
  useEffect(() => {
    const update = () => {
      setColor(new Color(readToken('--accent', '#FF4B3E')));
      setOpacity(parseFloat(readToken('--cloud-opacity', '0.35')));
    };
    return subscribeTheme(update);
  }, []);

  // Tiny parallax on fine pointers only.
  useEffect(() => {
    if (!hasFinePointer()) return;
    const onMove = (e: PointerEvent) => {
      target.current.x = (e.clientY / window.innerHeight - 0.5) * 2 * PARALLAX_MAX;
      target.current.y = (e.clientX / window.innerWidth - 0.5) * 2 * PARALLAX_MAX;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g || !running) return;
    const d = Math.min(delta, 0.05);
    g.rotation.y += ROTATION_SPEED * d;
    g.rotation.x += (target.current.x - g.rotation.x) * 0.04;
    g.rotation.z += (target.current.y - g.rotation.z) * 0.04;
  });

  return (
    <group ref={group} rotation={[0.3, 0, 0]}>
      <Points positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color={color}
          opacity={opacity}
          size={0.034}
          sizeAttenuation
          depthWrite={false}
        />
      </Points>
    </group>
  );
}

type Props = {
  /** Paused when the hero is off screen or the tab is hidden. */
  running: boolean;
  onContextLost: () => void;
};

/** B12. Decorative only: pointer-events none, aria-hidden, low-power, dpr capped. */
export default function PointCloud({ running, onContextLost }: Props) {
  return (
    <Canvas
      className="point-cloud-canvas"
      dpr={[1, 1.5]}
      gl={{ antialias: false, powerPreference: 'low-power', alpha: true }}
      frameloop={running ? 'always' : 'never'}
      camera={{ position: [0, 0, 3.8], fov: 50 }}
      style={{ pointerEvents: 'none', position: 'absolute', inset: 0 }}
      aria-hidden="true"
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault();
          onContextLost();
        });
      }}
    >
      <Cloud running={running} />
    </Canvas>
  );
}
