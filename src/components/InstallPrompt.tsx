import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Sparkles, AppWindow } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { logUserActivity } from '../services/dbService';
import { useStandalone } from '../hooks/useStandalone';

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const isStandalone = useStandalone();

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Listen for manual trigger from settings/buttons
    const handleManualTrigger = () => {
      setIsVisible(true);
    };
    window.addEventListener('campusai_trigger_install', handleManualTrigger);

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('campusai_trigger_install', handleManualTrigger);
    };
  }, [isStandalone]);

  // if (isStandalone) return null; // Removed to allow users to download APK even if PWA is installed

  const handleInstallPWA = async () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    
    if (isIOS) {
      alert("To install CampusAI on iOS: Tap the 'Share' button in Safari and select 'Add to Home Screen'.");
      return;
    }

    if (!deferredPrompt) {
      alert("To install CampusAI as an app on your device:\n\n• On Chrome / Android: Tap your browser's menu (⋮) and select 'Install app' or 'Add to Home screen'.\n• On Safari / iPhone: Tap Share and select 'Add to Home Screen'.");
      return;
    }

    logUserActivity({
      userId: '', // Anonymous ok for installs
      type: 'install_click',
      title: 'PWA Install Click',
      description: 'Clicked Install App button'
    });

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('campusai_install_dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-[110px] md:bottom-24 left-4 right-4 md:right-auto md:left-8 md:w-96 z-[999] shadow-2xl"
          id="install-prompt-card"
        >
          <div className="bg-gray-900 border border-white/10 text-white p-5 rounded-[24px] relative overflow-hidden backdrop-blur-xl">
            <button 
              onClick={handleDismiss} 
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
              id="close-install-prompt"
            >
              <X size={16} />
            </button>

            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                <Smartphone size={24} />
              </div>
              <div className="pr-6">
                <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest flex items-center gap-1">
                  <Sparkles size={10} /> Get CampusAI App
                </p>
                <h3 className="text-sm font-bold text-white mt-1">Install Web App</h3>
                <p className="text-xs text-gray-300 mt-1">
                  Install CampusAI on your home screen for instant offline access and faster loading.
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button 
                onClick={handleInstallPWA}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-all rounded-xl text-xs font-bold text-white shadow-lg shadow-blue-600/30"
                id="btn-install-pwa"
              >
                <AppWindow size={15} />
                Install on Device
              </button>
              <button 
                onClick={handleDismiss}
                className="py-3 px-4 bg-gray-800 hover:bg-gray-700 active:scale-[0.98] transition-all rounded-xl text-xs font-semibold text-gray-300"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallPrompt;
