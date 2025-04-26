import React from 'react';
import { motion } from 'framer-motion';
const TermsOfService = () => {
  const sections = [
    { 
      title: "1. Acceptance of Terms", 
      content: "By accessing or using the SecureLance platform ('Platform'), you agree to be bound by these Terms of Service ('Terms') and our Privacy Policy. If you do not agree, you may not use the Platform. These Terms constitute a legally binding agreement between you and SecureLance (referred to as 'we', 'us', or 'our')."
    },
    { 
      title: "2. Platform Overview", 
      content: "SecureLance provides a decentralized platform connecting clients and freelancers ('Users') for project collaborations. We utilize blockchain technology, smart contracts, and decentralized storage to facilitate secure agreements, escrow payments, and on-chain reputation management."
    },
    { 
      title: "3. User Obligations", 
      content: "You must be of legal age to form a binding contract. You are responsible for maintaining the security of your wallet and private keys. You agree to provide accurate information and use the Platform lawfully and ethically. You will not engage in fraudulent activities, spam, or harassment."
    },
    { 
      title: "4. Smart Contracts and Escrow", 
      content: "Contracts created on the Platform are governed by smart contracts deployed on a public blockchain. Funds deposited by clients are held in escrow by the smart contract and released upon fulfillment of predefined milestones or conditions agreed upon by both parties. Users are responsible for understanding the terms coded into the smart contract."
    },
    { 
      title: "5. Fees and Payments", 
      content: "Using the Platform may involve blockchain transaction fees (gas fees), payable by the user initiating the transaction. SecureLance may charge a service fee on completed contracts, which will be clearly disclosed. All payments are made in cryptocurrency via the integrated smart contracts."
    },
    { 
      title: "6. Reputation System", 
      content: "User reputation is based on completed contracts, feedback, and dispute outcomes recorded on the blockchain. This system is designed to be transparent and tamper-proof. Manipulation of the reputation system is strictly prohibited."
    },
    { 
      title: "7. Dispute Resolution", 
      content: "In case of disputes, Users should first attempt to resolve the issue directly. If unsuccessful, SecureLance provides access to a decentralized dispute resolution mechanism outlined in the specific contract or platform documentation. Decisions made through this process are typically binding."
    },
    { 
      title: "8. Intellectual Property", 
      content: "Freelancers retain ownership of the work they create unless otherwise specified in the contract agreement. Clients receive the rights to the work upon final payment and acceptance as defined in the contract. SecureLance owns the intellectual property related to the Platform itself."
    },
    { 
      title: "9. Disclaimers and Limitation of Liability", 
      content: "The Platform is provided 'as is' without warranties. We do not guarantee project success or user conduct. Blockchain transactions are irreversible. SecureLance is not liable for losses due to smart contract vulnerabilities (unless caused by our gross negligence), user errors, market volatility, or third-party actions. Our liability is limited to the maximum extent permitted by law."
    },
    { 
      title: "10. Modifications to Terms", 
      content: "We reserve the right to modify these Terms at any time. We will notify users of significant changes. Continued use of the Platform after changes constitutes acceptance of the new Terms."
    },
    { 
      title: "11. Governing Law", 
      content: "These Terms shall be governed by the laws of [Specify Jurisdiction - e.g., the jurisdiction where the company is registered, or specify rules for decentralized governance if applicable], without regard to its conflict of law principles."
    },
    { 
      title: "12. Contact", 
      content: "For questions about these Terms, please contact us at keshavjhagithub@gmail.com."
    }
  ];
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 100 }
    }
  };
  return (
    <motion.div
      className="container mx-auto px-4 py-12 md:py-16 max-w-4xl text-foreground"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 
        className="text-3xl md:text-4xl font-bold text-center mb-10 bg-gradient-to-r from-primary to-purple-400 inline-block text-transparent bg-clip-text"
        variants={itemVariants}
      >
        Terms of Service
      </motion.h1>
      <motion.p 
        className="text-sm text-muted-foreground text-center mb-10"
        variants={itemVariants}
      >
        Last Updated: April 25, 2025
      </motion.p>
      <div className="space-y-8">
        {sections.map((section, index) => (
          <motion.div 
            key={index} 
            className="bg-card/30 backdrop-blur-sm border border-border/40 rounded-lg p-6 shadow-sm"
            variants={itemVariants}
          >
            <h2 className="text-xl font-semibold mb-3 text-primary">{section.title}</h2>
            <p className="text-muted-foreground leading-relaxed">{section.content}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
export default TermsOfService;
