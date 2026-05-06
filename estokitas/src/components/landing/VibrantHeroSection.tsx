import React from 'react';
import { motion } from 'framer-motion';
import { TextStaggerHover, TextStaggerHoverActive } from '@/components/ui/text-stagger-hover';
import { FloatingPaths } from '@/components/ui/background-paths';
import { PackagePlus, AlertTriangle } from 'lucide-react';

// --- Custom SVG Component ---
const ArrowDrawn = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full text-white stroke-current overflow-visible" fill="none" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    {/* Dramatic curvy hand-drawn arrow */}
    <path d="M15,5 C -10,25 45,15 30,45 C 18,70 55,55 75,85" />
    <path d="M55,78 L78,90 L72,62" />
  </svg>
);

export const VibrantHeroSection = ({ authOpen, setAuthOpen, authMode, setAuthMode }: any) => {
  return (
    <div className="flex flex-col font-sans selection:bg-primary selection:text-white relative overflow-hidden w-full bg-background min-h-[calc(100vh-4rem)]">

      {/* Dynamic Animated Paths Background */}
      <motion.div 
        className="absolute inset-0 z-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 1.5, delay: 3.2 }}
      >
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </motion.div>

      {/* Hero Section */}
      <main className="flex-1 relative z-10 py-2 md:py-4 px-2 sm:px-4 flex flex-col items-center justify-center w-full max-w-[1440px] mx-auto h-full">
      
        {/* Floating Badge Left */}
        <motion.div 
          className="absolute left-[2%] lg:left-[8%] top-[30%] hidden md:block z-40 pointer-events-auto"
          initial={{ opacity: 0, x: -100, rotate: -30, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, rotate: -12, scale: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 15, delay: 4.2 }}
        >
          <div className="w-40 md:w-52 aspect-[3/3.5] bg-white border-4 border-black rounded-[2rem] p-5 flex flex-col items-center justify-center shadow-[8px_8px_0_#000] hover:rotate-[-5deg] hover:-translate-y-2 transition-all duration-300 cursor-pointer">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-[#CCFF00] rounded-full flex items-center justify-center mb-4 border-[4px] border-black overflow-hidden shadow-inner">
              <PackagePlus className="w-8 h-8 md:w-12 md:h-12 text-black" strokeWidth={2.5} />
            </div>
            <div className="text-center mt-2 leading-tight">
              <p className="font-black text-sm md:text-lg text-black uppercase tracking-tighter">+128 Entradas</p>
              <p className="text-[10px] md:text-xs font-bold text-black/60 mt-1 uppercase tracking-widest">Estoque Hoje</p>
            </div>
          </div>
        </motion.div>

        {/* Floating Badge Right */}
        <motion.div 
          className="absolute right-[2%] lg:right-[8%] top-[50%] hidden md:block z-40 pointer-events-auto"
          initial={{ opacity: 0, x: 100, rotate: 30, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, rotate: 12, scale: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 15, delay: 4.4 }}
        >
          <div className="w-40 md:w-52 aspect-[3/3.5] bg-[#FF0033] border-4 border-black rounded-[2rem] p-5 flex flex-col items-center justify-center shadow-[8px_8px_0_#000] hover:rotate-[5deg] hover:-translate-y-2 transition-all duration-300 cursor-pointer text-white">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center mb-4 border-[4px] border-black overflow-hidden shadow-inner">
              <AlertTriangle className="w-8 h-8 md:w-12 md:h-12 text-black" strokeWidth={2.5} />
            </div>
            <div className="text-center mt-2 leading-tight">
              <p className="font-black text-sm md:text-lg uppercase tracking-tighter">Estoque Baixo</p>
              <p className="text-[10px] md:text-xs font-bold text-white/80 mt-1 uppercase tracking-widest">3 Itens Acabando</p>
            </div>
          </div>
        </motion.div>

        {/* Text Container - Fully Stacked & Height Aware */}
        <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center justify-center text-center z-10 gap-2 md:gap-4">

           {/* Top/Left Block: CONTROLE TOTAL DO ESTOQUE */}
          <div className="w-full flex flex-col items-center space-y-0 relative z-30 leading-none">
            <TextStaggerHover
              as="h1"
              className="font-black tracking-tighter text-primary m-0 p-0 uppercase"
              style={{
                fontSize: 'clamp(3.5rem, min(11vw, 15vh), 150px)',
                lineHeight: '0.85',
                fontFamily: '"Arial Black", Impact, sans-serif',
                textShadow: '1px 1px 0 #000, 2px 2px 0 #000, 3px 3px 0 #000, 4px 4px 0 #000'
              }}
            >
              <TextStaggerHoverActive animation="bottom" staggerDirection="start" baseDelay={2.7}>
                CONTROLE
              </TextStaggerHoverActive>
            </TextStaggerHover>

            <TextStaggerHover
              as="h1"
              className="font-black tracking-tighter text-white m-0 p-0 uppercase"
              style={{
                fontSize: 'clamp(3.5rem, min(11vw, 15vh), 150px)',
                lineHeight: '0.85',
                fontFamily: '"Arial Black", Impact, sans-serif',
                textShadow: '1px 1px 0 #000, 2px 2px 0 #000, 3px 3px 0 #000, 4px 4px 0 #000, 5px 5px 0 #000'
              }}
            >
              <TextStaggerHoverActive animation="bottom" staggerDirection="middle" baseDelay={2.85}>
                TOTAL DO
              </TextStaggerHoverActive>
            </TextStaggerHover>

            <TextStaggerHover
              as="h1"
              className="font-black tracking-tighter text-white m-0 p-0 uppercase"
              style={{
                fontSize: 'clamp(3.5rem, min(11vw, 15vh), 150px)',
                lineHeight: '0.85',
                fontFamily: '"Arial Black", Impact, sans-serif',
                textShadow: '1px 1px 0 #000, 2px 2px 0 #000, 3px 3px 0 #000, 4px 4px 0 #000, 5px 5px 0 #000'
              }}
            >
              <TextStaggerHoverActive animation="bottom" staggerDirection="end" baseDelay={3.0}>
                ESTOQUE
              </TextStaggerHoverActive>
            </TextStaggerHover>
          </div>

          {/* Bottom/Right Block: É COM -> ESTOKITAS */}
          <div className="w-full flex flex-col items-center mt-4 md:mt-8 relative z-20">
            
            <div className="flex w-full justify-center relative z-20">
              <TextStaggerHover
                as="h2"
                className="font-black tracking-tighter text-white/50 m-0 p-0 uppercase relative z-10"
                style={{ 
                  fontSize: 'clamp(2.5rem, min(7vw, 9vh), 100px)',
                  lineHeight: '0.85',
                  fontFamily: '"Arial Black", Impact, sans-serif' 
                }}
              >
                <TextStaggerHoverActive animation="z" staggerDirection="start" baseDelay={3.3}>
                  É COM
                </TextStaggerHoverActive>
              </TextStaggerHover>
              
              {/* Arrow adjusted for vertical stack and tighter proportions */}
              <motion.div 
                className="w-16 h-16 md:w-24 md:h-24 absolute left-[65%] top-[10%] md:left-[60%] md:top-[20%] z-0 pointer-events-none rotate-[20deg]"
                initial={{ opacity: 0, pathLength: 0 }}
                animate={{ opacity: 1, pathLength: 1 }}
                transition={{ duration: 1, ease: "easeOut", delay: 3.5 }}
              >
                <ArrowDrawn />
              </motion.div>
            </div>
            
            {/* ESTOKITAS rotated below */}
            <TextStaggerHover
              as="h1"
              className="font-black tracking-tighter text-[#CCFF00] m-0 p-0 uppercase mt-4 relative z-30 transition-transform origin-center rotate-[6deg]"
              style={{
                fontSize: 'clamp(4.5rem, min(12vw, 16vh), 170px)',
                lineHeight: '0.85',
                fontFamily: '"Arial Black", Impact, sans-serif',
                textShadow: '3px 3px 0px #000, 6px 6px 0px #000'
              }}
            >
              <TextStaggerHoverActive animation="blur" staggerDirection="middle" baseDelay={3.6}>
                ESTOKITAS
              </TextStaggerHoverActive>
            </TextStaggerHover>
          </div>

        </div>

        <motion.div 
          className="mt-12 md:mt-16 relative z-40 w-full flex justify-center pb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 4.1 }}
        >
          <button
            onClick={() => { setAuthMode('signup'); setAuthOpen(true); }}
            className="px-12 py-6 bg-[#CCFF00] hover:bg-white text-black text-xl md:text-2xl font-black uppercase tracking-widest rounded-full border-4 border-black hover:-translate-y-1 hover:shadow-[10px_10px_0_#000] shadow-[5px_5px_0_#000] transition-all"
          >
            Começar de Graça
          </button>
        </motion.div>

      </main>

    </div>
  );
};
