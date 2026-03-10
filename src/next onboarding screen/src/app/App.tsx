import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export default function App() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate random smoke particles
    const newParticles: Particle[] = Array.from({ length: 35 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 3,
      duration: Math.random() * 12 + 18,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="size-full relative overflow-hidden bg-gradient-to-br from-[#90b855] via-[#63a96a] via-[#7bb15f] to-[#90b855]">
      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(144, 184, 85, 0.4) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(99, 169, 106, 0.4) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 80%, rgba(123, 177, 95, 0.4) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, rgba(144, 184, 85, 0.4) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Vignette effect */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.15) 100%)'
      }} />

      {/* Status Bar */}
      <div className="absolute top-0 left-0 right-0 pt-3 px-6 flex justify-between items-center text-white/90 text-sm z-20">
        <span className="font-semibold">9:41</span>
        <div className="flex items-center gap-1">
          <div className="flex gap-0.5">
            <div className="w-0.5 h-3 bg-white/90 rounded-full"></div>
            <div className="w-0.5 h-3 bg-white/90 rounded-full"></div>
            <div className="w-0.5 h-3 bg-white/90 rounded-full"></div>
            <div className="w-0.5 h-3 bg-white/70 rounded-full"></div>
          </div>
          <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24">
            <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
          </svg>
          <svg className="w-6 h-4" fill="white" viewBox="0 0 24 24">
            <rect x="1" y="5" width="18" height="13" rx="2" fill="white" fillOpacity="0.9"/>
            <rect x="20" y="8" width="3" height="7" rx="1" fill="white" fillOpacity="0.9"/>
          </svg>
        </div>
      </div>

      {/* Animated smoke particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 70%, transparent 100%)',
            filter: 'blur(1px)',
          }}
          animate={{
            y: [0, -40, -80, -120],
            x: [0, Math.random() * 30 - 15, Math.random() * 40 - 20, Math.random() * 50 - 25],
            opacity: [0, 0.8, 0.5, 0],
            scale: [1, 1.3, 1.6, 2],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Additional floating wisps */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`wisp-${i}`}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -120],
            x: [0, Math.random() * 60 - 30],
            opacity: [0, 0.4, 0.2, 0],
            rotate: [0, 360],
            scale: [0.8, 1.2, 1.5],
          }}
          transition={{
            duration: Math.random() * 18 + 25,
            delay: Math.random() * 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div 
            className="w-12 h-12 rounded-full" 
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 100%)',
              filter: 'blur(3px)',
            }}
          />
        </motion.div>
      ))}

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center pt-32 size-full px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
          className="space-y-8 w-full max-w-md"
        >
          <motion.h1 
            className="text-3xl sm:text-4xl text-white tracking-wide leading-relaxed" 
            style={{ 
              fontFamily: 'Inter, sans-serif',
              textShadow: '0 4px 30px rgba(0,0,0,0.3), 0 0 40px rgba(255,255,255,0.1)',
              fontWeight: 400,
              letterSpacing: '0.02em'
            }}
            animate={{
              textShadow: [
                '0 4px 30px rgba(0,0,0,0.3), 0 0 40px rgba(255,255,255,0.1)',
                '0 4px 30px rgba(0,0,0,0.3), 0 0 50px rgba(255,255,255,0.2)',
                '0 4px 30px rgba(0,0,0,0.3), 0 0 40px rgba(255,255,255,0.1)',
              ]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Welcome to PuffNoMore, your path to freedom
          </motion.h1>
          
          {/* Decorative underline */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
            className="h-0.5 w-48 bg-gradient-to-r from-transparent via-white/60 to-transparent mx-auto"
          />
        </motion.div>

        {/* Decorative elements */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.8 }}
        >
          <div className="flex items-center justify-center gap-2">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-white/50"
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2.5,
                  delay: i * 0.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Circle Button */}
      <motion.div
        className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 2, ease: "easeOut" }}
      >
        <motion.button
          className="w-20 h-20 rounded-full border-[3px] border-white/90 bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl relative"
          whileTap={{ scale: 0.85 }}
          whileHover={{ scale: 1.05 }}
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(255, 255, 255, 0.4)',
              '0 0 0 15px rgba(255, 255, 255, 0)',
              '0 0 0 0 rgba(255, 255, 255, 0)',
            ],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Inner glow */}
          <div className="absolute inset-2 rounded-full bg-white/5" />
          <svg 
            className="w-8 h-8 text-white relative z-10" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            viewBox="0 0 24 24"
          >
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.button>
      </motion.div>

      {/* Bottom Bar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-36 h-1.5 bg-white/90 rounded-full z-20 shadow-lg" />
    </div>
  );
}
