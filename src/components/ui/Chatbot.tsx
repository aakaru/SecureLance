import React, { useState } from 'react';

const CATEGORIES = [
  {
    name: 'Account & Login',
    questions: [
      'How do I sign up on SecureLance?',
      'How do I connect my Web3 wallet to SecureLance?',
      'What wallets are supported (MetaMask, Trust Wallet, etc.)?'
    ]
  },
  {
    name: 'Payments & Transactions',
    questions: [
      'How does the escrow system work?',
      'When are milestone payments released?',
      'Can I cancel a contract once started?'
    ]
  },
  {
    name: 'Gigs & Freelancing',
    questions: [
      'How do I get hired as a freelancer?',
      'How do milestone submissions work?',
      'How do I post a gig or job?',
      'How do I select a freelancer?',
      'What happens if a freelancer does not complete the work?'
    ]
  },
  {
    name: 'Support & Technical Help',
    questions: [
      'I’m facing an issue. How can I get support?',
      'Where can I report a bug?',
      'How do I update my profile information?'
    ]
  },
  {
    name: 'General Platform Usage',
    questions: [
      'Can I access SecureLance globally?',
      'Is there a mobile app for SecureLance?',
      'How do dispute resolutions work on-chain?'
    ]
  }
];

const FAQ_ANSWERS = {
  'How do I sign up on SecureLance?': 'To sign up, click the “Sign Up” button on the homepage and follow the instructions. You may need to connect your Web3 wallet during registration.',
  'How do I connect my Web3 wallet to SecureLance?': 'Click the “Connect Wallet” button (usually top right) and follow the prompts to connect MetaMask, Trust Wallet, or another supported wallet.',
  'What wallets are supported (MetaMask, Trust Wallet, etc.)?': 'SecureLance supports MetaMask, Trust Wallet, and any wallet compatible with WalletConnect.',
  'How does the escrow system work?': 'Client payments are locked in a smart contract. Funds are released to the freelancer after work is approved or a dispute is resolved.',
  'When are milestone payments released?': 'Milestone payments are released when the client approves the work. If the client does not respond in time, the platform may auto-release the funds.',
  'Can I cancel a contract once started?': 'You can request to cancel a contract. If both parties agree, it is cancelled. Otherwise, the jury system will resolve disputes.',
  'How do I get hired as a freelancer?': 'Browse gigs, submit proposals, and showcase your skills. Clients select freelancers based on profiles and proposals.',
  'How do milestone submissions work?': 'Freelancers submit work for each milestone. Clients review and approve or request changes. Payment is released upon approval.',
  'How do I post a gig or job?': 'Clients can post a gig from their dashboard by filling in project details. The gig will be visible to freelancers.',
  'How do I select a freelancer?': 'Review freelancer proposals, check profiles and ratings, and select the best fit for your gig.',
  'What happens if a freelancer does not complete the work?': 'Raise a dispute. The automated jury system will review and decide on fund release or refund.',
  'I’m facing an issue. How can I get support?': 'Use the “Contact Support” option in your dashboard or email support@securelance.com.',
  'Where can I report a bug?': 'Report bugs via the “Report a Bug” link in your dashboard or email support@securelance.com.',
  'How do I update my profile information?': 'Go to your profile page, click “Edit Profile,” update your info, and save changes.',
  'Can I access SecureLance globally?': 'Yes, SecureLance is a global platform accessible from anywhere.',
  'Is there a mobile app for SecureLance?': 'Currently, SecureLance is web-based. A mobile app may be released in the future.',
  'How do dispute resolutions work on-chain?': 'Disputes are resolved by an automated jury system on-chain. Jurors review evidence and vote. The smart contract executes the majority decision.'
};

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState('categories'); // 'categories' | 'questions' | 'answer' | 'custom'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [customInput, setCustomInput] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! How can we assist you today?' }
  ]);
  const [showCategories, setShowCategories] = useState(true);
  const [showRestoreCategories, setShowRestoreCategories] = useState(false);

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    setStep('questions');
  };

  const handleQuestionClick = (q) => {
    setSelectedQuestion(q);
    setMessages((prev) => [...prev, { sender: 'user', text: q }]);
    setStep('answer');
  };

  // Helper: detect greeting/help in any message
  const isGreetingOrHelp = (msg) => {
    if (!msg) return false;
    const lower = msg.toLowerCase();
    return /\b(hi|hello|hey|help me|help)\b/.test(lower);
  };

  const handleCustomSend = () => {
    if (!customInput.trim()) return;
    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: customInput },
      { sender: 'bot', text: isGreetingOrHelp(customInput)
        ? 'How can I assist you? If you need help, you can select a category or type your question.'
        : 'For additional help, please contact SecureLance support.' }
    ]);
    setCustomInput('');
    setShowCategories(false);
    setShowRestoreCategories(true);
  };

  const handleBack = () => {
    if (step === 'questions') {
      setStep('categories');
      setSelectedCategory(null);
    } else if (step === 'answer') {
      setStep('questions');
      setSelectedQuestion(null);
    } else if (step === 'custom') {
      setStep('categories');
      setCustomInput('');
    }
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563eb 60%, #0ea5e9 100%)',
            color: '#fff',
            border: 'none',
            boxShadow: '0 4px 24px rgba(37,99,235,0.18)',
            zIndex: 1000,
            cursor: 'pointer',
            fontSize: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'box-shadow 0.2s, transform 0.2s',
            outline: 'none',
            borderBottom: '4px solid #1e40af',
          }}
          aria-label="Open chatbot"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="12" fill="url(#chatbot-gradient)"/>
            <path d="M7 10h10M7 14h6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            <defs>
              <linearGradient id="chatbot-gradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2563eb"/>
                <stop offset="1" stopColor="#0ea5e9"/>
              </linearGradient>
            </defs>
          </svg>
        </button>
      )}
      {/* Chatbot widget */}
      {open && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, width: 350, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', border: '1px solid #eee', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', zIndex: 1000, fontFamily: 'inherit', color: '#222', maxHeight: 500, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 16, borderBottom: '1px solid #eee', fontWeight: 'bold', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 18, color: '#222' }}>
            SecureLance Chatbot
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888' }} aria-label="Close chatbot">×</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 16, color: '#222', fontSize: 15 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left', marginBottom: 8 }}>
                <div style={{ display: 'inline-block', background: msg.sender === 'user' ? '#e0f2fe' : '#f1f5f9', borderRadius: 8, padding: '8px 12px', maxWidth: '90%', color: '#222', fontSize: 15 }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {/* Main UI logic */}
            {showCategories && step === 'categories' && (
              <>
                <div style={{ fontWeight: 600, margin: '16px 0 8px 0', fontSize: 16 }}>Choose a category:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => handleCategoryClick(cat)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 8,
                        border: '1px solid #2563eb',
                        background: '#f1f5f9',
                        color: '#2563eb',
                        fontWeight: 500,
                        fontSize: 15,
                        marginBottom: 4,
                        cursor: 'pointer',
                        transition: 'background 0.2s, color 0.2s',
                      }}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </>
            )}
            {step === 'questions' && selectedCategory && showCategories && (
              <>
                <div style={{ fontWeight: 600, margin: '16px 0 8px 0', fontSize: 16 }}>{selectedCategory.name}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {selectedCategory.questions.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleQuestionClick(q)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid #0ea5e9',
                        background: '#e0f2fe',
                        color: '#0e3a5e',
                        fontWeight: 500,
                        fontSize: 15,
                        marginBottom: 4,
                        cursor: 'pointer',
                        transition: 'background 0.2s, color 0.2s',
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
                <button onClick={handleBack} style={{ marginTop: 16, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>← Back to Categories</button>
              </>
            )}
            {step === 'answer' && selectedQuestion && showCategories && (
              <>
                <div style={{ fontWeight: 600, margin: '16px 0 8px 0', fontSize: 16 }}>{selectedQuestion}</div>
                <div style={{ marginBottom: 16 }}>{FAQ_ANSWERS[selectedQuestion] || 'For additional help, please contact SecureLance support.'}</div>
                <button onClick={handleBack} style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>← Back to Questions</button>
              </>
            )}
            {showRestoreCategories && (
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <button
                  onClick={() => { setShowCategories(true); setShowRestoreCategories(false); setStep('categories'); setSelectedCategory(null); setSelectedQuestion(null); }}
                  style={{ color: '#fff', background: '#2563eb', border: 'none', borderRadius: 6, padding: '6px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.10)' }}
                >
                  Show Categories
                </button>
              </div>
            )}
          </div>
          {/* Free text input always visible at the bottom */}
          <div style={{ borderTop: '1px solid #eee', padding: 12, background: '#f8fafc', display: 'flex', alignItems: 'center' }}>
            <input
              type="text"
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              placeholder="Type your question..."
              style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #ddd', fontSize: 15, color: '#222', fontFamily: 'inherit' }}
              onKeyDown={e => e.key === 'Enter' && handleCustomSend()}
            />
            <button
              onClick={handleCustomSend}
              disabled={!customInput.trim()}
              style={{ marginLeft: 8, padding: '8px 16px', borderRadius: 6, background: '#2563eb', color: '#fff', border: 'none', fontSize: 15, fontWeight: 500, cursor: customInput.trim() ? 'pointer' : 'not-allowed' }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
