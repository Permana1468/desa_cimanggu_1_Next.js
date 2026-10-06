"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface ThreeScannerKioskProps {
  scanInput: string;
  setScanInput: (val: string) => void;
  onScanSubmit: (e: React.FormEvent) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export default function ThreeScannerKiosk({
  scanInput,
  setScanInput,
  onScanSubmit,
  inputRef
}: ThreeScannerKioskProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 440;
    const height = container.clientHeight || 580;

    // SCENE
    const scene = new THREE.Scene();

    // CAMERA (Centered & Pulled Back so entire Tugu Monument from base to crown fits 100%)
    const aspect = width / height;
    const camera = new THREE.PerspectiveCamera(34, aspect, 0.1, 1000);
    camera.position.set(0, 2.8, 14.2);
    camera.lookAt(0, 2.4, 0);

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // LIGHTING SYSTEM
    const ambientLight = new THREE.AmbientLight(0xf0f9ff, 1.4);
    scene.add(ambientLight);

    // Main Key Light
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.7);
    keyLight.position.set(7, 14, 10);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // Rim Light
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    rimLight.position.set(-7, 9, -6);
    scene.add(rimLight);

    // Cyan Hologram Point Light
    const hologramLight = new THREE.PointLight(0x06b6d4, 4.2, 6);
    hologramLight.position.set(0, 1.8, 0.4);
    scene.add(hologramLight);

    // Lens Eye Cyan Glow
    const lensLight = new THREE.PointLight(0x38bdf8, 3.2, 5);
    lensLight.position.set(0, 3.2, 0.9);
    scene.add(lensLight);

    // -----------------------------------------------------------
    // MATERIALS
    // -----------------------------------------------------------
    const darkSteelMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.85,
      roughness: 0.25
    });

    const lightSteelMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.6,
      roughness: 0.3
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.9,
      roughness: 0.2
    });

    const cyanGlowMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4
    });

    const cyanNeonMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8
    });

    const laserMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.85
    });

    const holoBeamMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });

    // -----------------------------------------------------------
    // MONUMENT ASSEMBLY GROUP
    // -----------------------------------------------------------
    const monument = new THREE.Group();
    // Shifted down so base and top crown fit 100% inside canvas
    monument.position.set(0, -1.1, 0);

    // 1. MULTI-TIERED MECHANICAL BASE PLATFORM
    const baseBottomGeo = new THREE.CylinderGeometry(2.3, 2.4, 0.2, 48);
    const baseBottom = new THREE.Mesh(baseBottomGeo, darkSteelMat);
    baseBottom.position.y = 0.1;
    baseBottom.receiveShadow = true;
    monument.add(baseBottom);

    const baseMidGeo = new THREE.CylinderGeometry(2.0, 2.15, 0.35, 48);
    const baseMid = new THREE.Mesh(baseMidGeo, lightSteelMat);
    baseMid.position.y = 0.35;
    baseMid.castShadow = true;
    baseMid.receiveShadow = true;
    monument.add(baseMid);

    const baseTopGeo = new THREE.CylinderGeometry(1.75, 1.85, 0.3, 48);
    const baseTop = new THREE.Mesh(baseTopGeo, darkSteelMat);
    baseTop.position.y = 0.65;
    monument.add(baseTop);

    // Plasma Cell Tube on Base Front
    const plasmaTubeGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.1, 16);
    const plasmaTube = new THREE.Mesh(plasmaTubeGeo, cyanNeonMat);
    plasmaTube.rotation.z = Math.PI / 2;
    plasmaTube.position.set(0, 0.35, 2.05);
    monument.add(plasmaTube);

    // Base Bolts Around Rim
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const boltGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.2, 12);
      const bolt = new THREE.Mesh(boltGeo, darkSteelMat);
      bolt.position.set(Math.cos(angle) * 2.2, 0.2, Math.sin(angle) * 2.2);
      monument.add(bolt);
    }

    // 2. MAIN TOWER BODY PILLAR
    const pillarGeo = new THREE.BoxGeometry(2.2, 4.4, 1.6);
    const pillar = new THREE.Mesh(pillarGeo, lightSteelMat);
    pillar.position.set(0, 2.9, 0);
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    monument.add(pillar);

    // Tower Outer Metallic Armor Edges
    const armorLeftGeo = new THREE.BoxGeometry(0.2, 4.4, 1.65);
    const armorLeft = new THREE.Mesh(armorLeftGeo, darkSteelMat);
    armorLeft.position.set(-1.15, 2.9, 0);
    monument.add(armorLeft);

    const armorRightGeo = new THREE.BoxGeometry(0.2, 4.4, 1.65);
    const armorRight = new THREE.Mesh(armorRightGeo, darkSteelMat);
    armorRight.position.set(1.15, 2.9, 0);
    monument.add(armorRight);

    // 3. ROTATING SIDE GEARS (Mechanical Cogs)
    const gearGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 12);
    const gear1 = new THREE.Mesh(gearGeo, goldMat);
    gear1.rotation.x = Math.PI / 2;
    gear1.position.set(-1.26, 4.0, 0.2);
    monument.add(gear1);

    const gear2 = new THREE.Mesh(gearGeo, darkSteelMat);
    gear2.rotation.x = Math.PI / 2;
    gear2.position.set(-1.26, 3.2, 0.2);
    monument.add(gear2);

    // Right Side Radiator Fins
    for (let f = 0; f < 5; f++) {
      const finGeo = new THREE.BoxGeometry(0.12, 0.08, 0.8);
      const fin = new THREE.Mesh(finGeo, darkSteelMat);
      fin.position.set(1.26, 2.5 + f * 0.25, 0);
      monument.add(fin);
    }

    // Vertical Cyan Light Strips
    const stripLeftGeo = new THREE.BoxGeometry(0.06, 2.2, 0.06);
    const stripLeft = new THREE.Mesh(stripLeftGeo, cyanNeonMat);
    stripLeft.position.set(-1.0, 3.4, 0.83);
    monument.add(stripLeft);

    const stripRight = new THREE.Mesh(stripLeftGeo, cyanNeonMat);
    stripRight.position.set(1.0, 3.4, 0.83);
    monument.add(stripRight);

    // 4. UPPER SECTION: HEADER PLATE & QR DISPLAY SCREEN
    const plateGeo = new THREE.BoxGeometry(2.1, 0.45, 0.1);
    const plate = new THREE.Mesh(plateGeo, darkSteelMat);
    plate.position.set(0, 4.7, 0.81);
    monument.add(plate);

    // QR DISPLAY CANVAS TEXTURE
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 512, 512);

      // Cyan Border Frame
      ctx.strokeStyle = "#06b6d4";
      ctx.lineWidth = 18;
      ctx.strokeRect(16, 16, 480, 480);

      // QR Pattern
      ctx.fillStyle = "#0f172a";
      // Top Left Corner
      ctx.fillRect(60, 60, 110, 110);
      ctx.fillStyle = "#ffffff"; ctx.fillRect(82, 82, 66, 66);
      ctx.fillStyle = "#0f172a"; ctx.fillRect(102, 102, 26, 26);

      // Top Right Corner
      ctx.fillRect(342, 60, 110, 110);
      ctx.fillStyle = "#ffffff"; ctx.fillRect(364, 82, 66, 66);
      ctx.fillStyle = "#0f172a"; ctx.fillRect(384, 102, 26, 26);

      // Bottom Left Corner
      ctx.fillRect(60, 342, 110, 110);
      ctx.fillStyle = "#ffffff"; ctx.fillRect(82, 364, 66, 66);
      ctx.fillStyle = "#0f172a"; ctx.fillRect(102, 384, 26, 26);

      // Grid Pattern
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (Math.random() > 0.4) {
            ctx.fillRect(190 + c * 18, 60 + r * 18, 14, 14);
          }
          if (Math.random() > 0.4) {
            ctx.fillRect(60 + c * 18, 190 + r * 18, 14, 14);
          }
          if (Math.random() > 0.45) {
            ctx.fillRect(190 + c * 22, 190 + r * 22, 18, 18);
          }
        }
      }
    }

    const qrTexture = new THREE.CanvasTexture(canvas);
    const screenMat = new THREE.MeshBasicMaterial({ map: qrTexture });
    const screenGeo = new THREE.PlaneGeometry(1.6, 1.6);
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(0, 3.65, 0.81);
    monument.add(screenMesh);

    // Laser Beam Line on Screen
    const laserGeo = new THREE.PlaneGeometry(1.6, 0.06);
    const laserMesh = new THREE.Mesh(laserGeo, laserMat);
    laserMesh.position.set(0, 3.65, 0.82);
    monument.add(laserMesh);

    // 5. MIDDLE SECTION: 3D SCANNER CAMERA LENS EYE
    const lensFrameGeo = new THREE.TorusGeometry(0.48, 0.1, 16, 32);
    const lensFrame = new THREE.Mesh(lensFrameGeo, darkSteelMat);
    lensFrame.position.set(0, 2.45, 0.81);
    monument.add(lensFrame);

    const lensInnerGeo = new THREE.SphereGeometry(0.38, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const lensInnerMat = new THREE.MeshStandardMaterial({
      color: 0x0891b2,
      metalness: 0.9,
      roughness: 0.1
    });
    const lensInner = new THREE.Mesh(lensInnerGeo, lensInnerMat);
    lensInner.rotation.x = Math.PI / 2;
    lensInner.position.set(0, 2.45, 0.81);
    monument.add(lensInner);

    // Glowing Center Aperture
    const centerApertureGeo = new THREE.SphereGeometry(0.15, 16, 16);
    const centerAperture = new THREE.Mesh(centerApertureGeo, cyanGlowMat);
    centerAperture.position.set(0, 2.45, 0.93);
    monument.add(centerAperture);

    // 6. LOWER SECTION: HOLOGRAM CHAMBER & FLOATING 3D EMBLEM
    const holoBaseGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.08, 32);
    const holoBase = new THREE.Mesh(holoBaseGeo, cyanNeonMat);
    holoBase.position.set(0, 1.05, 0.4);
    monument.add(holoBase);

    // Hologram Cone Beam Light
    const holoConeGeo = new THREE.ConeGeometry(0.65, 1.0, 32, 1, true);
    const holoCone = new THREE.Mesh(holoConeGeo, holoBeamMat);
    holoCone.position.set(0, 1.55, 0.4);
    monument.add(holoCone);

    // FLOATING HOLOGRAPHIC 3D EMBLEM CREST
    const holoGroup = new THREE.Group();

    // Crest Outer Ring
    const crestRingGeo = new THREE.TorusGeometry(0.32, 0.04, 16, 32);
    const crestRing = new THREE.Mesh(crestRingGeo, cyanNeonMat);
    holoGroup.add(crestRing);

    // Crest "1" Badge
    const badgeGeo = new THREE.BoxGeometry(0.12, 0.35, 0.06);
    const badge = new THREE.Mesh(badgeGeo, cyanGlowMat);
    holoGroup.add(badge);

    // Hologram Wings
    const wingLGeo = new THREE.BoxGeometry(0.28, 0.12, 0.04);
    const wingL = new THREE.Mesh(wingLGeo, cyanNeonMat);
    wingL.position.set(-0.25, 0.1, 0);
    wingL.rotation.z = Math.PI / 6;
    holoGroup.add(wingL);

    const wingR = new THREE.Mesh(wingLGeo, cyanNeonMat);
    wingR.position.set(0.25, 0.1, 0);
    wingR.rotation.z = -Math.PI / 6;
    holoGroup.add(wingR);

    holoGroup.position.set(0, 1.6, 0.4);
    monument.add(holoGroup);

    // 7. MAJESTIC TOP CROWN: OFFICIAL LOGO-DESA 2026.png 3D RENDERED EMBLEM
    const topCapGeo = new THREE.BoxGeometry(2.3, 0.3, 1.6);
    const topCap = new THREE.Mesh(topCapGeo, darkSteelMat);
    topCap.position.set(0, 5.25, 0);
    monument.add(topCap);

    // Antennas on Top Corners
    const antLGeo = new THREE.CylinderGeometry(0.03, 0.04, 0.6, 12);
    const antL = new THREE.Mesh(antLGeo, darkSteelMat);
    antL.position.set(-0.95, 5.6, 0.55);
    monument.add(antL);

    const antLTip = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), cyanNeonMat);
    antLTip.position.set(-0.95, 5.9, 0.55);
    monument.add(antLTip);

    const antR = new THREE.Mesh(antLGeo, darkSteelMat);
    antR.position.set(0.95, 5.6, 0.55);
    monument.add(antR);

    const antRTip = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), cyanNeonMat);
    antRTip.position.set(0.95, 5.9, 0.55);
    monument.add(antRTip);

    // Center Turbine Fan
    const turbineGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.12, 24);
    const turbine = new THREE.Mesh(turbineGeo, darkSteelMat);
    turbine.rotation.x = Math.PI / 2;
    turbine.position.set(0, 5.5, 0.55);
    monument.add(turbine);

    // -----------------------------------------------------------
    // 3D LOGO EMBLEM CROWN: LOAD LOGO-DESA 2026.png
    // -----------------------------------------------------------
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('/images/LOGO-DESA 2026.png', (logoTexture) => {
      logoTexture.colorSpace = THREE.SRGBColorSpace;

      const crownGroup = new THREE.Group();

      // Outer Golden Ring Bezel Frame
      const bezelGeo = new THREE.TorusGeometry(0.8, 0.08, 16, 48);
      const bezel = new THREE.Mesh(bezelGeo, goldMat);
      crownGroup.add(bezel);

      // Backing Disc Frame
      const backDiscGeo = new THREE.CylinderGeometry(0.78, 0.78, 0.08, 48);
      const backDisc = new THREE.Mesh(backDiscGeo, darkSteelMat);
      backDisc.rotation.x = Math.PI / 2;
      crownGroup.add(backDisc);

      // Front Logo Plane
      const logoGeo = new THREE.CircleGeometry(0.74, 48);
      const logoMat = new THREE.MeshBasicMaterial({
        map: logoTexture,
        transparent: true,
        side: THREE.DoubleSide
      });
      const logoFront = new THREE.Mesh(logoGeo, logoMat);
      logoFront.position.z = 0.05;
      crownGroup.add(logoFront);

      // Back Logo Plane
      const logoBack = logoFront.clone();
      logoBack.position.z = -0.05;
      logoBack.rotation.y = Math.PI;
      crownGroup.add(logoBack);

      // Glowing Aura Halo Behind Logo
      const haloGeo = new THREE.RingGeometry(0.8, 1.1, 32);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.z = 0;
      crownGroup.add(halo);

      crownGroup.position.set(0, 6.4, 0);
      monument.add(crownGroup);
    });

    scene.add(monument);

    // -----------------------------------------------------------
    // ANIMATION LOOP (OSCILLATING LEFT & RIGHT)
    // -----------------------------------------------------------
    let animFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);

      const t = clock.getElapsedTime();

      // Moving Laser Line Up & Down across QR Screen
      laserMesh.position.y = 3.65 + Math.sin(t * 2.8) * 0.72;

      // Rotating Side Gears
      gear1.rotation.z = t * 1.2;
      gear2.rotation.z = -t * 1.2;

      // Floating & Rotating Hologram 3D Emblem Crest
      holoGroup.rotation.y = t * 1.8;
      holoGroup.position.y = 1.6 + Math.sin(t * 2.5) * 0.08;

      // Subtle breathing float for the monument
      monument.position.y = -1.1 + Math.sin(t * 1.2) * 0.04;

      // OSCILLATING ROTATION: Sweeps gently left, pauses, sweeps right (Sine Wave Oscillation)
      monument.rotation.y = Math.sin(t * 0.8) * 0.42;

      renderer.render(scene, camera);
    };

    animate();

    // RESIZE HANDLER
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth || 440;
      const h = containerRef.current.clientHeight || 580;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[460px] sm:min-h-[540px] flex items-center justify-center">
      {/* THREE.JS WEBGL CANVAS CONTAINER */}
      <div ref={containerRef} className="w-full h-full flex items-center justify-center overflow-visible" />

      {/* FLOATING SCAN INPUT OVERLAY AT BASE OF MONUMENT */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-30 w-full max-w-[280px] px-2">
        <form onSubmit={onScanSubmit} className="w-full">
          <input
            ref={inputRef}
            type="text"
            value={scanInput}
            onChange={(e) => setScanInput(e.target.value)}
            placeholder="Ketik/Scan Barcode ID..."
            className="w-full bg-slate-950/90 border-2 border-cyan-400 rounded-2xl px-4 py-2 text-xs font-mono font-black text-center text-cyan-300 shadow-2xl focus:outline-none focus:border-cyan-300 backdrop-blur-md transition-all placeholder:text-slate-500"
          />
        </form>
      </div>
    </div>
  );
}
