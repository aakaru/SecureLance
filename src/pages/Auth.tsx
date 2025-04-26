import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from '@/contexts/AuthContext';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useSignMessage, useEnsName } from 'wagmi';
import { toast } from 'sonner';
import axios from 'axios';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Loader2 } from 'lucide-react';
const formSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }).optional(),
});
const Auth = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const { signMessageAsync } = useSignMessage();
  const [isLoading, setIsLoading] = useState(false);
  const [showText, setShowText] = useState(false);
  const pageControls = useAnimation();
  const textControls = useAnimation();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });
  useEffect(() => {
    if (ensName && !form.getValues("username")) {
      form.setValue("username", ensName);
    } else if (address && !form.getValues("username") && !ensName) {
    }
  }, [address, ensName, form]);
  useEffect(() => {
    (async () => {
      await pageControls.start({ opacity: 1, scale: 1, transition: { duration: 0.7, ease: 'easeOut' } });
      setShowText(true);
      await textControls.start(i => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, delay: i * 0.25, type: 'spring', stiffness: 120, damping: 12 }
      }));
    })();
  }, [pageControls, textControls]);
  const handleSignIn = async (values: z.infer<typeof formSchema>) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first.');
      return;
    }
    setIsLoading(true);
    try {
      const nonceResponse = await axios.get(`http://localhost:5002/api/v1/auth/nonce/${address}`);
      const nonce = nonceResponse.data.nonce;
      if (!nonce) throw new Error('Failed to retrieve nonce from server.');
      const messageToSign = `Welcome to SecureLance! Sign this message to log in. Nonce: ${nonce}`;
      const signature = await signMessageAsync({ account: address, message: messageToSign });
      const verifyResponse = await axios.post('http://localhost:5002/api/v1/auth/verify', {
        address,
        signature,
        username: values.username || ensName || undefined,
      });
      const { token, ...userData } = verifyResponse.data;
      if (!token || !userData) throw new Error('Invalid response from verification server.');
      login(userData, token);
      toast.success('Successfully signed in!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Sign-in error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Sign-in failed.';
      if (errorMessage.includes('User rejected')) {
        toast.error('Signature request rejected.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={pageControls}
      exit={{ opacity: 0, scale: 0.95 }}
      className="h-screen w-full flex"
    >
      {}
      <div className="hidden md:flex w-1/2 h-full min-h-screen relative">
        <img
          src="/background.jpeg"
          alt="SecureLance background"
          className="object-fit w-full h-full min-h-screen"
        />
        {}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-web3-primary/40" />
        {}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
          {}
          <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-glow-primary mb-5">Welcome to SecureLance</h2>
          <p className="text-lg text-white/80 max-w-md mx-auto mb-3">A Web3 freelance platform where trust is built into every interaction.</p>
        </div>
      </div>
      {}
      <div className="flex w-full md:w-1/2 h-full items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="w-full shadow-xl border-border/30 backdrop-blur-sm bg-background/95">
              <CardHeader className="space-y-2 text-center pb-6 pt-8">
                <div className="flex justify-center mb-4">
                  <img src="/logo.png" alt="SecureLance Logo" className="h-400 w-auto" />
                </div>
                <div className="flex justify-center mb-6">
                  <ConnectButton 
                    accountStatus="address" 
                    showBalance={false} 
                    chainStatus="none"
                  />
                </div>
                <CardTitle className="text-2xl bg-gradient-to-r from-web3-primary to-web3-secondary inline-block text-transparent bg-clip-text drop-shadow-glow-primary min-h-[2.5em]">
                  <AnimatedWords words={["Independent", "FreeLance", "Secure"]} />
                </CardTitle>
                <CardDescription>
                  {isConnected 
                    ? "Verify wallet ownership to sign in or create your account."
                    : "Connect your wallet to get started."
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-6">
                {isConnected && (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSignIn)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder={ensName ? `e.g., ${ensName}` : "Choose a display name"} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="pt-4 space-y-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              type="submit" 
                              className="w-full glow-btn"
                              disabled={isLoading || !isConnected}
                            >
                              {isLoading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</>
                              ) : (
                                'Sign In / Sign Up'
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Sign a message with your wallet to prove ownership. <br/>This is secure and does not cost gas.</p>
                          </TooltipContent>
                        </Tooltip>
                        <p className="text-xs text-center text-muted-foreground px-4">
                          Signing proves you own this wallet, enabling secure, passwordless access.
                        </p>
                      </div>
                    </form>
                  </Form>
                )}
                {!isConnected && (
                  <p className="text-center text-muted-foreground mt-4">
                    Please connect your wallet using the button above.
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex flex-col space-y-4 pt-6 pb-8">
                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Web3 Powered
                    </span>
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground px-4">
                  By using SecureLance, you agree to our Terms of Service and Privacy Policy
                </p>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
const AnimatedWords = ({ words }: { words: string[] }) => {
  return (
    <motion.span
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.13,
            delayChildren: 0.2,
          },
        },
      }}
      className="inline-block"
    >
      {words.map((word, idx) => (
        <motion.span
          key={word}
          variants={{
            hidden: { opacity: 0, y: 24, scale: 0.95 },
            visible: {
              opacity: 1,
              y: 0,
              scale: 1.08,
              color: '#9b87f5',
              transition: {
                type: 'tween',
                duration: 0.45,
                ease: 'easeOut',
              },
            },
          }}
          style={{ 
            display: 'inline-block', 
            marginRight: idx < words.length - 1 ? '12px' : 0,
            paddingRight: idx < words.length - 1 ? '4px' : 0
          }}
          className="font-bold text-xl md:text-xl lg:text-xl tracking-tight"
        >
          {word}
          {idx < words.length - 1 && <span className="text-web3-primary ml-1">.</span>}
        </motion.span>
      ))}
    </motion.span>
  );
};
export default Auth;
