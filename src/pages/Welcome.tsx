import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
const sentence = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      delay: 0.3,
      staggerChildren: 0.06,
    },
  },
};
const letter = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};
const Welcome = () => {
  const navigate = useNavigate();
  const title = "Welcome To SecureLance";
  const subtitle = "India's First Decentralised Freelancing Platform"; 
  const handleProceed = () => {
    try {
      const audio = new Audio('/sound.mp3'); 
      audio.play().catch(e => console.error("Error playing sound:", e));
    } catch (e) {
      console.error("Failed to play sound:", e);
    }
    navigate('/auth');
  };
  return (
    <div className="welcome-container relative flex items-center justify-center h-screen w-screen overflow-hidden bg-background">
      {}
      <div className="gradient-blur-container absolute inset-0 filter blur-[100px] opacity-40">
        <div className="blob blob1 bg-purple-500"></div>
        <div className="blob blob2 bg-pink-500"></div>
        <div className="blob blob3 bg-blue-500"></div>
      </div>
      {}
      <motion.div 
        className="z-10 flex flex-col items-center text-center text-foreground"
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.8, delay: 0.2 }} 
      >
        {}
        <motion.h1 
          className="welcome-text text-6xl md:text-8xl font-extrabold mb-3 bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 text-transparent bg-clip-text" 
          variants={sentence}
          initial="hidden"
          animate="visible"
          aria-label={title}
        >
          {title.split("").map((char, index) => (
            <motion.span 
              key={char + "-title-" + index} 
              variants={letter}
              style={{ display: 'inline-block' }} 
            >
              {char === ' ' ? '\u00A0' : char} {}
            </motion.span>
          ))}
        </motion.h1>
        {}
        <motion.h2
          className="welcome-subtitle text-lg md:text-xl font-light mb-12 text-muted-foreground tracking-wide" 
          variants={sentence} 
          initial="hidden"
          animate="visible" 
          aria-label={subtitle}
        >
          {subtitle.split("").map((char, index) => (
            <motion.span key={char + "-subtitle-" + index} variants={letter}>
              {char}
            </motion.span>
          ))}
        </motion.h2>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }} 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            variant="ghost" 
            size="icon" 
            className="proceed-button rounded-full h-16 w-16 bg-card/30 backdrop-blur-sm hover:bg-card/50 shadow-lg"
            onClick={handleProceed}
            aria-label="Proceed to Login"
          >
            <ArrowRight className="h-8 w-8 text-foreground" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};
export default Welcome;
