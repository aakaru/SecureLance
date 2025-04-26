import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Award, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
const activities = [
  { id: 1, type: 'contract-accepted', text: '"DeFi Dashboard" contract accepted', timestamp: '2h ago', icon: CheckCircle, color: 'text-green-400' },
  { id: 2, type: 'milestone-approved', text: 'Milestone 1 approved for "NFT Bridge Audit" ', timestamp: '5h ago', icon: Award, color: 'text-primary' },
  { id: 3, type: 'payment-received', text: 'Received 1.5 ETH payment for "DAO UI" Phase 1', timestamp: '1d ago', icon: CheckCircle, color: 'text-green-400' },
  { id: 4, type: 'dispute-opened', text: 'Dispute opened on "Social Network Backend" ', timestamp: '2d ago', icon: AlertCircle, color: 'text-red-400' },
  { id: 5, type: 'new-message', text: 'New message regarding "Marketplace Integration" ', timestamp: '3d ago', icon: MessageSquare, color: 'text-blue-400' },
  { id: 6, type: 'contract-completed', text: '"Tokenomics Design" contract completed', timestamp: '4d ago', icon: CheckCircle, color: 'text-green-400' },
];
const itemVariants = {
  hidden: { opacity: 0, x: -15 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.4 }
  }
};
export const ActivityFeed = () => {
  return (
    <section className="w-full max-w-6xl mb-24">
      <motion.h2 
        className="text-3xl font-bold mb-8 text-center text-foreground"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.5 }}
      >
        Recent Activity
      </motion.h2>
      <Card className="bg-card/40 backdrop-blur-md border border-white/10 rounded-xl shadow-xl overflow-hidden">
        <CardContent className="p-0"> {}
          <ScrollArea className="h-[300px] w-full p-4"> {}
            <ul className="space-y-4">
              {activities.map((activity, index) => (
                <motion.li 
                  key={activity.id}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors duration-200"
                  variants={itemVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: index * 0.08 }}
                >
                  <activity.icon className={cn("h-5 w-5 flex-shrink-0", activity.color)} />
                  <span className="flex-grow text-sm text-foreground/90 truncate">{activity.text}</span>
                  <span className="text-xs text-muted-foreground flex-shrink-0">{activity.timestamp}</span>
                </motion.li>
              ))}
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>
    </section>
  );
};
