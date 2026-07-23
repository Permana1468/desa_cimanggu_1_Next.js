"use client";

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, RoundedBox, Cylinder, Sphere, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { ExpressionType } from './ImoRobotCompanion';

// Reusable Materials to match the IMO-1 aesthetic
const materials = {
  whiteCeramic: new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.1, metalness: 0.3, clearcoat: 1 }),
  darkScreen: new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.2, metalness: 0.5 }),
  emeraldBody: new THREE.MeshStandardMaterial({ color: '#10b981', roughness: 0.2, metalness: 0.4 }),
  tealAccent: new THREE.MeshStandardMaterial({ color: '#0d9488', roughness: 0.3, metalness: 0.5 }),
  eyeGlow: new THREE.MeshStandardMaterial({ color: '#34d399', emissive: '#10b981', emissiveIntensity: 2, toneMapped: false }),
  reactorGlow: new THREE.MeshStandardMaterial({ color: '#34d399', emissive: '#34d399', emissiveIntensity: 1.5, toneMapped: false }),
  metalJoints: new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 0.5, metalness: 0.8 }),
  pinkBlush: new THREE.MeshStandardMaterial({ color: '#f472b6', emissive: '#f472b6', emissiveIntensity: 1 }),
};

interface RobotProps {
  expression?: ExpressionType | "tickled";
  isPointing?: boolean;
  isTickled?: boolean;
  onRobotClick?: () => void;
}

// Mouse tracking for full screen response
const globalMouse = { x: 0, y: 0 };
let lastMouseMove = typeof Date !== 'undefined' ? Date.now() : 0;

// Robot Head component
function RobotHead({ expression, isTickled, isBored }: { expression: string; isTickled?: boolean; isBored?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const eyesRef = useRef<THREE.Group>(null);
  const nextBlink = useRef(0);
  
  // Make the head look at the mouse globally and handle blinking
  useFrame((state) => {
    // Blinking logic
    if (eyesRef.current) {
      if (state.clock.elapsedTime > nextBlink.current) {
        if (state.clock.elapsedTime > nextBlink.current + 0.15) {
          // End blink
          eyesRef.current.scale.y = 1;
          nextBlink.current = state.clock.elapsedTime + 2 + Math.random() * 4; // next blink in 2-6s
        } else {
          // Blinking (close eyes)
          eyesRef.current.scale.y = 0.1;
        }
      }
    }

    // Head movement
    if (groupRef.current) {
      if (isTickled) {
        // Rapid wiggle when tickled
        groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 30) * 0.1;
        groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 20) * 0.05;
      } else if (isBored) {
        // Slumped head looking down when bored
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 0.05);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0.3, 0.05);
      } else {
        // Global tracking
        const targetX = (globalMouse.x * Math.PI) / 4;
        const targetY = (globalMouse.y * Math.PI) / 5;
        
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetX, 0.1);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -targetY, 0.1);
      }
    }
  });

  const currentExpression = isBored ? "bored" : expression;

  return (
    <group ref={groupRef} position={[0, 1.2, 0]}>
      {/* Main Helmet (Rounded Box) */}
      <RoundedBox args={[1.8, 1.4, 1.6]} radius={0.3} smoothness={4} material={materials.whiteCeramic} />
      
      {/* Top Triple Camera Sensor Array */}
      <group position={[0, 0.72, 0.6]}>
        <RoundedBox args={[0.8, 0.2, 0.3]} radius={0.05} material={materials.darkScreen} />
        {[-0.25, 0, 0.25].map((x, i) => (
          <Sphere key={`cam-${i}`} args={[0.06, 16, 16]} position={[x, 0, 0.15]} material={isBored ? materials.metalJoints : materials.eyeGlow} />
        ))}
      </group>

      {/* Side Headphones/Ears */}
      <Cylinder args={[0.3, 0.3, 0.2, 32]} position={[-0.95, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.emeraldBody} />
      <Cylinder args={[0.2, 0.2, 0.22, 32]} position={[-0.95, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.darkScreen} />
      <Cylinder args={[0.3, 0.3, 0.2, 32]} position={[0.95, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.emeraldBody} />
      <Cylinder args={[0.2, 0.2, 0.22, 32]} position={[0.95, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.darkScreen} />

      {/* Visor Screen */}
      <RoundedBox args={[1.5, 0.9, 0.1]} radius={0.1} position={[0, -0.1, 0.81]} material={materials.darkScreen} />

      {/* Dynamic LED Eyes on Visor */}
      <group position={[0, -0.1, 0.87]} ref={eyesRef}>
        {currentExpression === "tickled" ? (
          // > < Eyes
          <>
            <group position={[-0.35, 0.1, 0]}>
              <mesh rotation={[0, 0, Math.PI / 4]} position={[0, 0.1, 0]}><boxGeometry args={[0.2, 0.05, 0.02]} /><meshStandardMaterial {...materials.eyeGlow} /></mesh>
              <mesh rotation={[0, 0, -Math.PI / 4]} position={[0, -0.1, 0]}><boxGeometry args={[0.2, 0.05, 0.02]} /><meshStandardMaterial {...materials.eyeGlow} /></mesh>
            </group>
            <group position={[0.35, 0.1, 0]}>
              <mesh rotation={[0, 0, -Math.PI / 4]} position={[0, 0.1, 0]}><boxGeometry args={[0.2, 0.05, 0.02]} /><meshStandardMaterial {...materials.eyeGlow} /></mesh>
              <mesh rotation={[0, 0, Math.PI / 4]} position={[0, -0.1, 0]}><boxGeometry args={[0.2, 0.05, 0.02]} /><meshStandardMaterial {...materials.eyeGlow} /></mesh>
            </group>
          </>
        ) : currentExpression === "happy" ? (
          // ^ ^ Eyes
          <>
            <mesh position={[-0.3, 0.1, 0]} rotation={[0, 0, -Math.PI / 8]}><boxGeometry args={[0.3, 0.08, 0.02]} /><meshStandardMaterial {...materials.eyeGlow} /></mesh>
            <mesh position={[-0.45, 0.05, 0]} rotation={[0, 0, Math.PI / 4]}><boxGeometry args={[0.2, 0.08, 0.02]} /><meshStandardMaterial {...materials.eyeGlow} /></mesh>
            <mesh position={[0.3, 0.1, 0]} rotation={[0, 0, Math.PI / 8]}><boxGeometry args={[0.3, 0.08, 0.02]} /><meshStandardMaterial {...materials.eyeGlow} /></mesh>
            <mesh position={[0.45, 0.05, 0]} rotation={[0, 0, -Math.PI / 4]}><boxGeometry args={[0.2, 0.08, 0.02]} /><meshStandardMaterial {...materials.eyeGlow} /></mesh>
          </>
        ) : currentExpression === "bored" ? (
          // _ _ Eyes (Half closed / Bored)
          <>
            <RoundedBox args={[0.35, 0.08, 0.02]} radius={0.04} position={[-0.35, 0.05, 0]} material={materials.eyeGlow} />
            <RoundedBox args={[0.35, 0.08, 0.02]} radius={0.04} position={[0.35, 0.05, 0]} material={materials.eyeGlow} />
          </>
        ) : currentExpression === "angry" ? (
          // \ / Eyes (Angry)
          <>
            <mesh position={[-0.35, 0.1, 0]} rotation={[0, 0, -Math.PI / 6]}><boxGeometry args={[0.4, 0.08, 0.02]} /><meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} toneMapped={false} /></mesh>
            <mesh position={[0.35, 0.1, 0]} rotation={[0, 0, Math.PI / 6]}><boxGeometry args={[0.4, 0.08, 0.02]} /><meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} toneMapped={false} /></mesh>
          </>
        ) : (
          // Normal Eyes
          <>
            <RoundedBox args={[0.35, 0.35, 0.02]} radius={0.1} position={[-0.35, 0.1, 0]} material={materials.eyeGlow} />
            <RoundedBox args={[0.35, 0.35, 0.02]} radius={0.1} position={[0.35, 0.1, 0]} material={materials.eyeGlow} />
          </>
        )}
      </group>

      {/* Smile / Mouth */}
      {currentExpression === "bored" ? (
        <mesh position={[0, -0.25, 0.87]}>
          <boxGeometry args={[0.2, 0.04, 0.02]} />
          <meshStandardMaterial {...materials.eyeGlow} />
        </mesh>
      ) : currentExpression === "angry" ? (
        <mesh position={[0, -0.25, 0.87]}>
          <boxGeometry args={[0.3, 0.04, 0.02]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} toneMapped={false} />
        </mesh>
      ) : (currentExpression === "happy" || currentExpression === "normal" || currentExpression === "tickled") ? (
        <mesh position={[0, -0.2, 0.87]}>
          <boxGeometry args={[currentExpression === "tickled" ? 0.2 : 0.4, 0.05, 0.02]} />
          <meshStandardMaterial {...materials.eyeGlow} />
        </mesh>
      ) : null}

      {/* Cheek Blush (///) - Hidden when bored or angry */}
      {!isBored && currentExpression !== "angry" && (
        <>
          <group position={[-0.55, -0.15, 0.85]}>
            <mesh position={[-0.08, 0, 0]} rotation={[0, 0, Math.PI / 6]}><boxGeometry args={[0.02, 0.1, 0.02]} /><meshStandardMaterial {...materials.pinkBlush} /></mesh>
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 6]}><boxGeometry args={[0.02, 0.1, 0.02]} /><meshStandardMaterial {...materials.pinkBlush} /></mesh>
            <mesh position={[0.08, 0, 0]} rotation={[0, 0, Math.PI / 6]}><boxGeometry args={[0.02, 0.1, 0.02]} /><meshStandardMaterial {...materials.pinkBlush} /></mesh>
          </group>
          <group position={[0.55, -0.15, 0.85]}>
            <mesh position={[-0.08, 0, 0]} rotation={[0, 0, Math.PI / 6]}><boxGeometry args={[0.02, 0.1, 0.02]} /><meshStandardMaterial {...materials.pinkBlush} /></mesh>
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 6]}><boxGeometry args={[0.02, 0.1, 0.02]} /><meshStandardMaterial {...materials.pinkBlush} /></mesh>
            <mesh position={[0.08, 0, 0]} rotation={[0, 0, Math.PI / 6]}><boxGeometry args={[0.02, 0.1, 0.02]} /><meshStandardMaterial {...materials.pinkBlush} /></mesh>
          </group>
        </>
      )}
    </group>
  );
}

// Robot Arm Component (Poseable)
function RobotArm({ side = "left", isPointing = false, isTickled = false, isBored = false }: { side: "left" | "right", isPointing?: boolean, isTickled?: boolean, isBored?: boolean }) {
  const sign = side === "left" ? -1 : 1;
  const armRef = useRef<THREE.Group>(null);
  const forearmRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (armRef.current && forearmRef.current) {
      if (isTickled) {
        // Wiggle arms rapidly
        armRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 25) * 0.2 * sign + (side === "left" ? -0.5 : 0.5);
        armRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 20) * 0.2;
        forearmRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 15) * 0.2 - 0.5;
      } else if (isPointing && side === "right") {
        // Point forward naturally
        armRef.current.rotation.z = THREE.MathUtils.lerp(armRef.current.rotation.z, 0.2, 0.1);
        armRef.current.rotation.x = THREE.MathUtils.lerp(armRef.current.rotation.x, -Math.PI / 2.2, 0.1);
        forearmRef.current.rotation.x = THREE.MathUtils.lerp(forearmRef.current.rotation.x, -0.1, 0.1);
      } else if (isBored) {
        // Arms hanging straight down
        armRef.current.rotation.z = THREE.MathUtils.lerp(armRef.current.rotation.z, 0.1 * sign, 0.05);
        armRef.current.rotation.x = THREE.MathUtils.lerp(armRef.current.rotation.x, 0, 0.05);
        forearmRef.current.rotation.x = THREE.MathUtils.lerp(forearmRef.current.rotation.x, 0, 0.05);
      } else {
        // Dancing/Grooving motion (joget-joget)
        armRef.current.rotation.z = THREE.MathUtils.lerp(armRef.current.rotation.z, Math.sin(state.clock.elapsedTime * 3) * 0.2 * sign + (side === "left" ? -0.3 : 0.3), 0.1);
        armRef.current.rotation.x = THREE.MathUtils.lerp(armRef.current.rotation.x, Math.sin(state.clock.elapsedTime * 4 + (side === "left" ? 0 : Math.PI)) * 0.4 - 0.1, 0.1);
        // FOREARM NOW BENDS FORWARD: Changed positive Math.PI / 2.5 in original code to negative base rotation here (-0.5)
        forearmRef.current.rotation.x = THREE.MathUtils.lerp(forearmRef.current.rotation.x, Math.sin(state.clock.elapsedTime * 4 + (side === "left" ? 0 : Math.PI)) * 0.2 - 0.6, 0.1);
      }
    }
  });

  return (
    <group position={[sign * 1.1, 0.1, 0]} ref={armRef}>
      {/* Shoulder Joint */}
      <Sphere args={[0.25, 32, 32]} material={materials.metalJoints} />
      
      {/* Upper Arm */}
      <Cylinder args={[0.18, 0.15, 0.7]} position={[sign * 0.2, -0.3, 0]} rotation={[0, 0, sign * Math.PI / 6]} material={materials.whiteCeramic} />
      
      {/* Elbow Joint */}
      <Sphere args={[0.2, 32, 32]} position={[sign * 0.4, -0.6, 0]} material={materials.metalJoints} />
      
      {/* Lower Arm (Forearm & Hand) - Fixed rotation X to bend forward */}
      <group position={[sign * 0.4, -0.6, 0]} rotation={[-Math.PI / 4, 0, sign * -0.2]} ref={forearmRef}>
        <Cylinder args={[0.15, 0.1, 0.8]} position={[0, -0.4, 0]} rotation={[Math.PI, 0, 0]} material={materials.whiteCeramic} />
        
        {/* Hand Base */}
        <Sphere args={[0.18, 32, 32]} position={[0, -0.85, 0]} material={materials.emeraldBody} />
        
        {/* Fingers (More detailed articulated fingers) */}
        <group position={[0, -0.95, 0]} rotation={[Math.PI, 0, 0]}>
           {/* Thumb */}
           <Cylinder args={[0.03, 0.02, 0.2]} position={[sign * -0.15, 0.05, 0.05]} rotation={[0, 0, sign * 0.5]} material={materials.metalJoints} />
           {/* Index Finger */}
           <Cylinder args={[0.03, 0.02, 0.25]} position={[sign * -0.05, 0.15, 0.05]} material={materials.metalJoints} />
           {/* Middle Finger */}
           <Cylinder args={[0.03, 0.02, 0.28]} position={[sign * 0.05, 0.16, 0.05]} material={materials.metalJoints} />
           {/* Pinky */}
           <Cylinder args={[0.03, 0.02, 0.22]} position={[sign * 0.15, 0.13, 0.05]} material={materials.metalJoints} />
        </group>
      </group>
    </group>
  );
}

// Main Robot Character Body
function RobotCharacter({ expression, isPointing, isTickled, onRobotClick }: RobotProps) {
  const bodyRef = useRef<THREE.Group>(null);
  const [isBored, setIsBored] = React.useState(false);

  useFrame((state) => {
    // Check boredom (5 seconds of inactivity)
    const bored = typeof Date !== 'undefined' && (Date.now() - lastMouseMove) > 5000;
    if (bored !== isBored) setIsBored(bored);

    if (bodyRef.current) {
      if (isTickled) {
        // Body shakes when tickled
        bodyRef.current.position.y = Math.sin(state.clock.elapsedTime * 40) * 0.05;
        bodyRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 35) * 0.05;
        bodyRef.current.rotation.x = 0;
      } else if (isPointing) {
        // Body leans slightly when pointing
        bodyRef.current.rotation.z = THREE.MathUtils.lerp(bodyRef.current.rotation.z, -0.1, 0.1);
        bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, -0.1, 0.1);
        bodyRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;
      } else if (isBored) {
        // Slumped body when bored
        bodyRef.current.position.y = THREE.MathUtils.lerp(bodyRef.current.position.y, -0.2, 0.05);
        bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, 0.1, 0.05);
        bodyRef.current.rotation.z = THREE.MathUtils.lerp(bodyRef.current.rotation.z, 0, 0.05);
      } else {
        // Gentle bouncing for the whole body to simulate floating
        bodyRef.current.position.y = THREE.MathUtils.lerp(bodyRef.current.position.y, Math.sin(state.clock.elapsedTime * 2) * 0.1, 0.1);
        bodyRef.current.rotation.z = THREE.MathUtils.lerp(bodyRef.current.rotation.z, 0, 0.1);
        bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, 0, 0.1);
      }
    }
  });

  return (
    <group ref={bodyRef} onClick={(e) => { e.stopPropagation(); onRobotClick?.(); }} onPointerEnter={() => document.body.style.cursor = "pointer"} onPointerLeave={() => document.body.style.cursor = "default"}>
      <Float speed={isTickled || isBored ? 0 : 2} rotationIntensity={isTickled || isBored ? 0 : 0.2} floatIntensity={isTickled || isBored ? 0 : 0.5}>
        <RobotHead expression={expression as string} isTickled={isTickled} isBored={isBored} />

        {/* Neck */}
        <Cylinder args={[0.3, 0.4, 0.4]} position={[0, 0.3, 0]} material={isBored ? materials.metalJoints : materials.metalJoints} />

        {/* Torso/Body */}
        <group position={[0, -0.5, 0]}>
          {/* Main White Body */}
          <Cylinder args={[1.0, 0.8, 1.8, 32]} material={materials.whiteCeramic} />
          
          {/* Emerald Green Bottom Band */}
          <Cylinder args={[0.81, 0.6, 0.5, 32]} position={[0, -0.9, 0]} material={materials.emeraldBody} />
          
          {/* Bottom Thruster/Base */}
          <Sphere args={[0.55, 32, 16, 0, Math.PI * 2, 0.5, Math.PI]} position={[0, -1.05, 0]} rotation={[Math.PI, 0, 0]} material={materials.metalJoints} />

          {/* Chest Reactor Orb */}
          <group position={[0, 0.2, 1.01]}>
             <Cylinder args={[0.35, 0.35, 0.05, 32]} rotation={[Math.PI / 2, 0, 0]} material={materials.emeraldBody} />
             <Sphere args={[0.25, 32, 32]} position={[0, 0, 0.02]} material={isBored ? materials.tealAccent : materials.reactorGlow} />
          </group>

          {/* Arms */}
          <RobotArm side="left" isTickled={isTickled} isBored={isBored} />
          <RobotArm side="right" isPointing={isPointing} isTickled={isTickled} isBored={isBored} />
        </group>
      </Float>

      {/* Drop shadow / Hologram Stage below the robot */}
      {/* Lowered shadow position to avoid clipping */}
      <ContactShadows position={[0, -2.8, 0]} opacity={0.6} scale={isBored ? 5 : 6} blur={2.5} far={4} color="#10b981" />
    </group>
  );
}

// The main exported component that wraps the Canvas
export function ThreeDImoRobot({ expression = "normal", isPointing = false, isTickled = false, onRobotClick }: RobotProps) {
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      globalMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      globalMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      lastMouseMove = Date.now();
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    // Responsive container size for mobile (w-44 h-56) up to desktop (md:w-[28rem] md:h-[34rem])
    <div className="w-44 h-56 sm:w-64 sm:h-72 md:w-[28rem] md:h-[34rem] relative z-50 select-none -mb-4 md:-mb-8 pointer-events-none">
      {/* Adjusted camera distance (z: 8.5) and fov to fit the entire robot perfectly */}
      <Canvas camera={{ position: [0, -0.5, 8.5], fov: 42 }} dpr={[1, 1.2]} performance={{ min: 0.5 }} className="pointer-events-auto">
        {/* Lighting setup for glossy 3D look (Increased ambient light) */}
        <ambientLight intensity={1.2} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <directionalLight position={[-10, 5, -5]} intensity={0.5} />
        <pointLight position={[0, 0, 2]} intensity={0.8} color="#34d399" />
        
        {/* The 3D Robot Character */}
        <RobotCharacter expression={expression} isPointing={isPointing} isTickled={isTickled} onRobotClick={onRobotClick} />
        
        {/* Orbit controls allow user to drag and spin the 3D robot */}
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          minPolarAngle={Math.PI / 2 - 0.2} 
          maxPolarAngle={Math.PI / 2 + 0.2} 
          minAzimuthAngle={-Math.PI / 4} 
          maxAzimuthAngle={Math.PI / 4}
        />
      </Canvas>
    </div>
  );
}
