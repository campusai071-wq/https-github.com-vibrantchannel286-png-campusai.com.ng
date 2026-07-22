import React from 'react';
import { Users, Gift, Copy } from 'lucide-react';
import { UserProfile } from '../types';

interface InviteEarnProps {
  user: UserProfile;
}

const InviteEarn: React.FC<InviteEarnProps> = ({ user }) => {
  const referralLink = `${window.location.origin}?ref=${user.uid}`;
  const referralCount = user.referral_count || 0;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    alert('Referral link copied to clipboard!');
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-[32px] p-8 text-center text-white shadow-2xl relative overflow-hidden">
      <div className="relative z-10">
        <h3 className="text-2xl font-black mb-2 flex items-center justify-center gap-3">
          <Gift className="text-emerald-400" /> Invite & Earn
        </h3>
        <p className="text-indigo-200 text-sm mb-6">Invite friends and get 3 free AI calculation credits!</p>
        
        <div className="bg-indigo-950/50 rounded-2xl p-4 mb-6 flex justify-between items-center cursor-pointer hover:bg-indigo-950/70 transition-colors" onClick={copyLink}>
          <span className="font-mono text-xs truncate mr-4">{referralLink}</span>
          <div className="p-2 bg-indigo-800 rounded-lg shrink-0">
            <Copy size={16} />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold">
           <Users size={20} />
           <span>{referralCount} friends joined</span>
        </div>
        
        <div className="mt-8 text-left bg-indigo-950/30 p-4 rounded-xl text-indigo-200 text-xs">
          <h4 className="font-bold text-white mb-2">How it works:</h4>
          <ul className="list-disc pl-4 space-y-1">
             <li>Share your unique link with friends.</li>
             <li>Get 3 free AI calculation credits when your first friend registers.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InviteEarn;
