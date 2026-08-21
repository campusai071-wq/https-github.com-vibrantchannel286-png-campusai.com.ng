import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, BookOpen, Newspaper, GraduationCap, FileText, CheckSquare, Search, Award, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getStoredLinkPreviews, fetchLinkPreviewsFromCloud, LinkPreviewMap } from '../services/linkPreviewService';

interface ToolCardProps {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  path: string;
  delay?: number;
  previewImage?: string;
}

const ToolCard: React.FC<ToolCardProps> = ({ title, subtitle, icon: Icon, path, delay = 0, previewImage }) => {
  return (
    <Link to={path} className="block group h-full">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        className="h-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all duration-300 relative overflow-hidden flex flex-col"
      >
        {previewImage ? (
          <div className="relative w-full h-36 overflow-hidden bg-gray-100 dark:bg-gray-950">
            <img 
              src={previewImage} 
              alt={`${title} Preview`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute top-3 right-3 bg-blue-600/90 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg backdrop-blur-md flex items-center gap-1">
              <ImageIcon size={10} /> Link Preview
            </div>
            <div className="absolute bottom-3 left-3 right-3 text-white">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-cyan-950/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-cyan-500/30">
                {subtitle}
              </span>
            </div>
          </div>
        ) : (
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 dark:bg-blue-900/10 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0" />
        )}
        
        <div className="relative z-10 p-6 flex-1 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
            <Icon size={24} strokeWidth={1.5} />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-white text-base leading-snug mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {title}
            </h3>
            <div className="text-[11px] font-mono text-gray-400 dark:text-gray-500 mb-2 truncate">
              campusai.com.ng{path}
            </div>
            {!previewImage && (
              <div className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-full">
                {subtitle}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

const ToolsGrid: React.FC = () => {
  const [previews, setPreviews] = useState<LinkPreviewMap>({});

  useEffect(() => {
    setPreviews(getStoredLinkPreviews());
    fetchLinkPreviewsFromCloud().then(cloudPreviews => {
      if (cloudPreviews && Object.keys(cloudPreviews).length > 0) {
        setPreviews(cloudPreviews);
      }
    });
  }, []);

  const tools = [
    { title: "Aggregate Calculator", subtitle: "All Universities", icon: Calculator, path: "/calculator" },
    { title: "Syllabus Finder", subtitle: "JAMB 2026", icon: BookOpen, path: "/syllabus" },
    { title: "University News", subtitle: "Latest Updates", icon: Newspaper, path: "/news" },
    { title: "Check Admissions", subtitle: "Post-UTME Hub", icon: Search, path: "/postutme" },
    { title: "UNILAG Calculator", subtitle: "Lagos", icon: Calculator, path: "/unilag-aggregate-calculator" },
    { title: "UI Calculator", subtitle: "Ibadan", icon: Calculator, path: "/ui-aggregate-calculator" },
    { title: "LASU Calculator", subtitle: "Lagos State", icon: Calculator, path: "/lasu-aggregate-calculator" },
    { title: "OAU Calculator", subtitle: "Ife", icon: Calculator, path: "/oau-aggregate-calculator" },
    { title: "UNIBEN Calculator", subtitle: "Benin", icon: Calculator, path: "/uniben-aggregate-calculator" },
    { title: "FUTA Calculator", subtitle: "Akure", icon: Calculator, path: "/futa-aggregate-calculator" },
    { title: "Admission Checklist", subtitle: "Documents", icon: CheckSquare, path: "/admission-checklist" },
    { title: "CGPA Tracker", subtitle: "Analytics", icon: Award, path: "/cgpa-calculator" },
  ];

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-950/50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
            Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">CampusAI</span> Tools
          </h2>
          <p className="text-gray-600 dark:text-slate-300 max-w-2xl mx-auto text-lg">
            Everything you need for your admission journey, neatly organized in one place.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tools.map((tool, index) => {
            const previewObj = previews[tool.path];
            return (
              <ToolCard 
                key={tool.title}
                {...tool}
                previewImage={previewObj?.imageUrl || undefined}
                delay={index * 0.04}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ToolsGrid;
