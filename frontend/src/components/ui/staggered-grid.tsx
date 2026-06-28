'use client'
import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cn } from '../../lib/utils'
import { Code2, Cpu, Database, Shield, Sparkles, Terminal, FileCode, Layers, Globe } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export interface BentoItem {
    id: number | string
    title: string
    subtitle: string
    description: string
    icon: React.ReactNode
    content?: React.ReactNode
    image?: string
}

export interface StaggeredGridProps {
    images: string[]
    bentoItems: BentoItem[]
    centerText?: string
    credits?: {
        madeBy: { text: string; href: string }
        moreDemos: { text: string; href: string }
    }
    className?: string
    showFooter?: boolean
    scroller?: string | Element | Window | null
}

export function StaggeredGrid({
    images,
    bentoItems,
    centerText = "CodeFlow",
    credits = {
        madeBy: { text: "CodeFlow", href: "#" },
        moreDemos: { text: "Built with GSAP", href: "https://greensock.com/" }
    },
    className,
    showFooter = false,
    scroller
}: StaggeredGridProps) {
    const [isLoaded, setIsLoaded] = useState(false)
    const gridFullRef = useRef<HTMLDivElement>(null)
    const textRef = useRef<HTMLDivElement>(null)

    // Bento Grid State
    const [activeBento, setActiveBento] = useState<number>(0);

    const splitText = (text: string) => {
        return text.split('').map((char, i) => (
            <span key={i} className="char inline-block" style={{ willChange: 'transform' }}>{char === ' ' ? '\u00A0' : char}</span>
        ))
    }

    useEffect(() => {
        const handleLoad = () => {
            document.body.classList.remove('loading')
            setIsLoaded(true)
        }

        const elements = document.querySelectorAll('.grid__item-img')
        if (elements.length === 0) {
            handleLoad()
            return
        }

        let loadedCount = 0
        const total = elements.length

        const checkDone = () => {
            loadedCount++
            if (loadedCount >= total) {
                handleLoad()
            }
        }

        elements.forEach((el) => {
            // Check computed background-image style
            const style = window.getComputedStyle(el)
            const bgImg = style.backgroundImage

            if (bgImg && bgImg !== 'none') {
                const matches = bgImg.match(/url\((['"]?)(.*?)\1\)/)
                if (matches && matches[2]) {
                    const url = matches[2]
                    const img = new Image()
                    img.src = url
                    if (img.complete) {
                        checkDone()
                    } else {
                        img.addEventListener('load', checkDone)
                        img.addEventListener('error', checkDone)
                    }
                    return
                }
            }

            // Fallback for regular image elements inside
            const img = el.querySelector('img')
            if (img) {
                if (img.complete) {
                    checkDone()
                } else {
                    img.addEventListener('load', checkDone)
                    img.addEventListener('error', checkDone)
                }
            } else {
                checkDone()
            }
        })
    }, [])

    useEffect(() => {
        if (!isLoaded) return

        // Animate Text Element
        if (textRef.current) {
            const chars = textRef.current.querySelectorAll('.char')
            gsap.timeline({
                scrollTrigger: {
                    trigger: textRef.current,
                    scroller: scroller || undefined,
                    start: 'top bottom',
                    end: 'center center-=25%',
                    scrub: 1,
                }
            })
                .from(chars, {
                    ease: 'sine.out',
                    yPercent: 300,
                    autoAlpha: 0,
                    stagger: {
                        each: 0.05,
                        from: 'center'
                    }
                })
        }

        // Animate Full Grid
        if (gridFullRef.current) {
            const gridFullItems = gridFullRef.current.querySelectorAll('.grid__item')
            const numColumns = 7
            const middleColumnIndex = 3

            const columns: Element[][] = Array.from({ length: numColumns }, () => [])
            gridFullItems.forEach((item: any) => {
                const colAttr = item.getAttribute('data-col');
                const columnIndex = colAttr !== null ? parseInt(colAttr, 10) : 0;
                if (columns[columnIndex]) {
                    columns[columnIndex].push(item)
                }
            })

            columns.forEach((columnItems, columnIndex) => {
                const delayFactor = Math.abs(columnIndex - middleColumnIndex) * 0.2

                gsap.timeline({
                    scrollTrigger: {
                        trigger: gridFullRef.current,
                        scroller: scroller || undefined,
                        start: 'top bottom',
                        end: 'center center',
                        scrub: 1.5,
                    }
                })
                    .from(columnItems, {
                        yPercent: 200,
                        autoAlpha: 0,
                        delay: delayFactor,
                        ease: 'sine.out',
                    })
                    .from(columnItems.map(item => item.querySelector('.grid__item-img')), {
                        transformOrigin: '50% 0%',
                        ease: 'sine.out',
                    }, 0)
            })

            const bentoContainer = gridFullRef.current.querySelector('.bento-container')

            if (bentoContainer) {
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: gridFullRef.current,
                        scroller: scroller || undefined,
                        start: 'top top+=15%',
                        end: 'bottom center',
                        scrub: 1,
                        invalidateOnRefresh: true,
                    }
                })

                tl.to(bentoContainer, {
                    y: window.innerHeight * 0.05,
                    scale: 1.15,
                    zIndex: 1000,
                    ease: 'power2.out',
                    duration: 1,
                    force3D: true
                }, 0)
            }
        }
    }, [isLoaded])

    // Prepare grid items: fill up to the end of Row 3 (21 slots)
    const mixedGridItems: (string | 'BENTO_GROUP')[] = Array.from({ length: 21 }, (_, i) => images[i % images.length]);

    // Replace the slot where we want the bento group (index 16 = Row 3, columns 3-5)
    mixedGridItems[16] = 'BENTO_GROUP';

    return (
        <div
            className={cn("shadow relative overflow-hidden w-full", className)}
            style={{
                '--grid-item-translate': '0px',
            } as React.CSSProperties}
        >
            <section className="grid place-items-center w-full relative mt-[6vh]">
                <div ref={textRef} className="text font-extrabold uppercase flex content-center text-[clamp(2.5rem,10vw,8rem)] leading-[0.8] text-slate-900 dark:text-slate-100 select-none tracking-tight">
                    {splitText(centerText)}
                </div>
            </section>

            <section className="grid place-items-center w-full relative">
                <div ref={gridFullRef} className="grid--full relative w-full my-[6vh] h-auto aspect-[1.4] max-w-none p-4 grid gap-4 grid-cols-7 grid-rows-5 max-sm:aspect-[0.8] max-sm:grid-cols-2 max-sm:grid-rows-10">
                    <div className="grid-overlay absolute inset-0 z-[15] pointer-events-none opacity-0 bg-white/80 dark:bg-black/80 rounded-lg transition-opacity duration-500" />
                    {mixedGridItems.map((item, i) => {
                        if (item === 'BENTO_GROUP') {
                            if (!bentoItems || bentoItems.length === 0) return null;

                            return (
                                <div key="bento-group" data-col={3} className="grid__item bento-container col-span-3 row-span-1 relative z-20 flex items-center justify-center gap-2.5 h-full w-full will-change-transform max-sm:col-span-2">
                                    {bentoItems.map((bentoItem, index) => {
                                        const isActive = activeBento === index;
                                        return (
                                            <div
                                                key={bentoItem.id}
                                                className={cn(
                                                    "relative cursor-pointer overflow-hidden rounded-2xl h-full transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]",
                                                    isActive
                                                        ? "bg-zinc-900/10 shadow-2xl"
                                                        : "bg-zinc-950 hover:bg-zinc-900"
                                                )}
                                                style={{ width: isActive ? "55%" : "15%" }}
                                                onMouseEnter={() => setActiveBento(index)}
                                                onClick={() => setActiveBento(index)}
                                            >
                                                {/* Border Overlay */}
                                                <div className={cn(
                                                    "absolute inset-0 rounded-2xl border z-50 pointer-events-none transition-colors duration-700",
                                                    isActive
                                                        ? "border-indigo-500/50"
                                                        : "border-zinc-800/50 hover:border-zinc-700"
                                                )} />

                                                {/* Content Container */}
                                                <div className="relative z-10 w-full h-full flex flex-col p-0">
                                                    {/* Active State Content */}
                                                    <div className={cn(
                                                        "absolute inset-0 flex flex-col transition-all duration-500 ease-in-out",
                                                        isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                                                    )}>
                                                        {/* Image - Full Coverage */}
                                                        <div className="absolute inset-0 bg-zinc-900 overflow-hidden z-0">
                                                            {bentoItem.image && (
                                                                <>
                                                                    <img
                                                                        src={bentoItem.image}
                                                                        alt={bentoItem.title}
                                                                        className="absolute inset-0 w-full h-full object-cover opacity-30 transition-transform duration-700 hover:scale-105"
                                                                    />
                                                                    <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/80 to-transparent pointer-events-none" />
                                                                </>
                                                            )}
                                                        </div>

                                                        {/* Footer Row */}
                                                        <div className="absolute bottom-0 left-0 w-full flex flex-col justify-end p-4 z-20">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <div className="flex flex-col">
                                                                    <h3 className="text-xs font-bold text-white tracking-wide">{bentoItem.title}</h3>
                                                                    <p className="text-[10px] text-slate-400 font-sans mt-0.5 line-clamp-2">{bentoItem.description}</p>
                                                                </div>
                                                                <div className="text-indigo-400 shrink-0">
                                                                    {bentoItem.icon}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Inactive State */}
                                                <div className={cn(
                                                    "absolute inset-0 flex flex-col items-center justify-center gap-2 transition-all duration-500",
                                                    isActive ? "opacity-0 scale-90 pointer-events-none" : "opacity-100 scale-100"
                                                )}>
                                                    <div className="text-slate-500 hover:text-slate-300 transition-colors">
                                                        {bentoItem.icon}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )
                        }

                        if (i === 17 || i === 18) return null;

                        if (typeof item === 'string') {
                            const techItems = [
                                { label: "C++ 20", sub: "Compiler", icon: Terminal },
                                { label: "Python 3.11", sub: "Runtime", icon: Code2 },
                                { label: "Java 21", sub: "Compiler", icon: Cpu },
                                { label: "Docker", sub: "Sandbox", icon: Shield },
                                { label: "PostgreSQL", sub: "Database", icon: Database },
                                { label: "Redis Queue", sub: "Broker", icon: Layers },
                                { label: "Gemini 1.5", sub: "AI Insights", icon: Sparkles },
                                { label: "React 18", sub: "Frontend", icon: Globe },
                                { label: "TypeScript", sub: "Language", icon: FileCode }
                            ];

                            const tech = techItems[i % techItems.length];
                            const Icon = tech.icon;

                            return (
                                <figure key={`img-${i}`} data-col={i % 7} className="grid__item m-0 relative z-10 [perspective:800px] will-change-[transform,opacity] group cursor-pointer max-sm:col-span-1">
                                    <div 
                                        className="grid__item-img w-full h-full [backface-visibility:hidden] will-change-transform rounded-xl overflow-hidden shadow-sm border border-zinc-800 bg-zinc-950 flex items-center justify-center transition-all duration-500 ease-out group-hover:scale-105 group-hover:shadow-xl group-hover:border-indigo-500/20 bg-cover bg-center bg-no-repeat relative"
                                        style={{ backgroundImage: `url(${item})` }}
                                    >
                                        {/* Dark Overlay for better contrast */}
                                        <div className="absolute inset-0 bg-[#0c0c0f]/75 group-hover:bg-[#0c0c0f]/45 transition-colors duration-500 z-0" />

                                        {/* Content Container */}
                                        <div className="relative z-10 flex flex-col items-center justify-center gap-2 p-2">
                                            {/* Icon */}
                                            <Icon className="w-5 h-5 text-slate-400 transition-all duration-300 group-hover:text-white group-hover:scale-110" />

                                            {/* Text Reveal */}
                                            <div className="text-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                                <span className="block text-[8px] font-medium text-slate-400 uppercase tracking-widest">{tech.sub}</span>
                                                <span className="block text-[10px] font-bold text-white tracking-tight">{tech.label}</span>
                                            </div>
                                        </div>
                                    </div>
                                </figure>
                            )
                        }
                        return null;
                    })}
                </div>
            </section >

            {showFooter && (
                <footer className="frame__footer w-full p-4 flex justify-between items-center relative z-50 text-slate-500 uppercase font-medium text-[10px] tracking-wider border-t border-zinc-900 mt-4">
                    <a href={credits.madeBy.href} className="hover:text-white transition-colors">{credits.madeBy.text}</a>
                    <a href={credits.moreDemos.href} className="hover:text-white transition-colors">{credits.moreDemos.text}</a>
                </footer>
            )}
        </div >
    )
}

export default StaggeredGrid
