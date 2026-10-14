'use client';

import React, { useRef, useState } from 'react';

interface RealisticBlackCardProps {
  side?: 'right' | 'left';
  className?: string;
  onTap?: () => void;
}

export default function RealisticBlackCard({
  side = 'right',
  className = '',
  onTap,
}: RealisticBlackCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hoverTilt, setHoverTilt] = useState({ rx: 0, ry: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [toast, setToast] = useState(false);

  // Default rest rotation based on side
  const baseRotateX = 12;
  const baseRotateY = side === 'right' ? -18 : 18;
  const baseRotateZ = side === 'right' ? 3 : -3;

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current || e.pointerType === 'touch') return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setHoverTilt({
      rx: -y * 14,
      ry: x * 16,
    });
  };

  const handlePointerEnter = () => setIsHovered(true);
  const handlePointerLeave = () => {
    setIsHovered(false);
    setHoverTilt({ rx: 0, ry: 0 });
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 800);

    setToast(true);
    setTimeout(() => setToast(false), 2200);

    if (onTap) onTap();
  };

  const currentRotateX = baseRotateX + (isHovered ? hoverTilt.rx : 0);
  const currentRotateY = baseRotateY + (isHovered ? hoverTilt.ry : 0);
  const currentRotateZ = baseRotateZ;

  return (
    <div
      className={`relative w-full flex items-center justify-center [perspective:1200px] select-none py-6 ${className}`}
    >
      {/* Dynamic floor shadow beneath the card matching the reference image */}
      <div
        className="absolute w-[290px] sm:w-[360px] h-[45px] rounded-full pointer-events-none transition-all duration-300 ease-out"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.22) 42%, rgba(0, 0, 0, 0.05) 70%, transparent 85%)',
          transform: `translate3d(${side === 'right' ? '25px' : '-25px'}, 120px, 0) scale(${
            isHovered ? 1.05 : 1
          })`,
          filter: 'blur(14px)',
        }}
        aria-hidden="true"
      />

      {/* 3D Horizontal Credit Card (Landscape ratio ~1.58 : 1) */}
      <div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
        className="relative z-10 w-[300px] sm:w-[380px] h-[190px] sm:h-[240px] rounded-[20px] sm:rounded-[24px] cursor-pointer will-change-transform"
        style={{
          transform: isHovered
            ? `translate3d(0, -6px, 0) rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg) rotateZ(${currentRotateZ}deg) scale(1.02)`
            : undefined,
          animation: !isHovered
            ? side === 'right'
              ? 'cardFloat 5s ease-in-out infinite'
              : 'cardFloatLeft 5s ease-in-out infinite'
            : 'none',
          transformStyle: 'preserve-3d',
          transition: isHovered
            ? 'transform 0.1s ease-out'
            : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        role="button"
        tabIndex={0}
        aria-label="Interactive Black NFC Card"
      >
        {/* Card Physical Body - Deep Matte Black Texture with Metallic Edge Highlight */}
        <div
          className="relative w-full h-full rounded-[20px] sm:rounded-[24px] p-6 sm:p-7 flex flex-col justify-between overflow-hidden border border-neutral-800"
          style={{
            background:
              'linear-gradient(135deg, #17171a 0%, #0d0d0f 40%, #050506 100%)',
            boxShadow:
              side === 'right'
                ? `
                  22px 30px 45px -10px rgba(0, 0, 0, 0.5),
                  10px 15px 25px -8px rgba(0, 0, 0, 0.3),
                  inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.22),
                  inset 0 -1px 1px 0 rgba(0, 0, 0, 0.9)
                `
                : `
                  -22px 30px 45px -10px rgba(0, 0, 0, 0.5),
                  -10px 15px 25px -8px rgba(0, 0, 0, 0.3),
                  inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.22),
                  inset 0 -1px 1px 0 rgba(0, 0, 0, 0.9)
                `,
          }}
        >
          {/* Subtle Fine Grain Overlay */}
          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay"
            style={{
              backgroundImage:
                'radial-gradient(rgba(255, 255, 255, 0.6) 1px, transparent 1px)',
              backgroundSize: '3px 3px',
            }}
          />

          {/* Sweeping Metallic Glow / Light Reflection from the edge */}
          <div
            className="absolute -inset-full pointer-events-none"
            style={{
              background:
                'linear-gradient(105deg, transparent 38%, rgba(255, 255, 255, 0.25) 48%, rgba(255, 255, 255, 0.4) 50%, rgba(255, 255, 255, 0.25) 52%, transparent 62%)',
              animation: 'metallicGlow 6s ease-in-out infinite',
            }}
            aria-hidden="true"
          />

          {/* Interactive Mouse Hover Highlight */}
          {isHovered && (
            <div
              className="absolute -inset-full pointer-events-none transition-opacity duration-200"
              style={{
                background: `radial-gradient(circle 280px at ${
                  50 + hoverTilt.ry * 3
                }% ${
                  50 - hoverTilt.rx * 3
                }%, rgba(255, 255, 255, 0.18) 0%, transparent 60%)`,
              }}
              aria-hidden="true"
            />
          )}

          {/* Ripple on tap */}
          {ripples.map((r) => (
            <span
              key={r.id}
              className="absolute rounded-full pointer-events-none border border-white/50 animate-[ripple_0.8s_ease-out_forwards]"
              style={{
                left: r.x - 60,
                top: r.y - 60,
                width: 120,
                height: 120,
              }}
              aria-hidden="true"
            />
          ))}

          {/* Top Right: NFC Wireless Waves symbol (Exact match to reference) */}
          <div className="flex justify-end items-start w-full relative z-10">
            <svg
              className="w-7 h-7 sm:w-8 sm:h-8 text-white/95 drop-shadow-sm"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M7.5 4.21a12 12 0 0 1 0 15.58" />
              <path d="M11.5 7.21a7 7 0 0 1 0 9.58" />
              <path d="M15.5 10.21a2.5 2.5 0 0 1 0 3.58" />
            </svg>
          </div>

          {/* Bottom Left: "NFC Card" text (Exact match to reference) */}
          <div className="relative z-10 mt-auto">
            <span className="font-space-grotesk font-medium text-lg sm:text-xl text-white tracking-normal drop-shadow-sm">
              NFC Card
            </span>
          </div>
        </div>
      </div>

      {/* Tap toast notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-neutral-900 text-white text-xs font-medium shadow-xl border border-neutral-700 animate-in fade-in slide-in-from-bottom-2">
          Contactless NFC Tap Triggered
        </div>
      )}
    </div>
  );
}
