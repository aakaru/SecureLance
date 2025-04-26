import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Users, Lock, Milestone, ShieldCheck, Award } from 'lucide-react';
const steps = [
  { icon: FileText, title: 'Post or Find', description: 'Clients post contract needs, freelancers browse opportunities.', color: 'text-blue-400' },
  { icon: Users, title: 'Connect & Agree', description: 'Freelancers apply, clients select, terms are set.', color: 'text-purple-400' },
  { icon: Lock, title: 'Secure Escrow', description: 'Client funds are locked safely in a smart contract escrow.', color: 'text-yellow-400' },
  { icon: Milestone, title: 'Work & Deliver', description: 'Freelancer completes work based on agreed milestones.', color: 'text-pink-400' },
  { icon: ShieldCheck, title: 'Approve & Pay', description: 'Client approves milestones, funds released automatically.', color: 'text-teal-400' },
  { icon: Award, title: 'Build Reputation', description: 'Successful completion builds on-chain reputation for both parties.', color: 'text-primary' },
];
const stepVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};
export const HowItWorks = () => {
  return (
    <section className="w-full max-w-6xl">
      <motion.h2 
        className="text-3xl md:text-4xl font-bold mb-12 text-center text-foreground"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.5 }}
      >
        How SecureLance Works
      </motion.h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <motion.div
            key={step.title}
            className="flex flex-col items-center text-center p-6 bg-card/30 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg"
            variants={stepVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={`p-4 rounded-full bg-card mb-5 border border-white/10`}>
              <step.icon className={`h-8 w-8 ${step.color}`} />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
