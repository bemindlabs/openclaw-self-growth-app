import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 32, showText = true }) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Person silhouette — head */}
        <circle
          cx="16"
          cy="8"
          r="3.5"
          fill="var(--color-primary)"
        />
        {/* Person silhouette — body reaching upward */}
        <path
          d="M16 11.5V22"
          stroke="var(--color-primary)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Arms raised */}
        <path
          d="M16 15C16 15 12 12 10 13"
          stroke="var(--color-primary)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M16 15C16 15 20 12 22 13"
          stroke="var(--color-primary)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Legs */}
        <path
          d="M16 22L12.5 27"
          stroke="var(--color-primary)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M16 22L19.5 27"
          stroke="var(--color-primary)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Leaf — right */}
        <path
          d="M22 8C22 8 25 5 27 6C29 7 26 10 26 10"
          stroke="var(--color-success)"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="var(--color-success)"
          fillOpacity="0.25"
        />
        {/* Leaf — left */}
        <path
          d="M10 8C10 8 7 5 5 6C3 7 6 10 6 10"
          stroke="var(--color-success)"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="var(--color-success)"
          fillOpacity="0.25"
        />
        {/* Small sprout from head */}
        <path
          d="M16 4.5V2.5"
          stroke="var(--color-success)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M16 3C16 3 17.5 1.5 19 2"
          stroke="var(--color-success)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M16 3.5C16 3.5 14.5 2 13 2.5"
          stroke="var(--color-success)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-lg tracking-tight">
            <span className="text-primary">Self</span>
            <span className="text-success">Growth</span>
          </span>
        </div>
      )}
    </div>
  );
};
