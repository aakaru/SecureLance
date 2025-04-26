import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { PlusCircle, ClipboardCheck, Search } from 'lucide-react';
const actions = [
  {
    title: 'Create Contract',
    description: 'Start a new project or task.',
    icon: PlusCircle,
    href: '/create-contract', 
    color: 'text-blue-400'
  },
  {
    title: 'Manage Contracts',
    description: 'View your active and past jobs.',
    icon: ClipboardCheck,
    href: '/my-contracts',
    color: 'text-purple-400'
  },
  {
    title: 'Browse All',
    description: 'Find new opportunities.',
    icon: Search,
    href: '/browse',
    color: 'text-green-400'
  },
];
const actionCardVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.4 }
  }
};
export const QuickActions = () => {
  return (
    <section className="w-full max-w-6xl mb-24">
      <motion.h2 
        className="text-3xl font-bold mb-8 text-center text-foreground"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.5 }}
      >
        Quick Actions
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {actions.map((action, index) => (
          <motion.div
            key={action.title}
            variants={actionCardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: index * 0.15 }}
          >
            <Link to={action.href}>
              <Card className="h-full bg-card/40 backdrop-blur-md border border-white/10 rounded-xl shadow-xl hover:border-primary/50 transition-all duration-300 card-hover p-6 group">
                <CardContent className="flex flex-col items-center text-center">
                  <motion.div whileHover={{ scale: 1.15 }}>
                     <action.icon className={`h-10 w-10 mb-4 ${action.color} transition-colors duration-300 group-hover:text-white`} />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors duration-300">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
