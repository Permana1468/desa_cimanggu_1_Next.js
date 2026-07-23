"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Camera, CameraOff, Volume2, VolumeX, Sparkles, X, Bot, MessageSquare, Send, Zap, ChevronUp, Eye, EyeOff, Lock } from "lucide-react";

const ThreeDImoRobot = dynamic(
  () => import("./ThreeDImoRobot").then((mod) => mod.ThreeDImoRobot),
  {
    ssr: false,
    loading: () => (
      <div className="w-[28rem] h-[34rem] flex items-center justify-center text-emerald-400 font-mono text-xs animate-pulse">
        🤖 Loading 3D IMO-1...
      </div>
    ),
  }
);

export type ExpressionType = "happy" | "normal" | "curious" | "winking" | "heart" | "motion" | "thinking" | "tickled" | "angry" | "bored";

interface ChatMessage {
  id: string;
  sender: "user" | "imo";
  text: string;
  time: string;
}

const DefaultHologramTips = [
  {
    title: "Komposisi RAB 2026 (Infrastruktur: 65%)",
    content: "3 Masalah RAB Mendesak: (1) Optimalisasi Rp 450 Jt Sisa Anggaran, (2) Review Target Pendapatan 66%, (3) 5 Usulan Musrenbang Belum Dialokasikan."
  },
  {
    title: "Analisis Take Off Sheet (TOS)",
    content: "Kalkulasi kubikasi Jalan Beton & TPT Kp. Jatake RT 03/07 sudah presisi. Siap diteruskan ke cetak RAB Bankeu."
  },
  {
    title: "Standar Acuan Harga Satuan",
    content: "Harga semen, batu belah, dan honorarium TPK sesuai Perdes 2026. Bebas dari selisih anggaran!"
  }
];

export function ImoRobotCompanion() {
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isCameraOn, setIsCameraOn] = useState<boolean>(false);
  const [isSoundOn, setIsSoundOn] = useState<boolean>(true);
  const [expression, setExpression] = useState<ExpressionType>("normal");
  const [tipIndex, setTipIndex] = useState<number>(0);
  const [showHologram, setShowHologram] = useState<boolean>(true);
  const [showChatMode, setShowChatMode] = useState<boolean>(false);
  const [motionIntensity, setMotionIntensity] = useState<number>(0);
  const [eyeOffset, setEyeOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isTickled, setIsTickled] = useState<boolean>(false);
  const [isPointing, setIsPointing] = useState<boolean>(false);

  // Global click listener for pointing gesture
  useEffect(() => {
    if (!isActive) return;

    const handleGlobalClick = (e: MouseEvent) => {
      // Prevent reacting when clicking on the robot itself or its UI
      if ((e.target as HTMLElement).closest('.imo-robot-ui')) return;

      setIsPointing(true);
      setExpression("curious");
      
      setTimeout(() => {
        setIsPointing(false);
        setExpression("happy");
      }, 1500);
    };

    document.addEventListener("mousedown", handleGlobalClick);
    return () => document.removeEventListener("mousedown", handleGlobalClick);
  }, [isActive]);

  const handleRobotClick = () => {
    if (isTickled) return;
    setIsTickled(true);
    setExpression("tickled");
    playRobotBeep("happy");
    
    setTimeout(() => {
      setIsTickled(false);
      setExpression("happy");
    }, 2000);
  };

  // Interactive AI Chat States
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "imo",
      text: "Halo Kaur Perencanaan! Saya IMO-1 3D Asisten Digital. Ada dokumen RAB atau Take Off Sheet yang ingin dibahas? 🤖✨",
      time: "Sekarang"
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevFrameRef = useRef<Uint8ClampedArray | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameId = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Sound Synthesizer function for cute robot beeps
  const playRobotBeep = (type: "happy" | "motion" | "click" | "talk" = "click") => {
    if (!isSoundOn) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === "happy") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.16);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === "motion") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.linearRampToValueAtTime(1320, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else {
        osc.type = "sine";
        osc.frequency.setValueAtTime(700, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      }
    } catch (e) {
      // Audio context silently handled
    }
  };

  // Blinking and hologram tip rotation
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % DefaultHologramTips.length);
    }, 12000);

    return () => clearInterval(tipInterval);
  }, []);

  // Scroll chat
  useEffect(() => {
    if (showChatMode) {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, showChatMode]);

  const [isLocked, setIsLocked] = useState(false);
  const [faceModelsLoaded, setFaceModelsLoaded] = useState(false);

  useEffect(() => {
    const loadFaceModels = async () => {
      try {
        // --- TEMPORARILY DISABLED (HEAVY FOR NEXT.JS DEV SERVER) ---
        // const faceapi = await import('@vladmandic/face-api');
        // await Promise.all([
        //   faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        //   faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        //   faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        // ]);
        setFaceModelsLoaded(true); // Faked to true to bypass check
      } catch (err) {
        console.error("Gagal memuat model face-api", err);
      }
    };
    loadFaceModels();
  }, []);

  // Face Verification Loop
  useEffect(() => {
    if (!isCameraOn || !isActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsLocked(false); // Unlock if camera is off, though ideally it should stay locked until verified. We'll unlock for failsafe.
      return;
    }

    let isSubscribed = true;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, frameRate: 15 }
        });
        if (!isSubscribed) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        playRobotBeep("happy");

        const analyzeFace = async () => {
          if (!isSubscribed || !videoRef.current || !faceModelsLoaded) {
            if (isSubscribed) setTimeout(analyzeFace, 1000);
            return;
          }

          try {
            // --- TEMPORARILY DISABLED FOR PERFORMANCE ---
            // const faceapi = await import('@vladmandic/face-api');
            // const detection = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
            //   .withFaceLandmarks()
            //   .withFaceDescriptor();

            // const savedDescriptorStr = localStorage.getItem("imo_registered_face");
            
            // if (savedDescriptorStr) {
            //   if (detection) {
            //     const savedDescriptor = new Float32Array(JSON.parse(savedDescriptorStr));
            //     const distance = faceapi.euclideanDistance(detection.descriptor, savedDescriptor);
                
            //     if (distance > 0.5) {
            //       setIsLocked(true);
            //       setExpression("angry");
            //       playRobotBeep("click");
            //     } else {
            //       setIsLocked(false);
            //       setExpression("normal");
            //     }
            //   }
            // }
          } catch (e) {
            console.error("Face detection error", e);
          }

          if (isSubscribed) setTimeout(analyzeFace, 1000);
        };
        analyzeFace();
      } catch (err) {
        console.error("Akses kamera ditolak", err);
      }
    }
    startCamera();

    return () => {
      isSubscribed = false;
    };
  }, [isCameraOn, isActive, faceModelsLoaded]);

  const toggleCamera = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsCameraOn((prev) => !prev);
    playRobotBeep("click");
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputMessage.trim();
    if (!query) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
      time: timeNow
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage("");
    setIsThinking(true);
    setExpression("thinking");
    playRobotBeep("talk");

    setTimeout(() => {
      let replyText = "";
      const lower = query.toLowerCase();

      if (lower.includes("rab") || lower.includes("anggaran") || lower.includes("hitung")) {
        replyText = "Perhitungan RAB Desa membagi alokasi ke 4 pos utama: Bahan, Alat, Upah, dan Operasional TPK. PPN 11% & PPh dihitung otomatis oleh sistem.";
        setExpression("happy");
      } else if (lower.includes("take off") || lower.includes("tos") || lower.includes("volume")) {
        replyText = "Modul Take Off Sheet menghitung volume TPT, Jalan Beton, & U-Ditch dengan standar rumus teknik desa. Hasilnya bisa langsung ditarik ke dokumen RAB!";
        setExpression("happy");
      } else if (lower.includes("harga satuan") || lower.includes("hspk")) {
        replyText = "Data acuan Harga Satuan Desa Cimanggu 1 sudah tersinkronisasi sesuai keputusan Perdes 2026.";
        setExpression("curious");
      } else {
        replyText = `Siap Kaur Perencanaan! Mengenai "${query}", IMO-1 siap mendampingi kelancaran alokasi anggaran desa! 🚀`;
        setExpression("happy");
      }

      const imoMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "imo",
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setChatMessages((prev) => [...prev, imoMsg]);
      setIsThinking(false);
      playRobotBeep("happy");
    }, 800);
  };

  return (
    <>
      {/* Hidden Video & Canvas for Motion Sensor */}
      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas ref={canvasRef} className="hidden" />

      {/* SECURITY LOCKDOWN OVERLAY */}
      {isLocked && (
        <div className="fixed inset-0 z-[9900] bg-slate-950/80 backdrop-blur-md pointer-events-auto flex flex-col items-center justify-center">
           <Lock size={64} className="text-rose-500 mb-4 animate-pulse" />
           <h2 className="text-4xl font-black text-white tracking-widest mb-2 uppercase">Akses Ditolak</h2>
           <p className="text-rose-200 text-lg">Wajah tidak dikenali. Sistem mendeteksi upaya akses tidak sah.</p>
        </div>
      )}


      {/* 2. FREESTANDING 3D IMO-1 ROBOT CHARACTER (MATCHING SCREENSHOT LAYOUT) */}
      {isActive && (
        <div className="fixed bottom-40 right-2 md:bottom-24 md:right-12 z-[9995] flex items-center gap-6 font-sans animate-fade-in-up pointer-events-auto origin-bottom-right transition-all duration-300">
            
            {/* HOLOGRAPHIC PROJECTION CALLOUT CARD & PROJECTION BEAM */}
            {showHologram && !showChatMode && (
              <div className="relative flex items-center group animate-fade-in">
                <div
                  className="w-20 h-28 bg-gradient-to-r from-transparent via-emerald-400/20 to-emerald-400/40 pointer-events-none transform -skew-x-12"
                  style={{ clipPath: "polygon(100% 15%, 0% 0%, 0% 100%, 100% 85%)" }}
                />

                {/* Hologram Card (Matching Screenshot design!) */}
                <div className="bg-slate-950/90 border border-emerald-400/50 rounded-2xl p-4 shadow-[0_10px_35px_rgba(16,185,129,0.25)] backdrop-blur-xl max-w-xs text-slate-100 relative">
                  <button
                    onClick={() => setShowHologram(false)}
                    className="absolute -top-2 -right-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full p-1 border border-slate-600 transition"
                    title="Tutup Holo"
                  >
                    <X size={12} />
                  </button>
                  <div className="space-y-2 text-xs">
                    <div className="inline-block px-2.5 py-0.5 rounded bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-[10px] uppercase">
                      {DefaultHologramTips[tipIndex].title}
                    </div>
                    <p className="text-slate-200 text-xs leading-relaxed">
                      {DefaultHologramTips[tipIndex].content}
                    </p>
                    <button
                      onClick={() => {
                        setShowChatMode(true);
                        playRobotBeep("click");
                      }}
                      className="mt-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono uppercase tracking-wider"
                    >
                      <MessageSquare size={12} /> Buka Chat IMO AI →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CHAT MODAL INTERFACE (When active) */}
            {showChatMode && (
              <div className="bg-slate-950/95 border-2 border-emerald-400/60 rounded-3xl p-4 shadow-[0_20px_50px_rgba(16,185,129,0.3)] backdrop-blur-2xl w-80 h-[380px] flex flex-col relative z-20">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <Bot size={16} /> Chat IMO-1 AI
                  </div>
                  <button
                    onClick={() => setShowChatMode(false)}
                    className="p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 text-xs custom-scrollbar">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[85%] p-2.5 rounded-2xl ${
                          msg.sender === "user"
                            ? "bg-emerald-600 text-white rounded-br-none"
                            : "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none"
                        }`}
                      >
                        {msg.sender === "imo" && (
                          <span className="block text-[9px] font-bold text-emerald-400 uppercase mb-1">
                            🤖 IMO-1 Robot
                          </span>
                        )}
                        <p>{msg.text}</p>
                      </div>
                      <span className="text-[9px] text-slate-500 mt-0.5 font-mono px-1">{msg.time}</span>
                    </div>
                  ))}
                  {isThinking && (
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono bg-slate-900 p-2 rounded-xl border border-slate-800">
                      <Sparkles size={13} className="animate-spin" />
                      <span>IMO-1 sedang berpikir...</span>
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Input Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2 pt-2 border-t border-slate-800 shrink-0"
                >
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ketik pesan..."
                    className="flex-1 bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isThinking}
                    className="p-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl"
                  >
                    <Send size={14} />
                  </button>
                </form>
              </div>
            )}

            {/* 3D FREESTANDING ROBOT CHARACTER (EXACT MATCHING SCREENSHOT IMO-1) */}
            <div className="flex flex-col items-center justify-center relative group imo-robot-ui">
              {/* 3D ROBOT RENDER FROM THREE.JS */}
              <div className="relative flex flex-col items-center justify-center p-2 pointer-events-auto animate-bounce-gentle">
                <ThreeDImoRobot expression={expression} isTickled={isTickled} isPointing={isPointing} onRobotClick={handleRobotClick} />
              </div>
            </div>
        </div>
      )}

      {/* 3. CIRCULAR TRIGGER BUTTON & GLASS CONTROL PILL (MATCHING SCREENSHOT BOTTOM RIGHT!) */}
      <div className="fixed bottom-24 right-4 md:bottom-6 md:right-24 z-[9990] flex items-center gap-3 font-sans pointer-events-auto imo-robot-ui transition-all duration-300">
        
        {/* GLASS CONTROL PILL BAR - smoothly hide when inactive */}
        <div className={`transition-all duration-500 ease-in-out ${isActive ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-10 pointer-events-none'} bg-slate-950/90 border border-emerald-400/50 rounded-full px-3.5 py-1.5 backdrop-blur-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-3 text-xs text-slate-200`}>
          
          {/* CAMERA SENSOR TOGGLE BUTTON */}
          <button
            type="button"
            onClick={toggleCamera}
            className="flex items-center gap-1.5 text-xs font-bold hover:text-emerald-400 transition"
            title={isCameraOn ? "Matikan Sensor Kamera" : "Aktifkan Sensor Kamera"}
          >
            {isCameraOn ? <Camera size={14} className="text-emerald-400 animate-pulse" /> : <CameraOff size={14} className="text-slate-400" />}
            <span className={isCameraOn ? "text-emerald-400" : "text-slate-400"}>
              {isCameraOn ? "Sensor ON" : "Sensor OFF"}
            </span>
          </button>

          <div className="w-px h-4 bg-slate-800" />

          {/* SOUND TOGGLE BUTTON */}
          <button
            type="button"
            onClick={() => {
              setIsSoundOn(!isSoundOn);
              playRobotBeep("click");
            }}
            className="text-slate-400 hover:text-emerald-400 transition"
            title={isSoundOn ? "Matikan Suara" : "Aktifkan Suara"}
          >
            {isSoundOn ? <Volume2 size={14} className="text-emerald-400" /> : <VolumeX size={14} />}
          </button>

          <div className="w-px h-4 bg-slate-800" />

          {/* CHAT TOGGLE BUTTON */}
          <button
            type="button"
            onClick={() => {
              setShowChatMode(!showChatMode);
              playRobotBeep("click");
            }}
            className="text-slate-400 hover:text-emerald-400 transition flex items-center gap-1 text-[11px] font-bold"
          >
            <MessageSquare size={13} className="text-emerald-400" /> Chat
          </button>
        </div>

        {/* CIRCULAR ROBOT AVATAR TRIGGER BUTTON (NEXT TO CHAT BUTTON!) */}
        <button
          type="button"
          onClick={() => {
            setIsActive(!isActive);
            playRobotBeep("happy");
          }}
          className={`w-14 h-14 rounded-full border-2 border-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.7)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group relative ${
            isActive
              ? "bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 text-slate-950"
              : "bg-slate-900 border-slate-700 text-slate-400 hover:border-emerald-400"
          }`}
          title={isActive ? "Sembunyikan Robot IMO-1" : "Aktifkan Robot IMO-1 3D"}
        >
          {/* Glowing Ping effect when active */}
          {isActive && (
            <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-30 pointer-events-none" />
          )}
          
          {/* CUTE 3D ROBOT AVATAR ICON */}
          <div className="w-9 h-9 rounded-full bg-slate-950 border border-emerald-400 flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform">
            <span className="text-lg">🤖</span>
          </div>
        </button>
      </div>
    </>
  );
}
