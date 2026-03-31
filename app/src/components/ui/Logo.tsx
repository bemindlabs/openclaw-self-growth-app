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
        {/* Brain/Cloud Shape */}
        <path
          d="M24 18C24 21.3137 21.3137 24 18 24H14C10.6863 24 8 21.3137 8 18C8 14.6863 10.6863 12 14 12C14 8.68629 16.6863 6 20 6C23.3137 6 26 8.68629 26 12C28.2091 12 30 13.7909 30 16C30 18.2091 28.2091 20 26 20"
          fill="var(--color-primary)"
          fillOpacity="0.2"
        />
        <path
          d="M24 18C24 21.3137 21.3137 24 18 24H14C10.6863 24 8 21.3137 8 18C8 14.6863 10.6863 12 14 12C14 8.68629 16.6863 6 20 6C23.3137 6 26 8.68629 26 12C28.2091 12 30 13.7909 30 16C30 18.2091 28.2091 20 26 20"
          stroke="var(--color-primary)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Growth Sprout */}
        <path
          d="M16 24V18"
          stroke="var(--color-success)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M16 18C16 18 17 15 20 15"
          stroke="var(--color-success)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M16 19C16 19 15 17 13 17"
          stroke="var(--color-success)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Brain Details */}
        <path
          d="M14 16C14 16 15 15 16 15"
          stroke="var(--color-primary)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.5"
        />
        <path
          d="M20 11C20 11 21 12 22 12"
          stroke="var(--color-primary)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>
      
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-lg tracking-tight">
            <span className="text-primary">Bemind</span>
            <span className="text-success">Growth</span>
          </span>
        </div>
      )}
    </div>
  );
};
