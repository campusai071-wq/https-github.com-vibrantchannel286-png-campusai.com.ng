import React, { useState } from 'react';
// @ts-ignore
import { useFlutterwave } from 'flutterwave-react-v3';

// Manual definition for closePaymentModal since the library export fails in Vite
const closePaymentModal = () => {
  const checkout = document.getElementsByName('checkout');
  if (checkout && checkout.length > 0) {
    checkout[0].setAttribute('style', 'display:none;');
  }
};
import { auth, MASTER_CONFIG } from '../services/firebaseConfig';
import { savePremiumSubscription } from '../services/dbService';
import PremiumSuccessModal from './PremiumSuccessModal';
import PremiumExplanationModal from './PremiumExplanationModal';

const PremiumChannelBanner: React.FC = () => {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showExplanationModal, setShowExplanationModal] = useState(false);
  
  const getFlutterwaveKey = () => {
    return MASTER_CONFIG.FLUTTERWAVE_PUBLIC_KEY || localStorage.getItem('campusai_flutterwave_key') || "FLWPUBK_TEST_PLACEHOLDER";
  };

  const premiumFwConfig = {
    public_key: getFlutterwaveKey(),
    tx_ref: 'premium_' + Date.now().toString(),
    amount: 500,
    currency: 'NGN',
    payment_options: 'card,mobilemoney,ussd',
    customer: {
      email: auth.currentUser?.email || 'student@campusai.com.ng',
      phone_number: '08000000000',
      name: 'CampusAI Student',
    },
    customizations: {
      title: 'CampusAI Premium',
      description: 'Daily admission alerts & briefings',
      logo: 'https://campusai.com.ng/favicon.svg',
    },
  };
  
  const handlePremiumPayment = useFlutterwave(premiumFwConfig);

  return (
    <>
      <div className="fixed bottom-[84px] md:bottom-0 left-0 right-0 z-[150] bg-gray-900/95 dark:bg-gray-900 border-t border-white/10 p-4 flex items-center justify-between gap-4 backdrop-blur-xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex-grow min-w-0">
          <p className="text-white text-[10px] sm:text-xs font-bold truncate">Get daily admission alerts — Join Premium for ₦500</p>
        </div>
        <button 
          onClick={() => setShowExplanationModal(true)}
          className="px-5 py-2.5 bg-cyan-500 text-white rounded-xl font-black text-[10px] md:text-[11px] uppercase tracking-widest hover:bg-cyan-600 transition-all shrink-0 shadow-lg shadow-cyan-500/20 active:scale-95"
        >
          Join Now
        </button>
      </div>
      <PremiumSuccessModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
      <PremiumExplanationModal 
        isOpen={showExplanationModal} 
        onClose={() => setShowExplanationModal(false)}
        onProceed={() => {
            setShowExplanationModal(false);
            handlePremiumPayment({
              callback: async (response: any) => {
                if (response.status === "successful") {
                  await savePremiumSubscription({
                    email: auth.currentUser?.email || 'student@campusai.com.ng',
                    paymentTimestamp: new Date(),
                    tx_ref: response.tx_ref
                  });
                  closePaymentModal();
                  setShowPremiumModal(true);
                }
              },
              onClose: () => {}
            });
        }}
      />
    </>
  );
};

export default PremiumChannelBanner;
