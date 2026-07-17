'use client';

import { useState, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PhotoLightboxProps {
  urls: string[];
}

export function PhotoLightbox({ urls }: PhotoLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  function open(idx: number) {
    setIndex(idx);
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
  }

  function scrollPhotos(dir: 'left' | 'right') {
    if (!scrollRef.current) return;
    const w = scrollRef.current.clientWidth;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -w : w, behavior: 'smooth' });
  }

  function handleScroll() {
    if (!scrollRef.current) return;
    const idx = Math.round(scrollRef.current.scrollLeft / scrollRef.current.clientWidth);
    setIndex(idx);
  }

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
        {urls.map((url, i) => (
          <button
            key={i}
            onClick={() => open(i)}
            className="w-28 h-28 rounded-xl overflow-hidden border border-[var(--gray-200)] flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-[var(--gold)]/50 transition-all focus:outline-none"
          >
            <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              onClick={close}
            />

            <button
              onClick={close}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl mx-4"
            >
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none rounded-2xl"
              >
                {urls.map((url, i) => (
                  <div key={i} className="w-full flex-shrink-0 snap-center">
                    <img
                      src={url}
                      alt={`Photo ${i + 1}`}
                      className="w-full aspect-[4/3] object-contain bg-black/40"
                    />
                  </div>
                ))}
              </div>

              {urls.length > 1 && (
                <>
                  <button
                    onClick={() => scrollPhotos('left')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={() => scrollPhotos('right')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-white" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {urls.map((_, i) => (
                      <span
                        key={i}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          i === index ? 'bg-white' : 'bg-white/40'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
