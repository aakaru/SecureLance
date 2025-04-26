import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Folder, DollarSign, Users, CheckCircle, HandCoins, Github, Linkedin, Twitter } from 'lucide-react';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import { particlesOptions } from '@/config/particlesConfig';
import CountUp from 'react-countup';
import { Container } from "tsparticles-engine";
import { FeaturedContracts } from '@/components/dashboard/FeaturedContracts';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { HowItWorks } from '@/components/dashboard/HowItWorks';
import { PlatformPerformance } from '@/components/dashboard/PlatformPerformance';
import { useAuth } from '@/contexts/AuthContext';
import { CyclingAnimation } from '@/components/dashboard/CyclingAnimation';
import { Leaderboard } from '@/components/dashboard/Leaderboard';

const technologies = [
  { name: 'Ethereum', url: 'https://ethereum.org' },
  { name: 'React', url: 'https://reactjs.org' },
  { name: 'IPFS', url: 'https://ipfs.tech' },
  { name: 'Solidity', url: 'https://soliditylang.org' },
  { name: 'Node.js', url: 'https://nodejs.org' },
  { name: 'Wagmi', url: 'https://wagmi.sh' }
];

const TechLogos = () => (
  <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 opacity-80 mt-16"> {}
    {technologies.map((tech) => (
      <motion.a
        key={tech.name}
        href={tech.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium whitespace-nowrap text-muted-foreground hover:text-primary transition-colors duration-300 hover:scale-105" 
        whileHover={{ scale: 1.1, textShadow: "0px 0px 4px rgba(155, 135, 245, 0.6)" }} 
        whileTap={{ scale: 0.95 }}
        aria-label={`Learn more about ${tech.name}`}
      >
        {tech.name}
      </motion.a>
    ))}
  </div>
);

const StatCard = ({ icon: Icon, value, label, prefix = '', suffix = '' }) => (
  <motion.div 
    className="bg-card/40 backdrop-blur-md p-6 rounded-xl text-center border border-white/10 shadow-xl transition-all duration-300 hover:border-primary/50 hover:shadow-primary/20 hover:scale-[1.03] group"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
  >
    <motion.div whileHover={{ scale: 1.1, rotate: 5 }}>
       <Icon className="h-9 w-9 mx-auto mb-4 text-primary transition-colors duration-300 group-hover:text-white" />
    </motion.div>
    <div className="text-4xl font-bold text-foreground mb-1">
      {prefix}
      <CountUp end={value} />
      {suffix}
    </div>
    <p className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">{label}</p>
  </motion.div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [engineLoaded, setEngineLoaded] = useState(true);
  const [showSocials, setShowSocials] = useState(false);
  const [leftGlowIntensity, setLeftGlowIntensity] = useState(0.15);
  const [rightGlowIntensity, setRightGlowIntensity] = useState(0.2);
  const { scrollYProgress } = useScroll();

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const leftIntensity = 0.15 + Math.pow(latest, 1.3) * 0.35;
    setLeftGlowIntensity(Math.min(leftIntensity, 0.5));
    const rightIntensity = 0.2 + Math.pow(latest, 1.5) * 0.5;
    setRightGlowIntensity(Math.min(rightIntensity, 0.7));
  });

  const particlesContainerLoaded = async (container?: Container): Promise<void> => {
    console.log("Particles container loaded", container);
  };

  return (
    <div className="dashboard-container relative flex flex-col items-center justify-start min-h-[calc(100vh-4rem)] w-full overflow-clip px-4 pt-20 pb-12">
      {}
      {}
      <div
        className="fixed top-0 left-0 w-[80vw] h-[80vh] -z-20 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 10% 20%, rgba(155, 135, 245, ${leftGlowIntensity}) 0%, rgba(155, 135, 245, 0) 70%)`,
          filter: `blur(100px)`, 
          transform: 'translate(-30%, -30%)', 
          opacity: 1, 
          transition: 'opacity 0.5s ease-out', 
        }}
      />
      {}
      <div
        className="fixed bottom-0 right-0 w-[80vw] h-[80vh] -z-20 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 90% 80%, rgba(155, 135, 245, ${rightGlowIntensity}) 0%, rgba(155, 135, 245, 0) 70%)`,
          filter: `blur(120px)`, 
          transform: 'translate(30%, 30%)', 
          opacity: 1,
          transition: 'opacity 0.5s ease-out',
        }}
      />
      {}
      {engineLoaded && (
        <Particles
          id="tsparticles"
          options={particlesOptions}
          loaded={particlesContainerLoaded}
          className="absolute inset-0 -z-10"
        />
      )}
      {}
      <div className="z-10 flex flex-col items-center w-full space-y-20">
        {}
        <motion.div
          className="flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {}
          {user && (
            <motion.h2 
              className="text-2xl text-muted-foreground mb-5"
              initial={{ opacity: 0}}
              animate={{ opacity: 1}}
              transition={{ delay: 0.5 }}
            >
              Welcome back, <span className="font-semibold text-foreground">{user.username}!</span>
            </motion.h2>
          )}
          <h1 className="text-5xl md:text-7xl font-bold mb-5 bg-gradient-to-r from-primary to-purple-400 inline-block text-transparent bg-clip-text drop-shadow-glow-primary">
            Build the Future, Securely.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10">
            Your gateway to decentralized freelancing. Transparent contracts, reliable escrow, and on-chain reputation.
          </p>
          <CyclingAnimation />
          <div className="flex flex-col sm:flex-row gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button asChild className="glow-btn px-8 py-6 text-lg rounded-lg">
                <Link to="/browse">
                  Browse Contracts <Folder className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button variant="outline" className="px-8 py-6 text-lg rounded-lg bg-background/50 hover:bg-card">
                Learn More <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
        {}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ staggerChildren: 0.2 }}
        >
          <StatCard icon={DollarSign} value={15600} label="Total Value Locked (USD)" prefix="$" />
          <StatCard icon={CheckCircle} value={85} label="Contracts Completed" />
          <StatCard icon={Users} value={230} label="Active Freelancers" />
        </motion.div>
        {}
        <QuickActions />
        {}
        <ActivityFeed />
        {}
        <HowItWorks />
        {}
        <PlatformPerformance />
        {/** Add Leaderboard section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-4xl"
        >
          <Leaderboard />
        </motion.div>

        <FeaturedContracts />
        {}
        <motion.div
           initial={{ opacity: 0}}
           whileInView={{ opacity: 1 }}
           viewport={{ once: true, amount: 0.5 }}
           transition={{ duration: 0.5, delay: 0.3 }}
           className="w-full max-w-4xl"
        >
           <TechLogos />
        </motion.div>
      </div>
      {}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.div
          className="relative w-20 h-20 md:w-20 md:h-17 rounded-full overflow-hidden shadow-lg cursor-pointer border-2 border-primary/70 shadow-[0_0_15px_2px_rgba(155,135,245,0.6)] hover:scale-110 transition-transform duration-300"
          onClick={() => setShowSocials(!showSocials)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <video
            src="/link.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover"
          />
        </motion.div>
        {}
        <AnimatePresence>
          {showSocials && (
            <motion.div
              className="absolute bottom-20 right-3.5 md:bottom-24 flex flex-col space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }}
              exit={{ opacity: 0, y: 20, transition: { staggerChildren: 0.05, staggerDirection: -1 } }}
            >
              {[ 
                { Icon: Twitter, href: 'https://twitter.com/securelance', label: 'Twitter' },
                { Icon: Github, href: 'https://github.com/securelance', label: 'GitHub' },
                { Icon: Linkedin, href: 'https://linkedin.com/company/securelance', label: 'LinkedIn' }
              ].map(({ Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 md:w-14 md:h-12 rounded-full bg-background/80 backdrop-blur-md border border-primary/60 flex items-center justify-center text-primary shadow-lg hover:bg-primary hover:text-background hover:shadow-primary/40 transition-all duration-300 glow-sm-primary"
                  variants={{ 
                    initial: { opacity: 0, scale: 0.5 }, 
                    animate: { opacity: 1, scale: 1 },
                    exit: { opacity: 0, scale: 0.5 }
                  }}
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={label}
                >
                  <Icon className="w-6 h-6 md:w-7 md:h-7" />
                </motion.a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;
