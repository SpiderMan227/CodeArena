"use client";

import React, { useEffect, useState, useMemo } from "react";
import { cn } from "../../lib/utils";

interface PerspectiveGridProps {
    /** Additional CSS classes for the grid container */
    className?: string;
    /** Number of tiles per row/column (default: 40) */
    gridSize?: number;
    /** Whether to show the gradient overlay (default: true) */
    showOverlay?: boolean;
    /** Fade radius percentage for the gradient overlay (default: 80) */
    fadeRadius?: number;
}

export function PerspectiveGrid({
    className,
    gridSize = 40,
    showOverlay = true,
    fadeRadius = 92,
}: PerspectiveGridProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Memoize tiles array to prevent unnecessary re-renders
    const tiles = useMemo(() => Array.from({ length: gridSize * gridSize }), [gridSize]);

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
        const colors = [
            "rgba(49, 46, 129, 0.4)",   // Dark Indigo (indigo-900)
            "rgba(88, 28, 135, 0.4)",   // Dark Purple (purple-900)
            "rgba(136, 19, 55, 0.4)",   // Dark Rose (rose-900)
            "rgba(6, 78, 59, 0.4)",     // Dark Emerald (emerald-900)
            "rgba(120, 53, 4, 0.4)",    // Dark Amber (amber-900)
            "rgba(22, 78, 99, 0.4)",    // Dark Cyan (cyan-900)
            "rgba(131, 24, 67, 0.4)"    // Dark Pink (pink-900)
        ];
        const borderColors = [
            "rgba(49, 46, 129, 0.6)",
            "rgba(88, 28, 135, 0.6)",
            "rgba(136, 19, 55, 0.6)",
            "rgba(6, 78, 59, 0.6)",
            "rgba(120, 53, 4, 0.6)",
            "rgba(22, 78, 99, 0.6)",
            "rgba(131, 24, 67, 0.6)"
        ];
        const randIdx = Math.floor(Math.random() * colors.length);
        const target = e.currentTarget;

        // Apply background color instantly without transition
        target.style.transition = "none";
        target.style.backgroundColor = colors[randIdx];
        target.style.borderColor = borderColors[randIdx];
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.currentTarget;

        // Apply smooth transition when fading out
        target.style.transition = "background-color 1500ms ease, border-color 1500ms ease";
        target.style.backgroundColor = "transparent";
        target.style.borderColor = "rgba(99, 102, 241, 0.1)"; // Reset to default border color
    };

    return (
        <div
            className={cn(
                "relative w-full h-full overflow-hidden bg-[#07070a]",
                className
            )}
            style={{
                perspective: "2000px",
                transformStyle: "preserve-3d",
            }}
        >
            {/* Ambient glows behind the grid */}
            <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[80px] pointer-events-none" />

            <div
                className="absolute w-[95rem] aspect-square grid origin-center"
                style={{
                    left: "50%",
                    top: "50%",
                    transform:
                        "translate(-50%, -50%) rotateX(30deg) rotateY(-5deg) rotateZ(20deg) scale(2)",
                    transformStyle: "preserve-3d",
                    gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                    gridTemplateRows: `repeat(${gridSize}, 1fr)`,
                }}
            >
                {/* Tiles */}
                {mounted &&
                    tiles.map((_, i) => (
                        <div
                            key={i}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            className="min-h-[1px] min-w-[1px] border border-indigo-500/10 bg-transparent cursor-crosshair"
                        />
                    ))}
            </div>

            {/* Radial Gradient Mask (Overlay) */}
            {showOverlay && (
                <div
                    className="absolute inset-0 pointer-events-none z-10"
                    style={{
                        background: `radial-gradient(circle, transparent 40%, #07070a ${fadeRadius}%)`,
                    }}
                />
            )}
        </div>
    );
}

export default PerspectiveGrid;
