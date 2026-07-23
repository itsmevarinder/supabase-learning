"use client";

import { useRef } from "react";
import type { LucideIcon } from "lucide-react";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap/config";

gsap.registerPlugin(DrawSVGPlugin);

interface DrawIconProps {
  icon: LucideIcon;
  className?: string;
  delay?: number;
  duration?: number;
  repeatDelay?: number;
  /**
   * For icons styled with a `fill-*` class (e.g. filled rating stars): the
   * fill instantly shows the whole shape regardless of stroke progress, so
   * the draw would otherwise be invisible. When true, the fill starts
   * transparent and fades in right as the stroke finishes tracing —
   * "outline traces, then fills in."
   */
  revealFill?: boolean;
}

/**
 * Traces a Lucide icon's actual strokes continuously, like a pen drawing it
 * over and over — the icon stays exactly the same shape, nothing morphs.
 * Lucide icons are usually built from several separate <path>/<circle>
 * elements (not one path with multiple disconnected "M" segments), so each
 * one draws in sequence at a consistent speed (duration proportional to its
 * own length) rather than all segments revealing at once — then the whole
 * icon redraws from scratch, forever.
 */
export default function DrawIcon({
  icon: Icon,
  className,
  delay = 0,
  duration = 1.8,
  repeatDelay = 0.6,
  revealFill = false,
}: DrawIconProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const svg = svgRef.current;
      if (!svg) return;

      const shapes = Array.from(
        svg.querySelectorAll<SVGGeometryElement>("path, circle, line, polyline, polygon, rect")
      );
      if (!shapes.length) return;

      if (prefersReducedMotion()) {
        gsap.set(shapes, { drawSVG: "100%", fillOpacity: 1 });
        return;
      }

      gsap.set(shapes, { drawSVG: "0%", ...(revealFill ? { fillOpacity: 0 } : null) });

      const totalLength = shapes.reduce((sum, shape) => sum + shape.getTotalLength(), 0);
      const tl = gsap.timeline({ delay, repeat: -1, repeatDelay });
      shapes.forEach((shape) => {
        tl.to(shape, {
          drawSVG: "100%",
          ease: "none",
          duration: duration * (shape.getTotalLength() / totalLength),
        });
      });
      if (revealFill) {
        tl.to(shapes, { fillOpacity: 1, duration: 0.3, ease: "power1.out" }, "-=0.3");
      }
    },
    { scope: svgRef }
  );

  return <Icon ref={svgRef} className={className} />;
}
