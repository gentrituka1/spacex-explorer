"use client";

import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import type { LaunchLinks } from "@/types/spacex";

interface ImageGalleryProps {
  links: LaunchLinks;
  launchName: string;
}

export function ImageGallery({ links, launchName }: ImageGalleryProps) {
  const images = links.flickr.original.length
    ? links.flickr.original
    : links.flickr.small;

  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const showPrevious = useCallback(() => {
    setDirection(-1);
    setActiveIndex((current) => (current === 0 ? images.length - 1 : current - 1));
  }, [images.length]);

  const showNext = useCallback(() => {
    setDirection(1);
    setActiveIndex((current) => (current + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (images.length <= 1) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        showPrevious();
      } else if (event.key === "ArrowRight") {
        showNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images.length, showNext, showPrevious]);

  if (images.length === 0) {
    const patch = links.patch.large ?? links.patch.small;
    if (!patch) {
      return (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-800/80 bg-slate-900/40 text-slate-500">
          No images available for this launch
        </div>
      );
    }

    return (
      <figure className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={patch}
          alt={`Mission patch for ${launchName}`}
          className="mx-auto max-h-72 w-full object-contain p-8"
        />
      </figure>
    );
  }

  const activeImage = images[activeIndex];

  return (
    <section aria-label="Launch image gallery" className="space-y-3">
      <figure className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-black">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeIndex}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.25 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeImage}
              alt={`${launchName} photo ${activeIndex + 1} of ${images.length}`}
              className="max-h-[420px] w-full object-contain"
            />
          </motion.div>
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={showPrevious}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-slate-700/50 bg-slate-950/80 px-3 py-2 text-lg text-white backdrop-blur-sm transition-all hover:border-sky-500/50 hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={showNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-slate-700/50 bg-slate-950/80 px-3 py-2 text-lg text-white backdrop-blur-sm transition-all hover:border-sky-500/50 hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
              aria-label="Next image"
            >
              ›
            </button>
          </>
        )}
        <figcaption className="absolute bottom-0 w-full bg-gradient-to-t from-slate-950/90 to-transparent px-4 py-3 text-sm text-slate-300">
          Image {activeIndex + 1} of {images.length}
          {images.length > 1 && (
            <span className="ml-2 hidden text-slate-500 sm:inline">
              · Use arrow keys to navigate
            </span>
          )}
        </figcaption>
      </figure>

      {images.length > 1 && (
        <div
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin"
          role="tablist"
          aria-label="Gallery thumbnails"
        >
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Show image ${index + 1}`}
              onClick={() => {
                setDirection(index > activeIndex ? 1 : -1);
                setActiveIndex(index);
              }}
              className={clsx(
                "h-16 w-24 shrink-0 overflow-hidden rounded-xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50",
                index === activeIndex
                  ? "border-sky-400 ring-2 ring-sky-400/40 scale-105"
                  : "border-slate-700 opacity-70 hover:opacity-100 hover:border-slate-600",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
