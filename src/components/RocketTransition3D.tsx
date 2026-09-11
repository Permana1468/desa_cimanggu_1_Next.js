"use client";

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles, Environment } from '@react-three/drei';
import * as THREE from 'three';

function ParticleExplosion({ active, onComplete }: { active: boolean; onComplete: () => void }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particleCount = 200;
  const hasCompleted = useRef(false);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Initialize particles with random directions and speeds
  const particlesData = useMemo(() => {
    return Array.from({ length: particleCount }).map(() => ({
      position: new THREE.Vector3(0, 0, 0),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      ).normalize().multiplyScalar(Math.random() * 30 + 10),
      color: new THREE.Color().setHSL(Math.random() * 0.1 + 0.05, 1, 0.6), // Fire colors
      scale: 1,
      life: 1
    }));
  }, []);

  const colorArray = useMemo(() => {
    const arr = new Float32Array(particleCount * 3);
    particlesData.forEach((p, i) => {
      p.color.toArray(arr, i * 3);
    });
    return arr;
  }, [particlesData]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    if (active) {
      let allFaded = true;
      particlesData.forEach((p, i) => {
        if (p.life > 0) {
          allFaded = false;
          p.position.addScaledVector(p.velocity, delta);
          p.life -= delta * 1.5;
          p.scale = Math.max(0, p.scale - delta * 2);
          
          dummy.position.copy(p.position);
          dummy.scale.setScalar(p.scale);
          dummy.updateMatrix();
          meshRef.current!.setMatrixAt(i, dummy.matrix);
        }
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
      
      if (allFaded && !hasCompleted.current) {
        hasCompleted.current = true;
        onComplete();
      }
    } else {
      // Reset
      hasCompleted.current = false;
      particlesData.forEach((p, i) => {
        p.position.set(0, 0, 0);
        p.life = 1;
        p.scale = 1;
        
        dummy.position.copy(p.position);
        dummy.scale.setScalar(p.scale);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, particleCount]} visible={active}>
      <sphereGeometry args={[0.2, 8, 8]}>
        <instancedBufferAttribute attach="attributes-color" args={[colorArray, 3]} />
      </sphereGeometry>
      <meshBasicMaterial vertexColors transparent opacity={0.8} />
    </instancedMesh>
  );
}

function RocketModel({ 
    isFlying, 
    direction, 
    onExplode,
    onComplete 
}: { 
    isFlying: boolean; 
    direction: 'toLogin' | 'toRegister';
    onExplode: () => void;
    onComplete: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const smokeGroup = useRef<THREE.Group>(null);
  const [exploding, setExploding] = useState(false);
  const hasExploded = useRef(false);
  
  // if direction is toLogin (we are at register/left, going to right/login)
  // rocket starts at -20 (left) and flies to 0 (center), facing right
  const startX = direction === 'toLogin' ? -20 : 20;
  const targetX = 0; 
  
  // Reset when isFlying changes
  useEffect(() => {
    if (isFlying && group.current) {
      group.current.position.set(startX, 0, 0);
      setExploding(false);
      hasExploded.current = false;
    }
  }, [isFlying, startX]);

  useFrame((state, delta) => {
    if (!group.current) return;

    if (isFlying && !exploding) {
      const currentX = group.current.position.x;
      const speed = 30; // Units per second
      const step = speed * delta;
      
      if (Math.abs(currentX - targetX) < step && !hasExploded.current) {
          group.current.position.x = targetX;
          setExploding(true);
          hasExploded.current = true;
          onExplode(); 
      } else {
          group.current.position.x += currentX < targetX ? step : -step;
          // Point rocket in direction of movement
          group.current.rotation.z = currentX < targetX ? -Math.PI / 2 : Math.PI / 2;
      }
      
      // Wobble effect
      group.current.position.y = Math.sin(state.clock.elapsedTime * 20) * 0.2;
    } else if (!isFlying) {
      group.current.position.x = 0;
      group.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.3;
      group.current.rotation.z = 0;
      group.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <>
        <group ref={group} visible={!exploding}>
            {/* Rocket Body */}
            <mesh position={[0, 0, 0]} castShadow>
                <cylinderGeometry args={[0.8, 1, 4, 32]} />
                <meshPhysicalMaterial color="#ffffff" metalness={0.2} roughness={0.1} clearcoat={1.0} />
            </mesh>

            {/* Nose Cone */}
            <mesh position={[0, 2.5, 0]} castShadow>
                <coneGeometry args={[0.8, 1.5, 32]} />
                <meshPhysicalMaterial color="#ef4444" metalness={0.3} roughness={0.2} />
            </mesh>

            {/* Window */}
            <mesh position={[0, 0.5, 0.9]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.4, 0.4, 0.1, 32]} />
                <meshPhysicalMaterial color="#93c5fd" metalness={0.9} roughness={0.1} transmission={0.5} thickness={0.5} />
            </mesh>
            <mesh position={[0, 0.5, 0.85]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
                <meshPhysicalMaterial color="#64748b" metalness={0.5} roughness={0.5} />
            </mesh>

            {/* Fins */}
            {[0, 1, 2, 3].map((i) => (
                <group key={i} position={[0, -1.5, 0]} rotation={[0, (i * Math.PI) / 2, 0]}>
                    <mesh position={[0.8, 0, 0]} rotation={[0, 0, Math.PI / 8]} castShadow>
                         <boxGeometry args={[1.2, 1.5, 0.1]} />
                         <meshPhysicalMaterial color="#ef4444" metalness={0.3} roughness={0.2} />
                    </mesh>
                </group>
            ))}

            {/* Engine Nozzle */}
            <mesh position={[0, -2.2, 0]} castShadow>
                <cylinderGeometry args={[0.6, 0.8, 0.5, 32]} />
                <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.2} />
            </mesh>
            
            {/* Main Thrust Fire */}
            {(isFlying || true) && (
                <mesh position={[0, -3.2, 0]}>
                    <coneGeometry args={[0.5, 2, 16]} />
                    <meshBasicMaterial color="#f97316" transparent opacity={0.8} />
                </mesh>
            )}
            
            {/* Inner Core Fire */}
            {(isFlying || true) && (
                <mesh position={[0, -2.8, 0]}>
                    <coneGeometry args={[0.3, 1.5, 16]} />
                    <meshBasicMaterial color="#fef08a" transparent opacity={0.9} />
                </mesh>
            )}

            {/* Smoke Particles trails behind the rocket */}
            {isFlying && (
                <group ref={smokeGroup} position={[0, -3.5, 0]}>
                    <Sparkles count={150} scale={[2, 6, 2]} size={25} speed={0.8} color="#cccccc" opacity={0.6} />
                    <Sparkles count={50} scale={[1, 4, 1]} size={15} speed={1.2} color="#f97316" opacity={0.8} />
                </group>
            )}
        </group>

        {/* Explosion Effect */}
        <ParticleExplosion active={exploding} onComplete={onComplete} />
    </>
  );
}

export default function RocketTransition3D({ 
    isFlying, 
    direction, 
    onExplode,
    onComplete 
}: { 
    isFlying: boolean; 
    direction: 'toLogin' | 'toRegister';
    onExplode: () => void;
    onComplete: () => void;
}) {
  return (
    <div className={`absolute inset-0 z-50 pointer-events-none transition-opacity duration-300 ${isFlying ? 'opacity-100' : 'opacity-0'}`}>
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }} shadows>
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 10]} intensity={1.5} castShadow />
        <directionalLight position={[-10, 0, 10]} intensity={0.5} />
        <Environment preset="city" />
        
        <RocketModel 
            isFlying={isFlying} 
            direction={direction} 
            onExplode={onExplode} 
            onComplete={onComplete} 
        />
        
      </Canvas>
    </div>
  );
}
