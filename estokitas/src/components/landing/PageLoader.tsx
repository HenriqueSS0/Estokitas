import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";


interface PageLoaderProps {
  duration?: number;
  className?: string;
  curtainColor?: string;
  children?: React.ReactNode;
  numRows?: number;
  rowDelay?: number;
  onComplete?: () => void;
  preloadImages?: string[];
}

function preloadAllImages(urls: string[]): Promise<void[]> {
  return Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Don't block on broken images
          img.src = url;
        })
    )
  );
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  duration = 1800,
  className,
  curtainColor = "#333333", // Dark gray — contrasts warm stone light bg and distinct from dark charcoal
  children,
  numRows = 5,
  rowDelay = 0.07,
  onComplete,
  preloadImages = [],
}) => {
  const [done, setDone] = React.useState(false);
  const [imagesReady, setImagesReady] = React.useState(preloadImages.length === 0);

  React.useEffect(() => {
    if (preloadImages.length === 0) return;

    preloadAllImages(preloadImages).then(() => {
      setImagesReady(true);
    });
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = "hidden";

    if (!imagesReady) return;

    const curtainDelayMs = 2400;
    const curtainDurationMs = 1500; 
    
    const totalWait = curtainDelayMs + numRows * rowDelay * 1000 + curtainDurationMs + 100;
    
    const timer = setTimeout(() => {
      setDone(true);
      document.body.style.overflow = "";
      onComplete?.();
    }, totalWait);
    
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, [numRows, rowDelay, onComplete, imagesReady]);

  return (
    <div className={cn("relative w-full", className)}>
      {children}

      <AnimatePresence>
        {!done && (
          <div className="fixed inset-0 z-[9999] flex flex-col pointer-events-none">
            {Array.from({ length: numRows }, (_, i) => {
              const delay = 1.8 + i * rowDelay;
              return (
                <div key={i} className="relative flex-1 overflow-hidden flex">
                  <motion.div
                    className="w-full h-full border-b border-[rgba(255,255,255,0.05)]"
                    style={{ backgroundColor: curtainColor }}
                    initial={{ x: "0%" }}
                    animate={imagesReady ? { x: "-100%" } : { x: "0%" }}
                    transition={{ duration: 1.5, delay, ease: [0.76, 0, 0.24, 1] }}
                  />
                </div>
              );
            })}

            {/* Centered wordmark */}
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none z-10"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: 1.7, ease: "easeInOut" }}
            >
              <div className="font-sans font-black uppercase tracking-tighter drop-shadow-[4px_4px_0_rgba(0,0,0,1)] flex overflow-hidden">
                {"ESTOKITAS".split("").map((letter, i) => (
                  <motion.span
                    key={i}
                    className="text-5xl sm:text-8xl text-white inline-block"
                    initial={{ y: "110%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 + i * 0.07, ease: [0.33, 1, 0.68, 1] }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </div>

              <motion.div
                className="h-[4px] bg-[#CCFF00] shadow-[4px_4px_0px_#000]"
                initial={{ scaleX: 0 }}
                animate={{
                  scaleX: 1,
                  transition: { duration: 0.5, ease: "easeOut", delay: 0.8 },
                }}
                style={{ width: "16rem", transformOrigin: "right" }}
              />

              <motion.p
                className="font-mono text-white text-[13px] tracking-[0.35em] uppercase drop-shadow-[2px_2px_0_rgba(0,0,0,1)] font-bold mt-2"
                initial={{ opacity: 0, y: 4 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.4, ease: "easeOut", delay: 1.0 },
                }}
              >
                Carregando
              </motion.p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
