"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProgressRing } from "./progress-ring";
import { useEffect, useState } from "react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  progress?: number; // 0-100
  trend?: {
    value: number;
    isPositive: boolean;
  };
  delay?: number; // Animation delay in ms
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  progress,
  trend,
  delay = 0,
  className,
}: StatCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border p-6",
        "bg-card border-border",
        // Sharp geometry with layered shadows
        "shadow-[0_1px_2px_rgb(0,0,0,0.04),0_4px_12px_rgb(0,0,0,0.03)]",
        "hover:shadow-[0_4px_8px_rgb(0,0,0,0.06),0_12px_24px_rgb(0,0,0,0.04)]",
        "dark:shadow-none dark:hover:shadow-none",
        // Spring physics animation
        "transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
        "hover:scale-[1.02] hover:-translate-y-1",
        // Entrance animation
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Content */}
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          {/* Icon with rotation on hover */}
          <div
            className={cn(
              "mb-4 inline-flex p-3 rounded-lg transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
              "group-hover:scale-110 group-hover:rotate-6",
              "bg-muted"
            )}
          >
            <Icon className="h-6 w-6 text-foreground transition-colors" />
          </div>

          {/* Title */}
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            {title}
          </p>

          {/* Value */}
          <p className="text-3xl font-bold text-card-foreground tracking-tight">
            {value}
          </p>

          {/* Trend */}
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={cn(
                  "text-xs font-semibold",
                  trend.isPositive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-muted-foreground">vs. ontem</span>
            </div>
          )}
        </div>

        {/* Progress Ring */}
        {progress !== undefined && (
          <div className="flex-shrink-0">
            <ProgressRing
              progress={progress}
              size={60}
              strokeWidth={4}
              showPercentage={true}
            />
          </div>
        )}
      </div>

      {/* Reduced motion support */}
      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          .group {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}

