import React from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  size?: number;
  animated?: boolean;
}

export default function Logo({ className = "", size = 48, animated = false }: LogoProps) {
  return (
    <div
      className={`relative flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/images/logo_emblem.png"
        alt="Nyaya AI Logo"
        width={size}
        height={size}
        className={`object-contain ${animated ? "animate-pulse" : ""}`}
        priority
      />
    </div>
  );
}
