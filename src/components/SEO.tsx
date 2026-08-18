import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { stringify } from '../services/utils';
import { getStoredLinkPreviews } from '../services/linkPreviewService';
import { trackPageView } from '../services/analytics';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  article?: boolean;
  keywords?: string;
  originalSource?: string;
  isCalculator?: boolean;
  canonical?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  image,
  article,
  keywords,
  originalSource,
  isCalculator,
  canonical,
  author = "Emmanuel Iweh",
  publishedTime,
  modifiedTime,
  section = "JAMB News"
}) => {
  const siteName = "CampusAI Nigeria";
  const defaultDescription = "Check your 2026 admission chances with Nigeria's #1 AI strategist. Calculate aggregate scores, view official cutoff marks, and stay updated with verified JAMB news.";
  
  const siteDomain = "https://campusai.com.ng";
  const rawPath = typeof window !== 'undefined' ? window.location.pathname : "";
  const cleanPath = rawPath === '/' ? '' : rawPath.split('?')[0].replace(/\/+$/, "");
  
  // SEO standards: Title < 70, Desc between 70 and 160
  const rawDesc = description || defaultDescription;
  const paddedDesc = rawDesc.length < 70 
    ? `${rawDesc} - Calculate aggregate scores, view official cutoff marks, and check admission requirements with CampusAI Nigeria 2026.` 
    : rawDesc;
  const cleanDescription = paddedDesc.length > 160
    ? paddedDesc.substring(0, 157) + '...'
    : paddedDesc;

  let formattedTitle = "JAMB 2026 Aggregate Calculator & Admission Portal | CampusAI";
  if (title) {
    if (title.toLowerCase().includes('campusai')) {
      formattedTitle = title;
    } else {
      formattedTitle = `${title} | CampusAI`;
    }
  }

  const cleanTitle = formattedTitle.length > 70
    ? formattedTitle.substring(0, 67) + '...'
    : formattedTitle;
  const fullUrl = canonical ? `${siteDomain}${canonical}` : `${siteDomain}${cleanPath || '/'}`;

  const newsSlug = (canonical || cleanPath).includes('/news/') ? (canonical || cleanPath).split('/news/')[1] : "";

  const customPreviews = getStoredLinkPreviews();
  const currentCustomPreview = customPreviews[cleanPath || '/']?.imageUrl || customPreviews[cleanPath]?.imageUrl;

  let ogImage = `${siteDomain}/og-image.png`;
  if (currentCustomPreview && (currentCustomPreview.startsWith('http') || currentCustomPreview.startsWith('data:'))) {
    ogImage = currentCustomPreview;
  } else if (image && typeof image === 'string' && (image.trim().startsWith('http://') || image.trim().startsWith('https://'))) {
    ogImage = image.trim();
  } else if (newsSlug) {
    ogImage = `${siteDomain}/api/article-image?slug=${encodeURIComponent(newsSlug.split('?')[0].replace(/\/$/, ''))}`;
  } else if (article) {
    ogImage = `${siteDomain}/api/og-image?title=${encodeURIComponent(title || "CampusAI News")}&category=${encodeURIComponent(section)}`;
  }

  const safeToIso = (val?: any): string => {
    if (!val) return new Date().toISOString();
    try {
      if (val instanceof Date) {
        return isNaN(val.getTime()) ? new Date().toISOString() : val.toISOString();
      }
      if (typeof val === 'object' && val !== null) {
        if (typeof val.toDate === 'function') {
          const d = val.toDate();
          return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
        }
        if (typeof val.seconds === 'number') {
          const d = new Date(val.seconds * 1000);
          return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
        }
      }
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        return d.toISOString();
      }
    } catch (e) {}
    return new Date().toISOString();
  };

  const pubIso = safeToIso(publishedTime);
  const modIso = modifiedTime ? safeToIso(modifiedTime) : pubIso;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": article ? "NewsArticle" : "WebApplication",
    "name": cleanTitle,
    "description": cleanDescription,
    "url": fullUrl,
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "All",
    "publisher": {
      "@type": "Organization",
      "name": "CampusAI Nigeria",
      "url": siteDomain,
      "logo": {
        "@type": "ImageObject",
        "url": `${siteDomain}/favicon.ico.png`
      },
      "sameAs": [
        "https://twitter.com/CampusAI_NG",
        "https://facebook.com/CampusAINigeria",
        "https://linkedin.com/company/campusai-nigeria",
        "https://instagram.com/campusai.ng"
      ]
    },
    ...(article ? {
      "headline": title || cleanTitle,
      "datePublished": pubIso,
      "dateModified": modIso,
      "author": [{ "@type": "Person", "name": author }]
    } : {}),
    ...(isCalculator ? {
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "NGN"
      }
    } : {})
  };

  useEffect(() => {
    trackPageView(fullUrl, cleanTitle);
  }, [fullUrl, cleanTitle]);

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{cleanTitle}</title>
      <meta name="description" content={cleanDescription} />
      <meta name="keywords" content={keywords || "JAMB 2026, aggregate calculator, cutoff marks 2026, Nigerian university admission, admission chances, UNILAG, LASU, UI, OAU"} />
      <meta name="author" content={author} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook / WhatsApp / Telegram / LinkedIn / Discord */}
      <meta property="og:type" content={article ? "article" : "website"} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={cleanTitle} />
      <meta property="og:description" content={cleanDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:secure_url" content={ogImage} />
      <meta property="og:image:type" content={ogImage.endsWith('.jpg') || ogImage.endsWith('.jpeg') ? "image/jpeg" : ogImage.endsWith('.svg') ? "image/svg+xml" : "image/png"} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={cleanTitle} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_NG" />

      {article && <meta property="article:published_time" content={pubIso} />}
      {article && <meta property="article:modified_time" content={modIso} />}
      {article && <meta property="article:author" content={author} />}
      {article && <meta property="article:section" content={section} />}

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@CampusAI_NG" />
      <meta name="twitter:creator" content="@CampusAI_NG" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={cleanTitle} />
      <meta name="twitter:description" content={cleanDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={cleanTitle} />

      {/* Authority Meta Tags */}
      <meta name="google-site-verification" content="n07lx2H6ou5qr0uS9BwlEYwX-27Jt2E27QYnJpD0jHQ" />
      <meta name="robots" content="index, follow, max-image-preview:large" />

      {/* Geotargeting */}
      <meta name="geo.region" content="NG" />
      <meta name="geo.placename" content="Nigeria" />

      {originalSource && <link rel="original-source" href={originalSource} />}

      {/* Structured Data */}
      <script type="application/ld+json">
        {stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default SEO;
