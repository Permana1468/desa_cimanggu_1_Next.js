"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Text } from "@react-three/drei";
import * as THREE from "three";
import { useState, useEffect, useRef } from "react";

export function LuxuryRingChart({ 
  percentage, 
  color = "#14b8a6", 
  label 
}: { 
  percentage: number, 
  color?: string, 
  label?: string 
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  
  if (!mounted) {
    return <div className="h-full w-full bg-slate-800/30 rounded-xl animate-pulse" />;
  }
  
  return (
    <div className="h-full w-full relative">
      <Canvas camera={{ position: [0, 0, 3] }} gl={{ antialias: false, alpha: true }} dpr={[1, 1.5]} performance={{ min: 0.5 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[2, 2, 2]} intensity={2} />
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
          <AnimatedRing percentage={percentage} color={color} />
          {label && (
            <Text
              position={[0, 0, 0]}
              fontSize={0.4}
              color={color}
              anchorX="center"
              anchorY="middle"
              font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjQ.ttf"
            >
              {label}
            </Text>
          )}
        </Float>
      </Canvas>
    </div>
  );
}

function AnimatedRing({ percentage, color }: { percentage: number, color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetRotation = useRef((percentage / 100) * Math.PI * 2);
  
  // Base ring
  const baseGeom = new THREE.TorusGeometry(1, 0.08, 16, 64);
  const baseMat = new THREE.MeshStandardMaterial({ 
    color: "#1e293b", 
    transparent: true, 
    opacity: 0.3 
  });

  // Progress ring
  const progressGeom = new THREE.TorusGeometry(1, 0.12, 16, 64, Math.max(0.01, targetRotation.current));
  const progressMat = new THREE.MeshStandardMaterial({ 
    color: color, 
    emissive: color, 
    emissiveIntensity: 0.8,
    toneMapped: false
  });

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += delta * 0.2;
    }
  });

  return (
    <group ref={meshRef} rotation={[0, 0, Math.PI / 2]}>
      <mesh geometry={baseGeom} material={baseMat} />
      <mesh geometry={progressGeom} material={progressMat} />
    </group>
  );
}
