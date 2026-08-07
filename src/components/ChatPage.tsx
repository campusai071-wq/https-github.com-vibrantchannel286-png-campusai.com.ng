import React, { useState } from 'react';
import AIChatDrawer from './AIChatDrawer';
import { motion } from 'framer-motion';

const ChatPage: React.FC = () => {
  return (
    <div className="pt-24 min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center">
      <div className="w-full max-w-4xl px-4 md:px-8 flex flex-col h-[calc(100vh-6rem)] relative">
        <AIChatDrawer isOpen={true} onClose={() => {}} inline={true} />
      </div>
    </div>
  );
};

export default ChatPage;
