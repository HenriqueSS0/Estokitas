import React from 'react';
import { motion } from 'framer-motion';

export const TextStaggerHover = ({ as: Component = 'div', className, style, children }: any) => {
  return <Component className={className} style={style}>{children}</Component>;
};

export const TextStaggerHoverActive = ({ children, animation, staggerDirection, baseDelay = 0 }: any) => {
  if (typeof children !== 'string') return <>{children}</>;
  
  const chars = children.split("");
  
  return (
    <motion.span initial="hidden" animate="visible" className="inline-flex">
      {chars.map((char: string, index: number) => {
        const delay = baseDelay + (staggerDirection === 'end' ? (chars.length - index) * 0.05 : 
                      staggerDirection === 'middle' ? Math.abs(chars.length / 2 - index) * 0.05 : 
                      index * 0.05);

        return (
          <motion.span
            key={index}
            variants={{
              hidden: { 
                y: animation === 'bottom' ? 100 : animation === 'z' ? 0 : 20, 
                opacity: 0, 
                scale: animation === 'z' ? 0.5 : 1,
                filter: animation === 'blur' ? 'blur(10px)' : 'none' 
              },
              visible: { 
                y: 0, 
                opacity: 1, 
                scale: 1,
                filter: 'blur(0px)' 
              }
            }}
            transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
            className="inline-block"
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        );
      })}
    </motion.span>
  );
};
