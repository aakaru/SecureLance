import React from 'react';
import { motion } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react'; // Added import

export const CyclingAnimation = () => {
  return (
    <div className="w-full max-w-4xl h-80 relative overflow-hidden my-16">
      <motion.div
        className="absolute top-0 left-0 w-64 h-64" 
        initial={{ x: "5%", y: "10%" }} 
        animate={{
          x: "205%", 
        }}
        transition={{
          duration: 10, 
          ease: "linear",
          repeat: Infinity,
          repeatType: "reverse",
          repeatDelay: 0.5
        }}
      >
        {/* Replaced Framer Motion animation with DotLottieReact */}
        <DotLottieReact
          src="https://lottie.host/9f231443-01e8-440d-a12f-5a8f54376ae5/9OXGjaQvCp.lottie"
          loop
          autoplay
          style={{ width: '100%', height: '100%' }} // Added style for sizing
        />
      </motion.div>
      
      <div className="absolute bottom-16 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-border to-transparent opacity-50 rounded-full"></div>
    </div>
  );
};
