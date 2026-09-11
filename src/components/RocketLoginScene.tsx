"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type RocketProps = {
  triggered: boolean;
  onExplode: () => void;
};

function Rocket({ triggered, onExplode }: RocketProps) {
  const groupRef = useRef<THREE.Group>(null);
  const xPos = useRef(-2.0);
  const hasExploded = useRef(false);
  const launched = useRef(false);

  useEffect(() => {
    if (triggered) {
      launched.current = true;
    }
  }, [triggered]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (!launched.current) {
      // Idle animation: float up and down
      groupRef.current.position.x = -2;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.2;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.04;
      return;
    }

    // Launch: move fast to the right
    xPos.current += delta * 9;
    groupRef.current.position.x = xPos.current;
    groupRef.current.position.y = Math.sin(xPos.current * 0.6) * 0.08;
    groupRef.current.rotation.z = -0.08;

    if (xPos.current > 7 && !hasExploded.current) {
      hasExploded.current = true;
      onExplode();
    }
  });

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh>
        <cylinderGeometry args={[0.2, 0.24, 1.1, 12]} />
        <meshStandardMaterial color="#f1f5f9" metalness={0.8} roughness={0.15} />
      </mesh>
      {/* Nose cone */}
      <mesh position={[0, 0.72, 0]}>
        <coneGeometry args={[0.2, 0.5, 12]} />
        <meshStandardMaterial color="#dc2626" metalness={0.6} roughness={0.2} />
      </mesh>
      {/* Cockpit window */}
      <mesh position={[0, 0.25, 0.21]}>
        <circleGeometry args={[0.11, 24]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.5} />
      </mesh>
      {/* Fins */}
      <mesh position={[-0.26, -0.38, 0]} rotation={[0, 0, -0.45]}>
        <boxGeometry args={[0.22, 0.38, 0.05]} />
        <meshStandardMaterial color="#2563eb" metalness={0.5} roughness={0.25} />
      </mesh>
      <mesh position={[0.26, -0.38, 0]} rotation={[0, 0, 0.45]}>
        <boxGeometry args={[0.22, 0.38, 0.05]} />
        <meshStandardMaterial color="#2563eb" metalness={0.5} roughness={0.25} />
      </mesh>
      {/* Back thruster ring */}
      <mesh position={[0, -0.57, 0]}>
        <torusGeometry args={[0.18, 0.04, 8, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Flame (only when launched) */}
      {launched.current && (
        <>
          <mesh position={[0, -0.88, 0]}>
            <coneGeometry args={[0.13, 0.55, 10]} />
            <meshStandardMaterial color="#fb923c" emissive="#fb923c" emissiveIntensity={3} transparent opacity={0.85} />
          </mesh>
          <mesh position={[0, -1.0, 0]}>
            <coneGeometry args={[0.08, 0.4, 8]} />
            <meshStandardMaterial color="#fde68a" emissive="#fde68a" emissiveIntensity={4} transparent opacity={0.7} />
          </mesh>
        </>
      )}
    </group>
  );
}

// CSS-based smoke trail
function SmokeTrail({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<{ id: number; left: string; top: string; size: number }[]>([]);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setParticles(prev => [
        ...prev.slice(-18),
        {
          id: Date.now(),
          left: (15 + Math.random() * 8) + '%',
          top: (38 + (Math.random() - 0.5) * 22) + '%',
          size: 10 + Math.random() * 20,
        }
      ]);
    }, 40);
    return () => clearInterval(interval);
  }, [active]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left, top: p.top,
            width: p.size, height: p.size,
            background: 'radial-gradient(circle, rgba(255,255,255,0.25) 0%, rgba(180,180,200,0.1) 100%)',
            transform: 'translate(-50%, -50%)',
            animation: 'smoke-dissipate 0.9s ease-out forwards',
          }}
        />
      ))}
      <style>{`
        @keyframes smoke-dissipate {
          0%   { opacity: 0.7; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0;   transform: translate(-50%, -50%) scale(2.5); }
        }
      `}</style>
    </div>
  );
}

export default function RocketLoginScene({ onExplode }: { onExplode: () => void }) {
  const [launched, setLaunched] = useState(false);
  const [showSmoke, setShowSmoke] = useState(false);

  const handleLaunch = useCallback(() => {
    if (launched) return;
    setLaunched(true);
    setShowSmoke(true);
  }, [launched]);

  const handleExplode = useCallback(() => {
    setShowSmoke(false);
    onExplode();
  }, [onExplode]);

  return (
    <div
      className="relative w-full h-full cursor-pointer select-none"
      onClick={handleLaunch}
      title="Klik untuk meluncurkan!"
    >
      <SmokeTrail active={showSmoke} />
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.9} color="#c7d2fe" />
        <directionalLight position={[5, 8, 5]} intensity={1.8} color="#ffffff" />
        <pointLight position={[-3, 2, 4]} intensity={0.7} color="#60a5fa" />
        <pointLight position={[3, -2, 3]} intensity={0.4} color="#f0abfc" />
        <Rocket triggered={launched} onExplode={handleExplode} />
      </Canvas>

      {/* Click hint (shown before launch) */}
      {!launched && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
          <div className="w-6 h-6 rounded-full border-2 border-cyan-400/60 flex items-center justify-center animate-bounce">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
          </div>
        </div>
      )}
    </div>
  );
}
