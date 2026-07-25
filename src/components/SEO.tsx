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
}

const SEO: React.FC<SEOProps> = ({ title, description, image, article, keywords, originalSource, isCalculator }) => {
  const siteName = "Campusai.com.ng";
  const defaultDescription = "Check your 2026 admission chances with Nigeria's #1 AI strategist. Calculate aggregate scores, view official cutoff marks, and stay updated with verified JAMB news for UNILAG, UI, OAU, ABU, and more.";
  
  const siteDomain = "https://campusai.com.ng";
  const rawPath = typeof window !== 'undefined' ? window.location.pathname : "";
  const cleanPath = rawPath === '/' ? '' : rawPath.split('?')[0].replace(/\/+$/, "");
  
  const isSpecificCalculator = cleanPath.endsWith("-aggregate-calculator");
  const schoolSlug = isSpecificCalculator ? cleanPath.split('/').pop()?.replace("-aggregate-calculator", "").toUpperCase() : "";

  // Dynamic Base Titles based on Routes to avoid duplicate titles in Webmaster Tools
  let baseTitle = "Nigeria's #1 AI Admission Strategist | Check 2026 JAMB Chances - CampusAI";
  let customDescription = defaultDescription;
  let customKeywords = "JAMB 2026, cutoff marks 2026, aggregate calculator, Post-UTME tracker, Nigerian university admission, admission probability, UNILAG cutoff, UI merit list, OAU admission requirements, JAMB news today, catchment area admission, ELDS admission Nigeria";

  if (cleanPath === "/dashboard") {
    baseTitle = "Student Admission Dashboard | 2026 JAMB Success Tracker - CampusAI";
    customDescription = "Access your personalized admission tracking dashboard. Monitor Post-UTME results, calculate aggregate scores, and get AI-powered admission recommendations for Nigerian universities.";
  } else if (cleanPath === "/calculator") {
    baseTitle = "JAMB Aggregate Calculator 2026 | Check University Admission Chances - CampusAI";
    customDescription = "Check your 2026 admission chances with our advanced aggregate calculator. Support for UNILAG, LASU, UI, OAU, and all major Nigerian universities using official cutoff marks.";
  } else if (cleanPath === "/result-slip") {
    baseTitle = "Post-UTME Result Slip Hub | 2026 Admission Verification - CampusAI";
    customDescription = "Download, verify and track your 2026 Post-UTME result slips. Check your departmental cutoff scores and see your ranking across various institution portals.";
  } else if (cleanPath === "/news" || cleanPath === "/jamb") {
    baseTitle = "Latest JAMB News Today | 2026/2027 University Admission Updates - CampusAI";
    customDescription = "Stay updated with verified daily news on JAMB 2026, Post-UTME forms, cutoff marks, and university admission lists for all Nigerian institutions.";
  } else if (cleanPath === "/admission-checklist") {
    baseTitle = "2026 Admission Documents Checklist | Clearance & Registration Guide - CampusAI";
    customDescription = "Prepare for university physical clearance with our comprehensive document checklist. JAMB admission letter, O'level results, medical fitness certificates and more.";
  } else if (cleanPath === "/about") {
    baseTitle = "About CampusAI Nigeria | Leading AI Admission Strategist - CampusAI";
  } else if (isSpecificCalculator && schoolSlug) {
    baseTitle = `${schoolSlug} Aggregate Calculator 2026 | Admission Chances - CampusAI`;
    customDescription = `Calculate your 2026 ${schoolSlug} aggregate score and check your admission chances instantly. Use the official formula, cutoff marks, and catchment area rules for ${schoolSlug}.`;
    customKeywords = `${schoolSlug} aggregate calculator, check ${schoolSlug} admission chances, 2026 ${schoolSlug} cutoff marks, calculate ${schoolSlug} post utme score, ${schoolSlug} catchment area, ${customKeywords}`;
  }

  const metaDescription = (description || customDescription).length > 155 
    ? (description || customDescription).substring(0, 152) + "..." 
    : (description || customDescription);
  const metaKeywords = keywords || customKeywords;
  const metaImage = image || `${siteDomain}/og-image.png`;
  
  const fullTitle = title ? `${title} | ${siteName}` : baseTitle;
  const canonicalUrl = `${siteDomain}${cleanPath || '/'}`;
  const currentUrl = canonicalUrl;

  // Render structured data depending on content type
  const getStructuredData = () => {
    if (article) {
      return {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": canonicalUrl
        },
        "headline": title || siteName,
        "description": metaDescription,
        "image": [metaImage],
        "datePublished": new Date().toISOString(),
        "dateModified": new Date().toISOString(),
        "author": [{
          "@type": "Organization",
          "name": "CampusAI Nigeria Editorial Desk",
          "url": siteDomain
        }],
        "publisher": {
          "@type": "Organization",
          "name": siteName,
          "url": siteDomain,
          "logo": {
            "@type": "ImageObject",
            "url": `${siteDomain}/favicon.ico.png`
          }
        }
      };
    }
    
    if (isCalculator || isSpecificCalculator) {
      return {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": fullTitle,
        "url": canonicalUrl,
        "description": metaDescription,
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "All",
        "browserRequirements": "Requires JavaScript. Requires HTML5.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "NGN"
        },
        "author": {
          "@type": "Organization",
          "name": siteName,
          "url": siteDomain
        }
      };
    }

    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": siteName,
      "url": siteDomain,
      "description": defaultDescription,
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${siteDomain}/?search={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    };
  };

  const structuredData = getStructuredData();

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      
      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content={siteName} />

      {/* SEO Moat: Authority Meta Tags */}
      <meta name="google-site-verification" content="n07lx2H6ou5qr0uS9BwlEYwX-27Jt2E27QYnJpD0jHQ" />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

      {/* Geotargeting for Nigerian regional authority & brand isolation */}
      <meta name="geo.region" content="NG-ON" />
      <meta name="geo.placename" content="Akure, Nigeria" />
      <meta name="geo.position" content="7.2504;5.2103" />
      <meta name="ICBM" content="7.2504, 5.2103" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      {/* Canonical & Original Source URLs */}
      <link rel="canonical" href={canonicalUrl} />
      {originalSource && originalSource.trim() && (
        <link rel="original-source" href={originalSource.trim()} />
      )}

      {/* Structured Data */}
      <script type="application/ld+json">
        {stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default SEO;
