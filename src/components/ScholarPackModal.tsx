
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, X, Check, Zap, ShieldCheck, ArrowRight, Sparkles, Loader2, CreditCard } from 'lucide-react';
import { useFlutterwave } from 'flutterwave-react-v3';

// Manual definition for closePaymentModal since the library export fails in Vite
const closePaymentModal = () => {
  const checkout = document.getElementsByName('checkout');
  if (checkout && checkout.length > 0) {
    checkout[0].setAttribute('style', 'display:none;');
  }
};
import { updateUserProfile } from '../services/userService';
import { db, MASTER_CONFIG } from '../services/firebaseConfig';
import { collection, addDoc, Timestamp } from "firebase/firestore";

interface ScholarPackModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  paymentConfig?: {
    type: 'pack' | 'refill' | 'tool';
    amount: number;
    label: string;
    toolId?: string;
  };
}

const ScholarPackModal: React.FC<ScholarPackModalProps> = ({ isOpen, onClose, user, paymentConfig = { type: 'pack', amount: 500, label: 'Scholar Pack 2026' } }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const fwConfig = {
    public_key: MASTER_CONFIG.FLUTTERWAVE_PUBLIC_KEY || 'FLWPUBK_TEST-X',
    tx_ref: `campusai-${Date.now()}`,
    amount: paymentConfig.amount,
    currency: 'NGN',
    payment_options: 'card,mobilemoney,ussd',
    customer: {
      email: user?.email || 'scholar@campusai.com.ng',
      phone_number: '',
      name: user?.displayName || 'Scholar',
    },
    customizations: {
      title: `CampusAI ${paymentConfig.label}`,
      description: paymentConfig.type === 'pack' 
        ? '3 calculations and 5 daily chats' 
        : `Unlock ${paymentConfig.label}`,
      logo: 'https://campusai.com.ng/logo.png',
    },
  };

  const handleFlutterPayment = useFlutterwave(fwConfig);

  const handleUpgrade = () => {
    if (!user) return;
    setIsProcessing(true);
    
    handleFlutterPayment({
      callback: async (response) => {
        if (response.status === "successful") {
          if (paymentConfig.type === 'pack' || paymentConfig.type === 'refill') {
            const currentCredits = user?.scholarCredits || 0;
            await updateUserProfile({ 
              is_premium: true, 
              scholarCredits: currentCredits + 3,
              premium_activated_at: new Date().toISOString()
            }, user.uid);
            alert(`${paymentConfig.label} Activated Successfully! You now have ${currentCredits + 3} premium calculation trials and increased daily chats.`);
          } else {
            const currentCredits = user?.scholarCredits || 0;
            await updateUserProfile({ 
              is_premium: true, 
              scholarCredits: currentCredits + 3,
              premium_activated_at: new Date().toISOString()
            }, user.uid);
            alert(`${paymentConfig.label} Unlocked! 3 Premium Sessions added to your scholar account.`);
          }
          
          // Log Payment in Firestore
          if (db) {
            try {
              await addDoc(collection(db, "payments"), {
                uid: user.uid,
                email: user.email,
                amount: paymentConfig.amount,
                type: paymentConfig.type,
                label: paymentConfig.label,
                status: 'success',
                tx_ref: response.tx_ref,
                flw_ref: response.flw_ref,
                transaction_id: response.transaction_id,
                createdAt: Timestamp.now()
              });
            } catch (e) {
              console.error("Payment Logging Error:", e);
            }
          }
          
          onClose();
        } else {
          alert("Payment was not successful. Please try again.");
        }
        setIsProcessing(false);
        closePaymentModal();
      },
      onClose: () => {
        setIsProcessing(false);
      },
    });
  };

  const features = [
    "3 Premium AI calculations",
    "10 Daily Chats for 2 Days (then 5/day)",
    "Detailed Merit Probabilities",
    "Full Budget & Hostel Estimates",
    "Strategic Course Alternatives",
    "Direct Architect Support Access"
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-2xl" 
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 40 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            className="relative bg-white dark:bg-gray-950 w-full max-w-2xl max-h-[90vh] rounded-[32px] md:rounded-[48px] overflow-y-auto no-scrollbar shadow-2xl border border-gray-100 dark:border-gray-800"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
            
            <button onClick={onClose} className="absolute top-8 right-8 p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:scale-110 transition-transform z-10">
              <X size={20} />
            </button>

            <div className="flex flex-col md:flex-row h-full">
              <div className="md:w-1/2 p-10 md:p-12 bg-gray-50 dark:bg-gray-900/50">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-[24px] flex items-center justify-center mb-8 shadow-xl shadow-blue-600/20">
                  <Crown size={32} />
                </div>
                <h3 className="text-3xl font-black dark:text-white mb-6 leading-tight uppercase tracking-tight">
                  {paymentConfig.type === 'pack' ? 'Scholar' : paymentConfig.type === 'refill' ? 'Quota' : 'Tool'} <br />
                  <span className="text-blue-600">{paymentConfig.type === 'pack' ? 'Pack 2026' : paymentConfig.type === 'refill' ? 'Refill' : 'Unlock'}</span>
                </h3>
                
                <div className="space-y-4">
                  {paymentConfig.type === 'pack' ? features.map((f, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center shrink-0">
                        <Check size={12} strokeWidth={4} />
                      </div>
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">{f}</span>
                    </div>
                  )) : (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center shrink-0">
                        <Check size={12} strokeWidth={4} />
                      </div>
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        {paymentConfig.type === 'refill' ? 'Instant 3 Extra AI Sessions' : `Full Access to ${paymentConfig.label}`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-12 p-6 bg-white dark:bg-gray-800 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      {paymentConfig.type === 'pack' ? '3 Full Trials' : 'One-Time Payment'}
                    </p>
                    <div className="flex items-baseline gap-1">
                       <span className="text-3xl font-black dark:text-white">₦{paymentConfig.amount}</span>
                       <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                         {paymentConfig.type === 'pack' ? ' / 3 Full Uses' : ' / Use'}
                       </span>
                    </div>
                </div>
              </div>

              <div className="md:w-1/2 p-10 md:p-12 flex flex-col justify-center relative">
                <div className="space-y-6 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <ShieldCheck size={14} /> Secure Payment
                  </div>
                  <h4 className="text-xl font-black dark:text-white uppercase tracking-tight">
                    {paymentConfig.type === 'pack' ? 'Activate Your Intelligence Node' : `Unlock ${paymentConfig.label}`}
                  </h4>
                  <p className="text-sm font-medium text-gray-500 leading-relaxed">
                    {paymentConfig.type === 'pack' 
                      ? 'Secure your admission journey with 3 full AI signals and priority processing for the 2026 cycle.'
                      : `Get instant access to ${paymentConfig.label} and supercharge your academic performance.`}
                  </p>
                  
                  <button 
                    onClick={handleUpgrade}
                    disabled={isProcessing}
                    className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/40 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <><CreditCard size={20} /> Pay with Flutterwave</>}
                  </button>

                  <p className="text-[9px] font-bold text-gray-400 text-center uppercase tracking-widest">
                    Secured by Flutterwave. <br />
                    Instant activation upon confirmation.
                  </p>

                  <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-800 text-center">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">Payment Issues?</p>
                    <button 
                      onClick={() => window.open(`https://wa.me/2349169760634?text=Payment Issue. UID: ${user?.uid}`, '_blank')}
                      className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                    >
                      Contact Support (UID: {user?.uid?.substring(0, 8)}...)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ScholarPackModal;
