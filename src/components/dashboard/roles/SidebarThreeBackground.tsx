"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles, Stars, Float } from "@react-three/drei";
import * as THREE from "three";
import { useState, useEffect, useRef } from "react";

export function SidebarThreeBackground() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="absolute inset-0 bg-slate-950/80 opacity-90 z-0 pointer-events-none" />;
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-slate-950/40">
      <Canvas camera={{ position: [0, 0, 5], fov: 40 }} gl={{ antialias: false, alpha: true }} dpr={[1, 1.5]} performance={{ min: 0.5 }}>
        <fog attach="fog" args={["#020617", 2, 8]} />
        <ambientLight intensity={1} />
        
        <Stars radius={8} depth={20} count={300} factor={2} saturation={0.5} fade speed={1} />
        
        <Sparkles count={40} scale={8} size={1} speed={0.4} opacity={0.3} color="#2dd4bf" />
        <Sparkles count={20} scale={6} size={2} speed={0.2} opacity={0.2} color="#0ea5e9" />
        
        {/* Soft glowing floating elements */}
        <Float speed={1.5} rotationIntensity={1} floatIntensity={1} position={[0, -2, -3]}>
           <mesh>
             <icosahedronGeometry args={[1, 1]} />
             <meshStandardMaterial color="#0ea5e9" wireframe transparent opacity={0.15} />
           </mesh>
        </Float>
        
        <Float speed={1} rotationIntensity={0.8} floatIntensity={1.5} position={[1, 3, -4]}>
           <mesh>
             <octahedronGeometry args={[1, 0]} />
             <meshStandardMaterial color="#2dd4bf" wireframe transparent opacity={0.15} />
           </mesh>
        </Float>

        <SideParticles />
      </Canvas>
    </div>
  );
}

function SideParticles() {
  const meshRef = useRef<THREE.Points>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.5;
    }
  });

  return (
    <points ref={meshRef}>
      <sphereGeometry args={[4, 16, 16]} />
      <pointsMaterial color="#0ea5e9" size={0.02} transparent opacity={0.1} />
    </points>
  );
}
