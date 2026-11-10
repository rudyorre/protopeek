import React from 'react';
import { cn } from '@/lib/utils';

interface ProtoPeekLogoProps {
  className?: string;
  size?: number;
  /**
   * Accent palette token:
   * - 'sky' (default): ProtoPeek's signature sky/cyan wire accent (#38bdf8)
   * - 'amber': Natural accentId=2 (#fbbf24) from FNV-1a+Murmur3 hash of "protopeek"
   */
  accent?: 'sky' | 'amber';
}

/**
 * Static one-time procedural SVG glyph generated via rudyorre.com's
 * `renderProceduralGlyph({ seed: "protopeek" })` (src/lib/glyph-engine.ts):
 * - Seed: "protopeek" -> FNV-1a + MurmurHash3 = 0x0C92EFA1 (210956193)
 * - Family 3 (`iso-stack` — Isometric System Planes):
 *   3 tilted axonometric strata with parallel-slice subdivisions,
 *   vertical data bus (layer 2), and -11° yaw
 * - Registration Grid 1 (`octagonal target`)
 */
export function ProtoPeekLogo({
  className,
  size = 32,
  accent = 'sky',
}: ProtoPeekLogoProps) {
  const accentHex = accent === 'amber' ? '#fbbf24' : '#38bdf8';

  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 64 64'
      xmlns='http://www.w3.org/2000/svg'
      className={cn(
        'shrink-0 rounded-[6px] border border-slate-800/90 bg-[#131720] shadow-sm',
        className
      )}
      aria-hidden='true'
    >
      <rect width='64' height='64' fill='#131720' />
      {/* Registration Grid 1: Octagonal Target */}
      <g stroke='#222836' strokeWidth='1' fill='none'>
        <line x1='0' y1='32.0' x2='64' y2='32.0' />
        <line x1='32.0' y1='0' x2='32.0' y2='64' />
        <line x1='9.0' y1='9.0' x2='55.0' y2='55.0' strokeDasharray='1.5 2.5' />
        <line x1='55.0' y1='9.0' x2='9.0' y2='55.0' strokeDasharray='1.5 2.5' />
        <rect x='9.0' y='9.0' width='46.0' height='46.0' rx='3.0' />
      </g>
      {/* Family 3: Isometric System Planes (seed="protopeek", hash=0x0C92EFA1) */}
      <g transform='rotate(-11 32.0 32.0)' strokeLinejoin='round'>
        <line
          x1='12.0'
          y1='23.0'
          x2='11.4'
          y2='41.0'
          stroke='#8a8982'
          strokeWidth='1'
          strokeDasharray='2 2'
          opacity='0.45'
        />
        <line
          x1='52.0'
          y1='23.0'
          x2='52.6'
          y2='41.0'
          stroke='#8a8982'
          strokeWidth='1'
          strokeDasharray='2 2'
          opacity='0.45'
        />
        <g>
          <polygon
            points='32.0,33.0 52.6,41.0 32.0,49.0 11.4,41.0'
            fill={accentHex}
            fillOpacity='0.2'
            stroke={accentHex}
            strokeWidth='1.5'
          />
          <g stroke={accentHex} strokeWidth='0.85' opacity='0.55'>
            <line x1='18.4' y1='38.4' x2='38.8' y2='46.3' />
            <line x1='25.2' y1='35.7' x2='45.6' y2='43.6' />
          </g>
        </g>
        <g>
          <polygon
            points='32.0,24.1 52.5,32.0 32.0,39.9 11.5,32.0'
            fill='#131720'
            fillOpacity='0.84'
            stroke='#94a3b8'
            strokeWidth='1.15'
          />
        </g>
        <g>
          <polygon
            points='32.0,15.3 52.0,23.0 32.0,30.7 12.0,23.0'
            fill='#131720'
            fillOpacity='0.84'
            stroke='#94a3b8'
            strokeWidth='1.15'
          />
          <g stroke='#94a3b8' strokeWidth='0.85' opacity='0.55'>
            <line x1='18.8' y1='20.5' x2='38.6' y2='28.1' />
            <line x1='25.4' y1='17.9' x2='45.2' y2='25.5' />
          </g>
        </g>
        <line
          x1='32.0'
          y1='19.0'
          x2='32.0'
          y2='45.0'
          stroke={accentHex}
          strokeWidth='1.5'
        />
        <circle cx='32.0' cy='23.0' r='2.2' fill={accentHex} />
        <circle
          cx='32.0'
          cy='41.0'
          r='2.6'
          fill='#131720'
          stroke={accentHex}
          strokeWidth='1.5'
        />
      </g>
    </svg>
  );
}
