'use client'

import React, { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

// Inline hook for useOutsideClick to keep it zero-config
export function useOutsideClick(
  ref: React.RefObject<HTMLElement | null>,
  callback: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      callback(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, callback]);
}

export interface BentoGridItem {
  id: string | number
  title: string
  subtitle?: string
  description?: string
  content: React.ReactNode
  icon?: React.ReactNode
  className?: string
}

export interface BentoGridProps {
  items: BentoGridItem[]
  className?: string
}

export function ExpandableBentoGrid({ items, className }: BentoGridProps) {
  const [active, setActive] = useState<BentoGridItem | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const id = useId()

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setActive(null)
      }
    }

    if (active) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [active])

  useOutsideClick(ref, () => setActive(null))

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm h-full w-full z-[10000]"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active ? (
          <div className="fixed inset-0 top-0 grid place-items-center z-[10001] p-4">
            <motion.div
              layoutId={`card-${active.title}-${id}`}
              ref={ref}
              className="w-full max-w-[500px] h-fit md:max-h-[90%] flex flex-col bg-[#121216] border border-[#1f1f2e] rounded-3xl overflow-hidden shadow-2xl shadow-black/90 relative"
            >
              {/* Close Button */}
              <button
                type="button"
                className="absolute top-4 right-4 z-10 flex items-center justify-center bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-slate-400 hover:text-white rounded-full h-8 w-8 transition-colors cursor-pointer"
                onClick={() => setActive(null)}
              >
                <X className="h-4 w-4" />
              </button>

              <motion.div layoutId={`image-${active.title}-${id}`}>
                <div className="w-full h-32 md:h-40 bg-gradient-to-br from-indigo-950/40 to-purple-950/20 border-b border-[#1f1f2e] flex items-center justify-center">
                  {active.icon ? (
                    <div className="scale-[1.5] text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.2)]">{active.icon}</div>
                  ) : (
                    <div className="w-full h-full bg-[#181824]" />
                  )}
                </div>
              </motion.div>

              <div className="p-6 flex flex-col gap-4">
                <div>
                  <motion.h3
                    layoutId={`title-${active.title}-${id}`}
                    className="font-extrabold text-xl text-white tracking-tight"
                  >
                    {active.title}
                  </motion.h3>
                  {active.description && (
                    <motion.p
                      layoutId={`description-${active.title}-${id}`}
                      className="text-slate-400 text-xs mt-1 leading-relaxed"
                    >
                      {active.description}
                    </motion.p>
                  )}
                </div>

                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-slate-200 text-sm py-2 border-t border-[#1f1f2e]/60"
                >
                  {active.content}
                </motion.div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ${className || ""}`}>
        {items.map((item) => (
          <motion.div
            layoutId={`card-${item.title}-${id}`}
            key={item.id}
            onClick={() => setActive(item)}
            className="p-6 flex flex-col justify-between items-start bg-[#121216] border border-[#1f1f2e] rounded-2xl cursor-pointer hover:border-indigo-500/30 hover:bg-[#15151c] transition-all duration-300 group shadow-lg"
          >
            <div className="flex justify-between items-start w-full mb-4">
              <div className="flex flex-col gap-1">
                <motion.h3
                  layoutId={`title-${item.title}-${id}`}
                  className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-left"
                >
                  {item.title}
                </motion.h3>
                <motion.p
                  layoutId={`description-${item.title}-${id}`}
                  className="text-2xl font-extrabold text-white text-left group-hover:text-indigo-400 transition-colors"
                >
                  {item.subtitle}
                </motion.p>
              </div>
              <motion.div layoutId={`image-${item.title}-${id}`}>
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 shadow group-hover:scale-105 transition-all">
                  {item.icon}
                </div>
              </motion.div>
            </div>
            
            <span className="text-[11px] text-slate-500 font-medium group-hover:text-slate-400 transition-colors flex items-center gap-1 mt-2">
              Click to inspect details <span className="opacity-0 group-hover:opacity-100 transition-opacity">&rarr;</span>
            </span>
          </motion.div>
        ))}
      </div>
    </>
  )
}
