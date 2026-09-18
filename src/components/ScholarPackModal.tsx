
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, X, Check, Zap, ShieldCheck, ArrowRight, Sparkles, Loader2, CreditCard, Tag, Building2, RefreshCw } from 'lucide-react';
import { useFlutterwave } from 'flutterwave-react-v3';

// Manual definition for closePaymentModal since the library export fails in Vite
const closePaymentModal = () => {
  const checkout = document.getElementsByName('checkout');
  if (checkout && checkout.length > 0) {
    checkout[0].setAttribute('style', 'display:none;');
  }
};
import { updateUserProfile, isUserAdmin } from '../services/userService';
import { db, MASTER_CONFIG } from '../services/firebaseConfig';
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { trackPremiumClick, trackPaymentStarted, trackPurchase } from '../services/analytics';

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
  const [guestEmail, setGuestEmail] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [activeTab, setActiveTab] = useState<'card' | 'voucher' | 'transfer'>('card');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStatusMessage(null);
      trackPremiumClick({
        placement: 'scholar_pack_modal',
        target_plan: paymentConfig.label,
        current_credits: user?.scholarCredits || 0,
      });
    }
  }, [isOpen, paymentConfig.label, user?.scholarCredits]);

  const activeEmail = user?.email || guestEmail || 'scholar@campusai.com.ng';
  const isAdmin = isUserAdmin(user?.email) || isUserAdmin(user);

  const applyEntitlementLocally = async (creditsToAdd: number = 5) => {
    try {
      const currentCredits = user?.scholarCredits || 0;
      await updateUserProfile({
        is_premium: true,
        scholarCredits: currentCredits + creditsToAdd,
        premium_activated_at: new Date().toISOString()
      }, user?.uid);
    } catch (e) {
      console.warn("Local entitlement update:", e);
    }
  };

  const handleAdminInstantActivation = async () => {
    setIsProcessing(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/activate-premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user?.uid,
          email: user?.email,
          method: 'admin_override'
        })
      });
      const data = await res.json();
      if (data.success) {
        await applyEntitlementLocally(100);
        setStatusMessage({ type: 'success', text: 'Admin privileges & Scholar Pack Activated!' });
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to activate admin access.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoucherRedeem = async () => {
    if (!voucherCode.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter a voucher code (e.g. CAMPUSAI2026)' });
      return;
    }
    setIsProcessing(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/activate-premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user?.uid,
          email: activeEmail,
          voucherCode: voucherCode.trim(),
          method: 'voucher'
        })
      });
      const data = await res.json();
      if (data.success) {
        await applyEntitlementLocally(data.creditsAdded || 5);
        setStatusMessage({ type: 'success', text: data.message || 'Voucher redeemed successfully!' });
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Invalid voucher code.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBankTransferConfirm = async () => {
    setIsProcessing(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/activate-premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user?.uid,
          email: activeEmail,
          method: 'bank_transfer'
        })
      });
      const data = await res.json();
      if (data.success) {
        await applyEntitlementLocally(5);
        setStatusMessage({ type: 'success', text: 'Transfer verified! Scholar Pack Activated.' });
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Transfer verification failed.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const fwConfig = {
    public_key: MASTER_CONFIG.FLUTTERWAVE_PUBLIC_KEY || 'FLWPUBK_TEST-X',
    tx_ref: `campusai-${Date.now()}`,
    amount: paymentConfig.amount,
    currency: 'NGN',
    payment_options: 'card,mobilemoney,ussd',
    customer: {
      email: activeEmail,
      phone_number: '',
      name: user?.displayName || 'Scholar',
    },
    customizations: {
      title: `CampusAI ${paymentConfig.label}`,
      description: paymentConfig.type === 'pack' 
        ? '5 calculations and 5 daily chats' 
        : `Unlock ${paymentConfig.label}`,
      logo: 'https://campusai.com.ng/logo.png',
    },
  };

  const handleFlutterPayment = useFlutterwave(fwConfig);

  const handleUpgrade = () => {
    setIsProcessing(true);
    setStatusMessage(null);
    
    // GA4 Event: payment_started
    trackPaymentStarted({
      item_name: paymentConfig.label,
      amount: paymentConfig.amount,
      currency: 'NGN',
      payment_type: paymentConfig.type,
      tx_ref: fwConfig.tx_ref
    });

    try {
      handleFlutterPayment({
        callback: async (response) => {
          if (response.status === "successful") {
            trackPurchase({
              transaction_id: response.transaction_id || response.tx_ref || fwConfig.tx_ref,
              value: paymentConfig.amount,
              currency: 'NGN',
              item_name: paymentConfig.label,
              payment_type: paymentConfig.type,
            });

            try {
              const verifyRes = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  transaction_id: response.transaction_id,
                  tx_ref: response.tx_ref || fwConfig.tx_ref,
                  type: paymentConfig.type,
                  toolId: paymentConfig.toolId,
                  email: activeEmail,
                  uid: user?.uid
                })
              });
              const verifyData = await verifyRes.json();
              if (!verifyData.success) {
                setStatusMessage({ type: 'error', text: "Verification warning: " + (verifyData.error || "Please restore access") });
              }
            } catch (apiErr: any) {
              console.error("Payment API verification error:", apiErr);
            }

            await applyEntitlementLocally(5);
            setStatusMessage({ type: 'success', text: `${paymentConfig.label} Activated Successfully!` });
            setTimeout(() => {
              onClose();
            }, 1500);
          } else {
            setStatusMessage({ type: 'error', text: "Payment was not successful. Try Voucher or Bank Transfer." });
          }
          setIsProcessing(false);
          closePaymentModal();
        },
        onClose: () => {
          setIsProcessing(false);
        },
      });
    } catch (e: any) {
      console.error("Flutterwave initialization error:", e);
      setIsProcessing(false);
      setStatusMessage({ type: 'error', text: "Payment window could not open in this browser. Please use Redeem Voucher or Bank Transfer below." });
    }
  };

  const features = [
    "5 Premium AI calculations",
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
              <div className="md:w-1/2 p-8 md:p-12 bg-gray-50 dark:bg-gray-900/50 flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 bg-blue-600 text-white rounded-[20px] flex items-center justify-center mb-6 shadow-xl shadow-blue-600/20">
                    <Crown size={28} />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black dark:text-white mb-4 leading-tight uppercase tracking-tight">
                    {paymentConfig.type === 'pack' ? 'Scholar' : paymentConfig.type === 'refill' ? 'Quota' : 'Tool'} <br />
                    <span className="text-blue-600">{paymentConfig.type === 'pack' ? 'Pack 2026' : paymentConfig.type === 'refill' ? 'Refill' : 'Unlock'}</span>
                  </h3>
                  
                  <div className="space-y-3">
                    {paymentConfig.type === 'pack' ? features.map((f, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center shrink-0">
                          <Check size={12} strokeWidth={4} />
                        </div>
                        <span className="text-xs font-bold text-gray-600 dark:text-slate-300 uppercase tracking-wider">{f}</span>
                      </div>
                    )) : (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center shrink-0">
                          <Check size={12} strokeWidth={4} />
                        </div>
                        <span className="text-xs font-bold text-gray-600 dark:text-slate-300 uppercase tracking-wider">
                          {paymentConfig.type === 'refill' ? `Instant ${paymentConfig.amount === 100 ? '1' : '5'} Extra AI Session${paymentConfig.amount === 100 ? '' : 's'}` : `Full Access to ${paymentConfig.label}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 p-5 bg-white dark:bg-gray-800 rounded-[24px] border border-gray-100 dark:border-gray-700 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      {paymentConfig.type === 'pack' ? '5 Full Trials' : 'One-Time Payment'}
                    </p>
                    <div className="flex items-baseline gap-1">
                       <span className="text-3xl font-black dark:text-white">₦{paymentConfig.amount}</span>
                       <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                         {paymentConfig.type === 'pack' ? ' / 5 Full Uses' : ' / Use'}
                       </span>
                    </div>
                </div>
              </div>

              <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-between relative">
                <div className="space-y-5 text-center md:text-left">
                  {isAdmin && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
                      <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-wider mb-2">
                        <Sparkles size={14} /> Admin Access Detected
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
                        Signed in as <strong>{user?.email}</strong>. You have unrestricted access.
                      </p>
                      <button
                        onClick={handleAdminInstantActivation}
                        disabled={isProcessing}
                        className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        {isProcessing ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} />}
                        1-Click Activate Full Scholar Access (Free)
                      </button>
                    </div>
                  )}

                  {/* Payment Method Selector Tabs */}
                  <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl gap-1">
                    <button
                      type="button"
                      onClick={() => setActiveTab('card')}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${activeTab === 'card' ? 'bg-white dark:bg-gray-900 text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                      <CreditCard size={14} /> Online
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('voucher')}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${activeTab === 'voucher' ? 'bg-white dark:bg-gray-900 text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                      <Tag size={14} /> Voucher
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('transfer')}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${activeTab === 'transfer' ? 'bg-white dark:bg-gray-900 text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                      <Building2 size={14} /> Transfer
                    </button>
                  </div>

                  {statusMessage && (
                    <div className={`p-3.5 rounded-2xl text-xs font-medium ${statusMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'}`}>
                      {statusMessage.text}
                    </div>
                  )}

                  {activeTab === 'card' && (
                    <div className="space-y-4">
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Pay with Debit Card, USSD, or Bank Account securely powered by Flutterwave.
                      </p>
                      
                      <button 
                        onClick={handleUpgrade}
                        disabled={isProcessing}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                      >
                        {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <><CreditCard size={18} /> Pay ₦{paymentConfig.amount} with Card</>}
                      </button>
                    </div>
                  )}

                  {activeTab === 'voucher' && (
                    <div className="space-y-3">
                      <p className="text-xs text-gray-500">
                        Have a scholarship or promo code? Enter it below for instant activation.
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. CAMPUSAI2026"
                          value={voucherCode}
                          onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                          className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold tracking-wider uppercase focus:outline-none focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={handleVoucherRedeem}
                          disabled={isProcessing}
                          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all disabled:opacity-50"
                        >
                          {isProcessing ? <Loader2 className="animate-spin" size={16} /> : 'Apply'}
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-400">
                        Try code: <span className="font-mono text-blue-500 font-bold">CAMPUSAI2026</span>
                      </p>
                    </div>
                  )}

                  {activeTab === 'transfer' && (
                    <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 text-left">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400 font-bold uppercase">Bank</span>
                        <span className="font-bold text-gray-800 dark:text-gray-200">OPay / Moniepoint</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400 font-bold uppercase">Account Name</span>
                        <span className="font-bold text-gray-800 dark:text-gray-200">CampusAI Admission</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400 font-bold uppercase">Amount</span>
                        <span className="font-black text-emerald-600">₦{paymentConfig.amount}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleBankTransferConfirm}
                        disabled={isProcessing}
                        className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                        I Have Sent ₦{paymentConfig.amount} — Activate Now
                      </button>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800 text-center space-y-2">
                    <button 
                      type="button"
                      onClick={async () => {
                        if (!user?.uid) {
                          setStatusMessage({ type: 'error', text: "Please sign in first to restore access." });
                          return;
                        }
                        setIsProcessing(true);
                        try {
                          const res = await fetch('/api/restore-access', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ uid: user.uid, email: user.email })
                          });
                          const data = await res.json();
                          if (data.success) {
                            await applyEntitlementLocally(5);
                            setStatusMessage({ type: 'success', text: "Access successfully restored from verified records!" });
                            setTimeout(() => {
                              onClose();
                            }, 1500);
                          } else {
                            setStatusMessage({ type: 'error', text: data.error || "No verified purchase record found for this account." });
                          }
                        } catch (err: any) {
                          setStatusMessage({ type: 'error', text: "Failed to restore: " + err.message });
                        } finally {
                          setIsProcessing(false);
                        }
                      }}
                      className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest hover:underline block mx-auto"
                    >
                      Already Paid? Click Here to Restore Access ⚡
                    </button>
                    <button 
                      onClick={() => window.open(`https://wa.me/2349169760634?text=Payment Issue. UID: ${user?.uid}`, '_blank')}
                      className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline block mx-auto"
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
