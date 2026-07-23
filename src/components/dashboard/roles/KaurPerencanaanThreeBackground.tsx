"use client";

import { Canvas } from "@react-three/fiber";
import { Sparkles, Stars, Float } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useState } from "react";

export function KaurPerencanaanThreeBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#082f49] via-[#020617] to-black opacity-90" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Deep luxury gradient base */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#082f49] via-[#020617] to-black opacity-90" />
      
      <div className="absolute inset-0 mix-blend-screen opacity-70">
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }} gl={{ antialias: false, alpha: true }} dpr={[1, 1.5]} performance={{ min: 0.5 }}>
          <fog attach="fog" args={["#020617", 2, 12]} />
          <ambientLight intensity={0.5} />
          
          <Stars radius={15} depth={50} count={600} factor={4} saturation={0.5} fade speed={1.5} />
          
          <Sparkles count={100} scale={15} size={2} speed={0.4} opacity={0.4} color="#22d3ee" />
          <Sparkles count={50} scale={12} size={4} speed={0.2} opacity={0.3} color="#14b8a6" />
          
          <Float speed={2} rotationIntensity={1.2} floatIntensity={1.5} position={[0, 0, -3]}>
            <mesh>
              <torusGeometry args={[4, 1, 32, 100]} />
              <meshStandardMaterial color="#0891b2" wireframe transparent opacity={0.2} side={THREE.DoubleSide} />
            </mesh>
          </Float>
          
          <Float speed={1.5} rotationIntensity={1.5} floatIntensity={1} position={[4, 2, -5]}>
             <mesh>
               <icosahedronGeometry args={[2, 1]} />
               <meshStandardMaterial color="#0ea5e9" wireframe transparent opacity={0.15} />
             </mesh>
          </Float>
          
          <Float speed={1} rotationIntensity={0.8} floatIntensity={2} position={[-4, -2, -4]}>
             <mesh>
               <octahedronGeometry args={[1.5, 0]} />
               <meshStandardMaterial color="#38bdf8" wireframe transparent opacity={0.15} />
             </mesh>
          </Float>
        </Canvas>
      </div>
    </div>
  );
}
