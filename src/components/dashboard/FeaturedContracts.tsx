import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
const featuredContracts = [
  {
    id: '1',
    title: 'Build Decentralized Social Network',
    description: 'Seeking experienced team for a next-gen Web3 social platform using Lens Protocol...',
    budget: '15 ETH',
    tags: ['SocialFi', 'Lens Protocol', 'React', 'Solidity'],
    isNew: true,
  },
  {
    id: '2',
    title: 'Cross-Chain NFT Bridge Audit',
    description: 'Security audit required for our novel cross-chain NFT bridging solution...',
    budget: '~ $8,000 USD',
    tags: ['Security', 'Audit', 'NFT', 'Bridge'],
    isNew: false,
  },
  {
    id: '3',
    title: 'Real-Time DeFi Analytics Dashboard',
    description: 'Develop a dashboard displaying real-time analytics using The Graph and WebSockets...',
    budget: '2.5 ETH',
    tags: ['DeFi', 'The Graph', 'Next.js', 'WebSockets'],
    isNew: true,
  },
];
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};
export const FeaturedContracts = () => {
  return (
    <section className="w-full max-w-6xl mb-24">
      <motion.h2 
        className="text-3xl font-bold mb-8 text-center text-foreground"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.5 }}
      >
        Featured Contracts
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {featuredContracts.map((contract, index) => (
          <motion.div
            key={contract.id}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: index * 0.1 }} 
          >
            <Card className="h-full flex flex-col bg-card/40 backdrop-blur-md border border-white/10 rounded-xl shadow-xl overflow-hidden card-hover transition-all duration-300 hover:border-primary/50 hover:shadow-primary/20">
              <CardHeader className="relative pt-4 px-4">
                {contract.isNew && (
                  <Badge variant="outline" className="absolute top-4 right-4 bg-primary/10 border-primary text-primary font-semibold text-xs px-2 py-0.5">
                    <Zap className="mr-1 h-3 w-3"/> New
                  </Badge>
                )}
                <CardTitle className="text-lg font-semibold text-foreground mr-10">{contract.title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground pt-1">
                  Budget: {contract.budget}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between p-4">
                <p className="text-sm text-foreground/80 mb-4 line-clamp-3">
                  {contract.description}
                </p>
                <div className="mb-4 flex flex-wrap gap-2">
                  {contract.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="bg-secondary/60 hover:bg-secondary/90">{tag}</Badge>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-auto bg-background/50 hover:bg-primary hover:text-primary-foreground border-primary/30 hover:border-primary transition-all duration-300">
                  View Details <ArrowRight className="ml-2 h-4 w-4"/>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      <div className="text-center mt-10">
         <Button variant="link" asChild>
            <Link to="/browse" className="text-primary hover:text-primary/80">
              Browse All Contracts <ArrowRight className="ml-1 h-4 w-4"/>
            </Link>
         </Button>
      </div>
    </section>
  );
};
