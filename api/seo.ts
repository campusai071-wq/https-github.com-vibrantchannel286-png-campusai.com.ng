import * as path from 'path';

export async function injectSEO(html: string, reqPath: string, adminDb: any, dbInstance?: any): Promise<string> {
  const siteDomain = "https://campusai.com.ng";
  const rawPath = reqPath ? reqPath.split('?')[0] : '/';
  const cleanPath = rawPath === '/' ? '' : rawPath.replace(/\/+$/, '');
  const canonical = `${siteDomain}${cleanPath || '/'}`;

  let title = "JAMB Aggregate Calculator 2026 | Check Admission - CampusAI";
  let description = "Calculate target aggregate scores, estimate tuition costs, and check catchment cutoff quotas on the official 2026 Nigerian higher education portal.";
  let imageUrl = `${siteDomain}/og-image.png`;
  let jsonLd: any = null;

  if (cleanPath.startsWith('/news/')) {
    const rawSlug = cleanPath.split('/')[2];
    const slug = rawSlug ? decodeURIComponent(rawSlug).trim() : '';
    if (slug) {
      try {
        let docData: any = null;

        if (adminDb) {
          try {
            const docRef = adminDb.collection('news').doc(slug);
            const docSnap = await docRef.get();
            if (docSnap.exists) {
              docData = docSnap.data();
            } else {
              const snap = await adminDb.collection('news').where('slug', '==', slug).limit(1).get();
              if (!snap.empty) {
                docData = snap.docs[0].data();
              }
            }
          } catch (e) {
            console.warn("[SEO] AdminDb lookup failed:", e);
          }
        }

        if (!docData && dbInstance) {
          try {
            const { doc, getDoc, collection, query, where, limit, getDocs } = await import('firebase/firestore');
            const docRef = doc(dbInstance, 'news', slug);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              docData = docSnap.data();
            } else {
              const q = query(collection(dbInstance, 'news'), where('slug', '==', slug), limit(1));
              const querySnap = await getDocs(q);
              if (!querySnap.empty) {
                docData = querySnap.docs[0].data();
              }
            }
          } catch (e) {
            console.warn("[SEO] DbInstance lookup failed:", e);
          }
        }

        if (docData) {
          title = `${docData.title} | Campusai.com.ng`;
          description = docData.excerpt || description;
          if (docData.image) imageUrl = docData.image;
          const pubDate = docData.date ? new Date(docData.date).toISOString() : new Date().toISOString();
          const authorName = docData.author || "CampusAI Editorial Desk";

          jsonLd = {
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": canonical
            },
            "headline": docData.title,
            "description": description,
            "image": [imageUrl],
            "datePublished": pubDate,
            "dateModified": pubDate,
            "author": [{
              "@type": "Organization",
              "name": authorName,
              "url": siteDomain
            }],
            "publisher": {
              "@type": "Organization",
              "name": "Campusai.com.ng",
              "url": siteDomain,
              "logo": {
                "@type": "ImageObject",
                "url": `${siteDomain}/favicon.ico.png`
              }
            }
          };
        }
      } catch (err) {
        console.error("[SEO] Error fetching news item:", err);
      }
    }
  } else if (cleanPath === '/news') {
    title = "Nigerian Higher Education Admissions News & Updates 2026 | CampusAI";
    description = "Stay informed with real-time JAMB updates, university Post-UTME registration dates, cutoff marks, and admission news across Nigerian institutions.";
    jsonLd = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "CampusAI Admissions News Feed",
      "url": canonical,
      "description": description
    };
  } else if (cleanPath.endsWith('-aggregate-calculator')) {
    const schoolSlug = cleanPath.split('/').pop()?.replace("-aggregate-calculator", "").toUpperCase();
    if (schoolSlug) {
      title = `${schoolSlug} Aggregate Calculator 2026 | Admission Chances - CampusAI`;
      description = `Calculate your 2026 ${schoolSlug} aggregate score and check your admission chances instantly. Use the official formula, cutoff marks, and catchment area rules for ${schoolSlug}.`;
      jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": `${schoolSlug} Aggregate Calculator 2026`,
        "url": canonical,
        "description": description,
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "All",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "NGN"
        }
      };
    }
  } else if (cleanPath === '/admission-checklist') {
    title = "2026 Admission Requirements & CAPS Checklist | CampusAI";
    description = "Complete step-by-step admission checklist for Nigerian universities, polytechnics, and colleges. Verify JAMB CAPS, O'Level results, and Post-UTME steps.";
    jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "2026 Admission Requirements & CAPS Checklist",
      "url": canonical,
      "description": description
    };
  } else if (cleanPath === '/postutme') {
    title = "2026/2027 Post-UTME Registration Hub & Exam Schedules | CampusAI";
    description = "Track Post-UTME registration deadlines, exam dates, cut-off marks, and screening guidelines for UNILAG, UI, UNIBEN, OAU, FUTA, LASU, and more.";
    jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "2026/2027 Post-UTME Registration Hub & Exam Schedules",
      "url": canonical,
      "description": description
    };
  } else {
    jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Campusai.com.ng",
      "url": canonical,
      "description": description,
      "applicationCategory": "EducationApplication",
      "operatingSystem": "All",
      "author": {
        "@type": "Person",
        "name": "Emmanuel Iweh"
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "NGN"
      }
    };
  }

  // Replace existing title
  html = html.replace(/<title[^>]*>.*?<\/title>/gi, `<title data-rh="true">${title}</title>`);
  
  // Replace existing description
  html = html.replace(/<meta[^>]*name="description"[^>]*>/gi, `<meta data-rh="true" name="description" content="${description}">`);
  
  // Replace existing og:title
  html = html.replace(/<meta[^>]*property="og:title"[^>]*>/gi, `<meta data-rh="true" property="og:title" content="${title}">`);
  
  // Replace existing og:description
  html = html.replace(/<meta[^>]*property="og:description"[^>]*>/gi, `<meta data-rh="true" property="og:description" content="${description}">`);
  
  // Replace existing og:image
  html = html.replace(/<meta[^>]*property="og:image"[^>]*>/gi, `<meta data-rh="true" property="og:image" content="${imageUrl}">`);
  
  // Replace existing og:url
  html = html.replace(/<meta[^>]*property="og:url"[^>]*>/gi, `<meta data-rh="true" property="og:url" content="${canonical}">`);

  // Replace or inject canonical tag with data-rh="true"
  const canonicalTag = `<link data-rh="true" rel="canonical" href="${canonical}" />`;
  if (!html.includes('rel="canonical"')) {
    html = html.replace('</head>', `  ${canonicalTag}\n  </head>`);
  } else {
    html = html.replace(/<link[^>]*rel="canonical"[^>]*>/gi, canonicalTag);
  }

  // Inject JSON-LD
  if (jsonLd) {
    const jsonLdString = `<script data-rh="true" type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>`;
    if (html.includes('type="application/ld+json"')) {
      html = html.replace(/<script[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/i, jsonLdString);
    } else {
      html = html.replace('</head>', `  ${jsonLdString}\n  </head>`);
    }
  }

  return html;
}
