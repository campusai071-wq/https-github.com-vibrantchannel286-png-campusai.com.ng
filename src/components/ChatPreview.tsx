
import React, { useState } from 'react';
import { Brain, Send, Sparkles } from 'lucide-react';

interface ChatPreviewProps {
  onFullAccess: () => void;
}

const ChatPreview: React.FC<ChatPreviewProps> = ({ onFullAccess }) => {
  const [input, setInput] = useState('');

  const examplePrompts = [
    "What's the latest news from FUTA?",
    "When is JAMB 2026 starting?",
    "List top Federal universities in the North."
  ];

  return (
    <section className="py-20 bg-blue-900 text-white overflow-hidden relative">
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]"></div>

      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2 text-left">
            <div className="inline-flex items-center gap-2 bg-blue-800/50 border border-blue-700 px-4 py-2 rounded-full text-blue-200 text-sm font-bold mb-6">
              <Sparkles size={16} className="text-emerald-400" />
              AI POWERED ASSISTANT
            </div>
            <h2 className="text-4xl font-extrabold mb-6 leading-tight">
              Instant Answers to Your <span className="text-emerald-400">Campus Questions</span>
            </h2>
            <p className="text-blue-100 mb-8 text-lg">
              Don't waste time searching through hundreds of threads. Ask our trained AI assistant for precise info on admissions, deadlines, and requirements.
            </p>
            <div className="hidden md:block">
              <p className="text-blue-300 text-sm mb-4 font-bold uppercase tracking-wider">Try asking:</p>
              <div className="flex flex-col gap-3">
                {examplePrompts.map((prompt, i) => (
                  <button 
                    key={i}
                    onClick={() => setInput(prompt)}
                    className="text-left bg-blue-800/30 hover:bg-blue-800/60 border border-blue-700 p-3 rounded-lg text-sm transition-all"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="md:w-1/2 w-full">
            <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 text-gray-900 relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                  <Brain size={20} />
                </div>
                <div>
                  <h4 className="font-bold">CampusAI Assistant</h4>
                  <div className="flex items-center text-xs text-emerald-600 font-bold">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>
                    ONLINE
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 mb-6 min-h-[120px] border border-gray-100 text-gray-600 text-sm leading-relaxed italic">
                "Hi there! I'm CampusAI. Ask me anything about Nigerian universities, admissions, or JAMB. I'm here to help you stay ahead!"
              </div>

              <div className="relative group">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask CampusAI..."
                  className="w-full bg-gray-100 border-2 border-transparent focus:border-blue-500 focus:bg-white p-4 pr-16 rounded-2xl outline-none transition-all shadow-inner"
                />
                <button 
                  onClick={onFullAccess}
                  className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-xl transition-all flex items-center justify-center"
                >
                  <Send size={18} />
                </button>
              </div>

              <div className="mt-6 flex justify-center">
                <button 
                  onClick={onFullAccess}
                  className="text-blue-600 font-bold text-sm hover:underline"
                >
                  Go to Full Chat Mode &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatPreview;
