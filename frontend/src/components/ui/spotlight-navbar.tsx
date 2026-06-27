'use client';

import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import gsap from "gsap";
import { cn } from "../../lib/utils";

export interface NavItem {
    label: string;
    href: string;
    onClick?: (e: React.MouseEvent) => void;
}

export interface SpotlightNavbarProps {
    items?: NavItem[];
    className?: string;
    onItemClick?: (item: NavItem, index: number) => void;
}

export function SpotlightNavbar({
    items = [],
    className,
    onItemClick,
}: SpotlightNavbarProps) {
    const navRef = useRef<HTMLDivElement>(null);
    const location = useLocation();
    const [activeIndex, setActiveIndex] = useState(0);
    const [hoverX, setHoverX] = useState<number | null>(null);

    // Refs for the highlight positions to animate them imperatively
    const spotlightX = useRef(0);
    const ambienceX = useRef(0);

    // Determine the active item based on current URL path
    useEffect(() => {
        const currentPath = location.pathname;
        const index = items.findIndex(item => {
            if (item.href === '/dashboard' && currentPath === '/dashboard') return true;
            if (item.href !== '/dashboard' && item.href !== '/' && currentPath.startsWith(item.href)) return true;
            return false;
        });
        if (index !== -1) {
            setActiveIndex(index);
        }
    }, [location.pathname, items]);

    // Handle mouse move to update custom property --spotlight-x
    useEffect(() => {
        if (!navRef.current) return;
        const nav = navRef.current;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = nav.getBoundingClientRect();
            const x = e.clientX - rect.left;
            setHoverX(x);
            spotlightX.current = x;
            nav.style.setProperty("--spotlight-x", `${x}px`);
        };

        const handleMouseLeave = () => {
            setHoverX(null);
            // When mouse leaves, animate spotlight back to active item
            const activeItem = nav.querySelector(`[data-index="${activeIndex}"]`);
            if (activeItem) {
                const navRect = nav.getBoundingClientRect();
                const itemRect = activeItem.getBoundingClientRect();
                const targetX = itemRect.left - navRect.left + itemRect.width / 2;

                gsap.to(nav, {
                    "--spotlight-x": `${targetX}px`,
                    duration: 0.35,
                    ease: "power2.out",
                    overwrite: "auto",
                    onUpdate: () => {
                        const val = parseFloat(nav.style.getPropertyValue("--spotlight-x"));
                        if (!isNaN(val)) spotlightX.current = val;
                    }
                });
            }
        };

        nav.addEventListener("mousemove", handleMouseMove);
        nav.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            nav.removeEventListener("mousemove", handleMouseMove);
            nav.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [activeIndex]);

    // Animate active state ambience light to current index
    useEffect(() => {
        if (!navRef.current) return;
        const nav = navRef.current;
        const activeItem = nav.querySelector(`[data-index="${activeIndex}"]`);

        if (activeItem) {
            const navRect = nav.getBoundingClientRect();
            const itemRect = activeItem.getBoundingClientRect();
            const targetX = itemRect.left - navRect.left + itemRect.width / 2;

            gsap.to(nav, {
                "--ambience-x": `${targetX}px`,
                duration: 0.5,
                ease: "elastic.out(1, 0.75)",
                overwrite: "auto",
                onUpdate: () => {
                    const val = parseFloat(nav.style.getPropertyValue("--ambience-x"));
                    if (!isNaN(val)) ambienceX.current = val;
                }
            });
        }
    }, [activeIndex]);

    const handleItemClick = (item: NavItem, index: number) => {
        setActiveIndex(index);
        onItemClick?.(item, index);
    };

    return (
        <div className={cn("relative flex justify-center", className)}>
            <nav
                ref={navRef}
                className={cn(
                    "border border-zinc-800/40 bg-zinc-950/80 backdrop-blur-md shadow-lg shadow-black/40",
                    "relative h-11 rounded-full transition-all duration-300 overflow-hidden flex items-center"
                )}
                style={{
                    // Indigo-purple branded highlights
                    "--spotlight-color": "rgba(99, 102, 241, 0.12)",
                    "--ambience-color": "rgba(99, 102, 241, 1)"
                } as React.CSSProperties}
            >
                {/* Navigation Menu List */}
                <ul className="relative flex items-center h-full px-2 gap-1.5 z-10 list-none m-0 p-0">
                    {items.map((item, idx) => {
                        const isActive = activeIndex === idx;
                        const itemClass = cn(
                            "px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors duration-300 rounded-full select-none outline-none focus:ring-1 focus:ring-indigo-500/30",
                            isActive
                                ? "text-white"
                                : "text-slate-400 hover:text-slate-200"
                        );

                        return (
                            <li key={idx} className="relative h-full flex items-center justify-center">
                                {item.onClick ? (
                                    <button
                                        data-index={idx}
                                        onClick={(e) => {
                                            handleItemClick(item, idx);
                                            item.onClick?.(e);
                                        }}
                                        className={cn(itemClass, "bg-transparent border-none cursor-pointer")}
                                    >
                                        {item.label}
                                    </button>
                                ) : (
                                    <Link
                                        to={item.href}
                                        data-index={idx}
                                        onClick={() => handleItemClick(item, idx)}
                                        className={itemClass}
                                    >
                                        {item.label}
                                    </Link>
                                )}
                            </li>
                        );
                    })}
                </ul>

                {/* 1. Spotlight Light Follower (Mouse Move) */}
                <div
                    className="pointer-events-none absolute bottom-0 left-0 w-full h-full z-0 opacity-0 transition-opacity duration-300"
                    style={{
                        opacity: hoverX !== null ? 1 : 0,
                        background: `
                            radial-gradient(
                                80px circle at var(--spotlight-x) 100%, 
                                var(--spotlight-color) 0%, 
                                transparent 60%
                            )
                        `
                    }}
                />

                {/* 2. Ambience Glow Indicator (Active Item) */}
                <div
                    className="pointer-events-none absolute bottom-0 left-0 w-full h-[3px] z-0"
                    style={{
                        background: `
                            radial-gradient(
                                50px circle at var(--ambience-x) 100%, 
                                var(--ambience-color) 0%, 
                                transparent 100%
                            )
                        `
                    }}
                />
            </nav>
        </div>
    );
}
