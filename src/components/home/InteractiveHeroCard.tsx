'use client';

import React, { useRef, useState } from 'react';

interface InteractiveHeroCardProps {
  onTap?: () => void;
  cardName?: string;
  cardRole?: string;
}

export default function InteractiveHeroCard({
  onTap,
  cardName = 'Your Name',
  cardRole = 'Your digital business card',
}: InteractiveHeroCardProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLButtonElement>(null);
  const [ripples, setRipples] = useState<Array<{ id: number }>>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!sceneRef.current || !cardRef.current || e.pointerType === 'touch') return;
    const bounds = sceneRef.current.getBoundingClientRect();
    const x = (e.clientX - bounds.left) / bounds.width - 0.5;
    const y = (e.clientY - bounds.top) / bounds.height - 0.5;

    cardRef.current.style.setProperty('--rx', `${-y * 22}deg`);
    cardRef.current.style.setProperty('--ry', `${x * 30}deg`);
  };

  const handlePointerLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.setProperty('--rx', '-8deg');
    cardRef.current.style.setProperty('--ry', '-16deg');
  };

  const handleCardClick = () => {
    const id = Date.now();
    setRipples((prev) => [...prev, { id }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 1000);

    setToastMessage('NFC Tap Simulated — Digital profile opens instantly!');
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);

    if (onTap) {
      onTap();
    }
  };

  return (
    <div
      ref={sceneRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative min-h-[420px] sm:min-h-[460px] w-full flex items-center justify-center [perspective:1000px] select-none py-6"
      aria-label="Interactive NFC card demo"
    >
      {/* Background radial halo glow */}
      <div
        className="absolute w-[320px] sm:w-[380px] h-[320px] sm:h-[380px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(217, 171, 150, 0.45) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Floating Badges */}
      <div
        className="absolute z-10 top-8 left-2 sm:left-4 px-3 py-2 rounded-xl border border-white/70 bg-[#faf7f3]/80 backdrop-blur-md text-[#75675b] text-[11px] font-medium shadow-md pointer-events-none animate-[float_4s_ease-in-out_infinite]"
        aria-hidden="true"
      >
        <span className="text-[#995b40] mr-1.5 font-bold">●</span> Contactless NFC tap
      </div>

      <div
        className="absolute z-10 top-40 -right-2 sm:right-2 px-3 py-2 rounded-xl border border-white/70 bg-[#faf7f3]/80 backdrop-blur-md text-[#75675b] text-[11px] font-medium shadow-md pointer-events-none animate-[float_4s_ease-in-out_infinite] [animation-delay:-2s]"
        aria-hidden="true"
      >
        <span className="text-[#995b40] mr-1.5 font-bold">✓</span> Your digital identity
      </div>

      <div
        className="absolute z-10 bottom-8 left-4 sm:left-8 px-3 py-2 rounded-xl border border-white/70 bg-[#faf7f3]/80 backdrop-blur-md text-[#75675b] text-[11px] font-medium shadow-md pointer-events-none animate-[float_4s_ease-in-out_infinite] [animation-delay:-1s]"
        aria-hidden="true"
      >
        <span className="text-[#995b40] mr-1.5 font-bold">↗</span> Instant phone connect
      </div>

      {/* Tap Ripples */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute w-[260px] h-[260px] rounded-full border border-[#995b40]/60 pointer-events-none animate-[ripple_1s_ease-out_forwards]"
          aria-hidden="true"
        />
      ))}

      {/* 3D Realistic Card */}
      <button
        ref={cardRef}
        type="button"
        onClick={handleCardClick}
        aria-label="Interactive NFC card - Click to test tap"
        className="relative w-[235px] sm:w-[245px] h-[345px] sm:h-[355px] p-7 rounded-[22px] border border-white/80 text-left cursor-pointer text-[#fff9f2] shadow-[20px_30px_50px_rgba(84,66,54,0.22),inset_1px_1px_0_rgba(255,255,255,0.9),inset_-1px_-1px_0_rgba(48,39,34,0.3)] transition-transform duration-200 ease-out overflow-hidden focus:outline-none focus-visible:ring-4 focus-visible:ring-[#995b40]"
        style={{
          background: 'linear-gradient(115deg, #f5e9db 0%, #c5b3a4 25%, #8c7e74 53%, #45403e 100%)',
          transform: 'rotateX(var(--rx, -8deg)) rotateY(var(--ry, -16deg))',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Animated Sheen sweep effect */}
        <div
          className="absolute -inset-full pointer-events-none animate-[sheen_7s_ease-in-out_infinite]"
          style={{
            background: 'linear-gradient(110deg, transparent 42%, rgba(255, 255, 255, 0.35) 50%, transparent 58%)',
          }}
          aria-hidden="true"
        />

        {/* Top Header of Card */}
        <div className="flex justify-between items-center text-base font-bold tracking-tight">
          <span className="font-serif italic text-lg">tap.</span>
          <svg
            className="w-7 h-7 opacity-90"
            viewBox="0 0 32 32"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M11 12a7 7 0 0 1 0 8" />
            <path d="M16 8a13 13 0 0 1 0 16" />
            <path d="M21 4a19 19 0 0 1 0 24" />
          </svg>
        </div>

        {/* Realistic EMV / NFC metallic chip */}
        <div
          className="absolute left-7 bottom-24 w-10 h-12 rounded-lg border border-[#665345]/50 overflow-hidden shadow-inner"
          style={{
            background: `
              linear-gradient(90deg, transparent 30%, rgba(102,83,69,0.45) 31%, transparent 33%, transparent 65%, rgba(102,83,69,0.45) 66%, transparent 68%),
              linear-gradient(transparent 31%, rgba(102,83,69,0.45) 32%, transparent 34%, transparent 65%, rgba(102,83,69,0.45) 66%, transparent 68%),
              linear-gradient(135deg, rgba(213,197,172,0.8), rgba(161,138,112,0.8))
            `,
          }}
          aria-hidden="true"
        />

        {/* Bottom Details of Card */}
        <div className="absolute bottom-7 left-7 right-7">
          <span className="block font-medium text-base sm:text-lg tracking-wide text-white drop-shadow-sm truncate">
            {cardName}
          </span>
          <span className="block mt-1 text-[10px] tracking-[2px] opacity-80 uppercase font-semibold text-[#f5e9db] truncate">
            {cardRole}
          </span>
        </div>
      </button>

      {/* Hint underneath */}
      <span className="absolute -bottom-1 text-[11px] font-semibold tracking-wider text-[#89817b] uppercase pointer-events-none">
        Move to Explore · Click to Tap
      </span>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-[#484640] text-white text-xs font-semibold shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
