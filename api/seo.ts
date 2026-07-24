import * as path from 'path';

export async function injectSEO(html: string, reqPath: string, adminDb: any): Promise<string> {
  let title = "JAMB Aggregate Calculator 2026 | Check UNILAG, LASU, UI Admission Chances - CampusAI";
  let description = "Calculate target aggregate scores, estimate realistic tuition costs, and compare catchment area cutoff quotas on the official 2026 Nigerian higher education portal.";
  let canonical = `https://campusai.com.ng${reqPath}`;
  let imageUrl = "https://campusai.com.ng/og-image.png";

  if (reqPath.startsWith('/news/') && adminDb) {
    const slug = reqPath.split('/')[2];
    if (slug) {
      try {
        let docData = null;
        const docRef = await adminDb.collection('news').doc(slug).get();
        if (docRef.exists) {
          docData = docRef.data();
        } else {
          const snap = await adminDb.collection('news').where('slug', '==', slug).limit(1).get();
          if (!snap.empty) {
            docData = snap.docs[0].data();
          }
        }
        
        if (docData) {
          title = `${docData.title} | CampusAI News`;
          description = docData.excerpt || description;
          if (docData.image) imageUrl = docData.image;
        }
      } catch (err) {
        console.error("[SEO] Error fetching news item:", err);
      }
    }
  } else if (reqPath.endsWith("-aggregate-calculator")) {
      const schoolSlug = reqPath.split('/').pop()?.replace("-aggregate-calculator", "").toUpperCase();
      if (schoolSlug) {
        title = `${schoolSlug} Aggregate Calculator 2026 | Admission Chances - CampusAI`;
        description = `Calculate your 2026 ${schoolSlug} aggregate score and check your admission chances instantly. Use the official formula, cutoff marks, and catchment area rules for ${schoolSlug}.`;
      }
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

  // Inject canonical tag
  const canonicalTag = `<link rel="canonical" href="${canonical}" />`;
  if (!html.includes('<link rel="canonical"')) {
    html = html.replace('</head>', `  ${canonicalTag}\n  </head>`);
  } else {
    html = html.replace(/<link[^>]*rel="canonical"[^>]*>/gi, canonicalTag);
  }

  return html;
}
