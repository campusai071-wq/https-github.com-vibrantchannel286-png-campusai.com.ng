import React from 'react';
import { Helmet } from 'react-helmet-async';
import { stringify } from '../services/utils';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  article?: boolean;
  keywords?: string;
  originalSource?: string;
  isCalculator?: boolean;
  canonical?: string;
}

const SEO: React.FC<SEOProps> = ({ title, description, image, article, keywords, originalSource, isCalculator, canonical }) => {
  const siteName = "CampusAI Nigeria";
  const defaultDescription = "Check your 2026 admission chances with Nigeria's #1 AI strategist. Calculate aggregate scores, view official cutoff marks, and stay updated with verified JAMB news.";
  
  const siteDomain = "https://campusai.com.ng";
  const rawPath = typeof window !== 'undefined' ? window.location.pathname : "";
  const cleanPath = rawPath === '/' ? '' : rawPath.split('?')[0].replace(/\/+$/, "");
  
  // SEO standards: Title < 65, Desc < 160
  const cleanDescription = (description || defaultDescription).substring(0, 160);
  const cleanTitle = (title ? `${title} | ${siteName}` : "JAMB Aggregate Calculator 2026 | Check Admission Chances - CampusAI").substring(0, 65);
  const fullUrl = canonical ? `${siteDomain}${canonical}` : `${siteDomain}${cleanPath || '/'}`;
  const defaultImage = `${siteDomain}/og-image.png`;
  const ogImage = image || defaultImage;

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
      "logo": {
        "@type": "ImageObject",
        "url": defaultImage
      }
    }
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{cleanTitle}</title>
      <meta name="description" content={cleanDescription} />
      <meta name="keywords" content={keywords || "JAMB 2026, aggregate calculator, cutoff marks 2026, Nigerian university admission, admission chances, UNILAG, LASU, UI, OAU"} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={article ? "article" : "website"} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={cleanTitle} />
      <meta property="og:description" content={cleanDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={cleanTitle} />
      <meta property="twitter:description" content={cleanDescription} />
      <meta property="twitter:image" content={ogImage} />

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
