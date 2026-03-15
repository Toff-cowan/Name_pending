import React, { Children } from 'react';
import { motion } from 'framer-motion';
export function HeroSection() {
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 30
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      } // Custom ease-out
    }
  };
  return (
    <section
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden"
      style={{
        backgroundImage:
        'url("https://cdn.magicpatterns.com/uploads/8ecduv9ZRV9U4tFKvmMJBk/PI_background.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
      
      {/* Subtle overlay to ensure text readability if needed, though the image is quite dark */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />

      <motion.div
        className="relative z-10 flex flex-col items-center text-center px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible">
        
        <motion.h1
          variants={itemVariants}
          className="font-serif text-[8rem] md:text-[12rem] leading-none text-white tracking-tight mb-2"
          style={{
            textShadow: '0 4px 24px rgba(0,0,0,0.3)'
          }}>
          
          PI
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="font-serif italic text-2xl md:text-4xl text-white mb-12"
          style={{
            textShadow: '0 2px 12px rgba(0,0,0,0.3)'
          }}>
          
          Investment that Learns
        </motion.p>

        <motion.button
          variants={itemVariants}
          whileHover={{
            scale: 1.05
          }}
          whileTap={{
            scale: 0.95
          }}
          className="bg-white/95 backdrop-blur-sm text-gray-900 px-10 py-3 rounded-full font-medium text-lg shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.3)] transition-shadow">
          
          Get Started
        </motion.button>
      </motion.div>
    </section>);

}