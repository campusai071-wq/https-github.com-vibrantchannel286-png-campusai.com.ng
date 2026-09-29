import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NewsGrid from './NewsGrid';
import NewsDetailView from './NewsDetailView';
import SEO from './SEO';
import { NewsItem } from '../types';
import { slugify } from '../services/utils';

interface NewsRouteResolverProps {
  user: any;
  isAuthorizedAdmin: boolean;
  news: NewsItem[];
  setIsAuthModalOpen: (open: boolean) => void;
  closeArticle: () => void;
  openArticle: (article: NewsItem) => void;
}

const CATEGORY_MAP: Record<string, { name: string; title: string; desc: string }> = {
  jamb: {
    name: 'JAMB',
    title: 'JAMB Directives, CAPS Updates & UTME News (2026/2027)',
    desc: 'Official JAMB announcements, CAPS admission status updates, and UTME policy directives for Nigerian scholars.'
  },
  federal: {
    name: 'Federal',
    title: 'Federal Universities Admission News & Post-UTME Updates',
    desc: 'Screening forms, departmental cutoff marks, and merit lists for all Federal Universities in Nigeria.'
  },
  state: {
    name: 'State',
    title: 'State Universities Admission & Cutoff Updates 2026',
    desc: 'Post-UTME updates, catchment quota criteria, and screening releases for State Universities across Nigeria.'
  },
  private: {
    name: 'Private',
    title: 'Private Universities Admission & Scholarship Notices',
    desc: 'Screening schedules, tuition guides, and admission announcements for top Private Universities in Nigeria.'
  },
  polytechnic: {
    name: 'Polytechnic',
    title: 'Polytechnic ND/HND Admission News & ND Screening',
    desc: 'Official ND/HND Post-UTME forms, cut-off marks, and portal announcements for Nigerian Polytechnics.'
  },
  coe: {
    name: 'COE',
    title: 'Colleges of Education Admission News & NCE Updates',
    desc: 'NCE admission screening forms, cut-off benchmarks, and directives for Colleges of Education.'
  },
  nysc: {
    name: 'NYSC',
    title: 'NYSC Call-Up & Mobilization Updates 2026',
    desc: 'Official NYSC Senate list verification, orientation camp dates, and mobilization news for graduates.'
  },
  scholarships: {
    name: 'Scholarships',
    title: 'Undergraduate Scholarships & Bursary Opportunities',
    desc: 'Verified federal, state, corporate, and international scholarship grants for Nigerian students.'
  },
  jobs: {
    name: 'Jobs',
    title: 'Graduate Trainee & Student Job Opportunities in Nigeria',
    desc: 'Verified graduate trainee positions, internships, and entry-level career openings across Nigeria.'
  },
  national: {
    name: 'National',
    title: 'National Academic Policies, ASUU & Higher Education News',
    desc: 'National higher education policies, NUC directives, and academic calendar updates.'
  },
  waec: {
    name: 'WAEC',
    title: 'WAEC SSCE Results, Verification & Registration Updates',
    desc: 'Official WAEC SSCE release dates, result verification PIN guides, and GCE registration updates.'
  },
  neco: {
    name: 'NECO',
    title: 'NECO SSCE Results & Portal Registration Updates',
    desc: 'Official NECO SSCE result releases, result token guides, and national examination updates.'
  }
};

export const NewsRouteResolver: React.FC<NewsRouteResolverProps> = ({
  user,
  isAuthorizedAdmin,
  news,
  setIsAuthModalOpen,
  closeArticle,
  openArticle
}) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  if (!slug) {
    return (
      <div className="container mx-auto px-4 md:px-8 pt-24 pb-20 min-h-screen">
        <SEO 
          title="2025/2026 JAMB & Admission News Hub | CampusAI" 
          description="Stay updated with official admission guidelines, Post-UTME registration dates, and university screening schedules for the 2026 Nigerian academic cycle."
          canonical="/news"
        />
        <NewsGrid user={user} onReadArticle={openArticle} onLoginRequest={() => navigate('/login')} />
      </div>
    );
  }

  const slugClean = slug.toLowerCase().trim();

  // Check if `:slug` is a known category (e.g. /news/jamb, /news/federal, /news/state, etc.)
  if (CATEGORY_MAP[slugClean]) {
    const categoryInfo = CATEGORY_MAP[slugClean];
    return (
      <div className="container mx-auto px-4 md:px-8 pt-24 pb-20 min-h-screen">
        <SEO 
          title={`${categoryInfo.title} | CampusAI.ng`} 
          description={categoryInfo.desc}
          canonical={`/news/${slugClean}`}
        />

        {/* Category Header Banner */}
        <div className="mb-8 p-6 md:p-8 rounded-[32px] bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white border border-blue-500/20 shadow-xl">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-2">
            <span>News Portal</span>
            <span>•</span>
            <span>Category Hub</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white mb-2">
            {categoryInfo.name} News & Official Bulletins
          </h1>
          <p className="text-xs md:text-sm text-slate-300 font-medium max-w-2xl leading-relaxed">
            {categoryInfo.desc}
          </p>
        </div>

        <NewsGrid 
          user={user} 
          onReadArticle={openArticle} 
          onLoginRequest={() => navigate('/login')} 
          initialFilter={categoryInfo.name as any}
        />
      </div>
    );
  }

  // Otherwise, treat `:slug` as an individual article slug (e.g., /news/unilag-post-utme-2026)
  const currentNews = news.find((n: NewsItem) => n.id === slug || n.slug === slug || n.title?.toLowerCase().split(' ').join('-') === slugClean);

  const filteredRelated = currentNews 
    ? news.filter((n: NewsItem) => n.category === currentNews.category && n.id !== currentNews.id).slice(0, 3)
    : [];

  const handleSelectRelated = (article: NewsItem) => {
    const articleSlug = article.slug || slugify(article.title);
    navigate(`/news/${articleSlug}`);
    window.scrollTo(0, 0);
  };

  return (
    <div className="container mx-auto px-0 md:px-8 max-w-[100vw] overflow-x-hidden pt-24 md:pt-32 pb-20 min-h-screen">
      {currentNews && (
        <SEO 
          title={currentNews.title} 
          description={currentNews.excerpt || (currentNews.fullContent || '').substring(0, 155)} 
          image={currentNews.image}
          article={true}
          canonical={`/news/${slugClean}`}
        />
      )}
      <NewsDetailView 
        news={currentNews}
        user={user} 
        isAdmin={isAuthorizedAdmin}
        onClose={closeArticle} 
        onLoginRequest={() => navigate('/login')}
        relatedNews={filteredRelated} 
        onSelectRelated={handleSelectRelated} 
      />
    </div>
  );
};

export default NewsRouteResolver;
