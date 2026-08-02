import * as path from 'path';

function formatDate(val: any): string {
  if (!val) return new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  if (typeof val === 'string') return val.trim();
  let ms = 0;
  if (typeof val.toMillis === 'function') ms = val.toMillis();
  else if (typeof val.toDate === 'function') ms = val.toDate().getTime();
  else if (typeof val === 'object') {
    if ('seconds' in val) ms = val.seconds * 1000;
    else if ('_seconds' in val) ms = val._seconds * 1000;
  } else if (typeof val === 'number') ms = val;

  if (ms > 0) {
    return new Date(ms).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
  return String(val);
}

function formatIsoDate(val: any): string {
  if (!val) return new Date().toISOString();
  if (typeof val === 'string') {
    const parsed = Date.parse(val);
    if (!isNaN(parsed)) return new Date(parsed).toISOString();
  }
  let ms = 0;
  if (typeof val.toMillis === 'function') ms = val.toMillis();
  else if (typeof val.toDate === 'function') ms = val.toDate().getTime();
  else if (typeof val === 'object') {
    if ('seconds' in val) ms = val.seconds * 1000;
    else if ('_seconds' in val) ms = val._seconds * 1000;
  } else if (typeof val === 'number') ms = val;

  if (ms > 0) return new Date(ms).toISOString();
  return new Date().toISOString();
}

function renderMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';
  
  // Normalize line endings
  let text = markdown.replace(/\r\n/g, '\n');

  // Convert markdown headers
  text = text.replace(/^### (.*$)/gim, '<h3 style="font-size: 1.25rem; font-weight: 800; margin-top: 1.5rem; margin-bottom: 0.75rem; color: #0f172a;">$1</h3>');
  text = text.replace(/^## (.*$)/gim, '<h2 style="font-size: 1.5rem; font-weight: 800; margin-top: 2rem; margin-bottom: 1rem; color: #0f172a;">$1</h2>');
  text = text.replace(/^# (.*$)/gim, '<h1 style="font-size: 1.875rem; font-weight: 900; margin-top: 2rem; margin-bottom: 1rem; color: #0f172a;">$1</h1>');

  // Convert bold and italics
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Convert links
  text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color: #2563eb; text-decoration: underline;" target="_blank" rel="noopener noreferrer">$1</a>');

  // Convert unordered lists
  text = text.replace(/^\s*[\-\*]\s+(.*$)/gim, '<li style="margin-bottom: 0.5rem; line-height: 1.6;">$1</li>');
  text = text.replace(/(<li style="margin-bottom: 0.5rem; line-height: 1.6;">.*<\/li>\n?)+/g, '<ul style="margin-top: 1rem; margin-bottom: 1rem; padding-left: 1.5rem; list-style-type: disc;">$&</ul>');

  // Paragraphs
  const blocks = text.split(/\n\s*\n/);
  const htmlBlocks = blocks.map(block => {
    const trimmed = block.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<li')) {
      return trimmed;
    }
    return `<p style="margin-bottom: 1.25rem; line-height: 1.8; font-size: 1.125rem; color: #334155;">${trimmed.replace(/\n/g, '<br/>')}</p>`;
  });

  return htmlBlocks.filter(Boolean).join('\n');
}

export async function injectSEO(html: string, reqPath: string, adminDb: any, dbInstance?: any): Promise<string> {
  const siteDomain = "https://campusai.com.ng";
  const rawPath = reqPath ? reqPath.split('?')[0] : '/';
  const cleanPath = rawPath === '/' ? '' : rawPath.replace(/\/+$/, '');
  const canonical = `${siteDomain}${cleanPath || '/'}`;

  let title = "JAMB 2026 Aggregate Calculator & Admission Portal | CampusAI";
  let description = "Check your 2026 admission chances with Nigeria's #1 AI strategist. Calculate aggregate scores, view official cutoff marks, and stay updated with verified JAMB news.";
  let imageUrl = `${siteDomain}/og-image.png`;
  let isArticle = false;
  let articleAuthor = "Emmanuel Iweh";
  let articleSection = "JAMB News";
  let publishedTimeIso = new Date().toISOString();
  let modifiedTimeIso = new Date().toISOString();
  let jsonLd: any = null;
  let serverBodyHtml = '';

  if (cleanPath.startsWith('/news/')) {
    isArticle = true;
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
          const articleTitle = docData.title || "Admission News Update";
          const articleExcerpt = docData.excerpt || docData.description || description;
          const articleBody = docData.fullContent || docData.content || docData.body || articleExcerpt;
          articleAuthor = docData.author || "Emmanuel Iweh";
          articleSection = docData.category || "JAMB News";
          const pubDateStr = formatDate(docData.date || docData.createdAt);
          publishedTimeIso = formatIsoDate(docData.date || docData.createdAt);
          modifiedTimeIso = formatIsoDate(docData.updatedAt || docData.date || docData.createdAt);

          title = `${articleTitle} | CampusAI News`;
          description = articleExcerpt.substring(0, 155);

          // Image selection: if valid HTTP image URL exists, use it. Otherwise, use generated OG image!
          if (docData.image && typeof docData.image === 'string' && docData.image.trim().startsWith('http')) {
            imageUrl = docData.image.trim();
          } else {
            imageUrl = `${siteDomain}/api/og-image?title=${encodeURIComponent(articleTitle)}&category=${encodeURIComponent(articleSection)}`;
          }

          const renderedContent = renderMarkdownToHtml(articleBody);

          jsonLd = {
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": canonical
            },
            "headline": articleTitle,
            "description": description,
            "articleBody": articleBody,
            "image": [imageUrl],
            "datePublished": publishedTimeIso,
            "dateModified": modifiedTimeIso,
            "author": [{
              "@type": "Person",
              "name": articleAuthor,
              "url": siteDomain
            }],
            "publisher": {
              "@type": "Organization",
              "name": "CampusAI Nigeria",
              "url": siteDomain,
              "logo": {
                "@type": "ImageObject",
                "url": `${siteDomain}/favicon.ico.png`
              }
            }
          };

          // Generate Server HTML Article for bots, crawlers, and non-JS clients
          serverBodyHtml = `
            <article id="server-news-article" style="max-width: 820px; margin: 0 auto; padding: 32px 20px; font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #0f172a; line-height: 1.6; background-color: #ffffff;">
              <div style="margin-bottom: 24px;">
                <a href="${siteDomain}/news" style="display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #2563eb; text-decoration: none;">
                  ← Return to Admissions News Feed
                </a>
              </div>

              <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-bottom: 16px; font-size: 12px; font-weight: 700; color: #64748b;">
                <span style="background-color: #2563eb; color: #ffffff; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; font-size: 10px; letter-spacing: 0.08em; font-weight: 900;">${articleSection}</span>
                <span>Published: ${pubDateStr}</span>
                <span>•</span>
                <span>By <strong style="color: #0eb38c;">${articleAuthor}</strong></span>
                ${docData.views ? `<span>•</span> <span>${docData.views.toLocaleString()} Reads</span>` : ''}
              </div>

              <h1 style="font-size: 2.25rem; font-weight: 900; line-height: 1.25; color: #1e293b; margin: 0 0 24px 0; letter-spacing: -0.02em;">
                ${articleTitle}
              </h1>

              ${imageUrl ? `
                <div style="margin-bottom: 32px; border-radius: 20px; overflow: hidden; max-height: 480px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08);">
                  <img src="${imageUrl}" alt="${articleTitle}" style="width: 100%; height: auto; object-fit: cover; display: block;" />
                </div>
              ` : ''}

              ${articleExcerpt ? `
                <div style="font-size: 1.2rem; font-weight: 800; color: #1e293b; font-style: italic; border-left: 4px solid #2563eb; padding-left: 20px; margin-bottom: 32px; line-height: 1.6; background-color: #f8fafc; padding-top: 14px; padding-bottom: 14px; border-radius: 0 12px 12px 0;">
                  "${articleExcerpt}"
                </div>
              ` : ''}

              <div class="article-content" style="font-size: 1.125rem; color: #334155; line-height: 1.8;">
                ${renderedContent}
              </div>

              ${docData.sourceUrl ? `
                <div style="margin-top: 28px; font-size: 13px; font-weight: 600; color: #64748b;">
                  Official Source Reference: <a href="${docData.sourceUrl}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline;">${docData.sourceUrl}</a>
                </div>
              ` : ''}

              <div style="margin-top: 48px; padding: 28px; background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%); border: 2px solid #bfdbfe; border-radius: 24px; text-align: center;">
                <h3 style="font-size: 1.35rem; font-weight: 900; color: #1e3a8a; margin: 0 0 8px 0; text-transform: uppercase;">Calculate Your 2026 University Aggregate Score</h3>
                <p style="font-size: 0.95rem; font-weight: 600; color: #475569; margin: 0 0 20px 0; line-height: 1.5;">Check your admission chances across UNILAG, LASU, UI, OAU, FUTA, UNIBEN, and 50+ Nigerian institutions with CampusAI's official formula engine.</p>
                <a href="${siteDomain}/calculator" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: 800; padding: 14px 28px; border-radius: 14px; text-decoration: none; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 4px 14px rgba(37,99,235,0.3);">
                  Calculate Aggregate Score Now →
                </a>
              </div>
            </article>
          `;
        } else {
          // Fallback static article generated from slug if docData is not retrieved
          const formattedTitle = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          title = `${formattedTitle} | CampusAI News`;
          description = `Latest updates on ${formattedTitle}. Check official registration details, cutoff marks, and admission requirements on CampusAI Nigeria.`;
          imageUrl = `${siteDomain}/api/og-image?title=${encodeURIComponent(formattedTitle)}&category=${encodeURIComponent('JAMB News')}`;

          serverBodyHtml = `
            <article id="server-news-article" style="max-width: 820px; margin: 0 auto; padding: 32px 20px; font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #0f172a; line-height: 1.6; background-color: #ffffff;">
              <div style="margin-bottom: 24px;">
                <a href="${siteDomain}/news" style="display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #2563eb; text-decoration: none;">
                  ← Return to Admissions News Feed
                </a>
              </div>

              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px; font-size: 12px; font-weight: 700; color: #64748b;">
                <span style="background-color: #2563eb; color: #ffffff; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; font-size: 10px; letter-spacing: 0.08em; font-weight: 900;">JAMB News</span>
                <span>Published: ${formatDate(null)}</span>
                <span>•</span>
                <span>By <strong style="color: #0eb38c;">Emmanuel Iweh</strong></span>
              </div>

              <h1 style="font-size: 2.25rem; font-weight: 900; line-height: 1.25; color: #1e293b; margin: 0 0 24px 0;">
                ${formattedTitle}
              </h1>

              <p style="font-size: 1.125rem; color: #334155; line-height: 1.8; margin-bottom: 20px;">
                Get verified updates regarding <strong>${formattedTitle}</strong> for the 2026/2027 academic session. CampusAI monitors official institutional portals, JAMB CAPS, and departmental cut-off announcements.
              </p>

              <div style="margin-top: 48px; padding: 28px; background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%); border: 2px solid #bfdbfe; border-radius: 24px; text-align: center;">
                <h3 style="font-size: 1.35rem; font-weight: 900; color: #1e3a8a; margin: 0 0 8px 0; text-transform: uppercase;">Calculate Your 2026 University Aggregate Score</h3>
                <p style="font-size: 0.95rem; font-weight: 600; color: #475569; margin: 0 0 20px 0; line-height: 1.5;">Check your admission chances across UNILAG, LASU, UI, OAU, FUTA, UNIBEN, and 50+ Nigerian institutions with CampusAI's official formula engine.</p>
                <a href="${siteDomain}/calculator" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: 800; padding: 14px 28px; border-radius: 14px; text-decoration: none; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 4px 14px rgba(37,99,235,0.3);">
                  Calculate Aggregate Score Now →
                </a>
              </div>
            </article>
          `;
        }
      } catch (err) {
        console.error("[SEO] Error fetching news item:", err);
      }
    }
  } else if (cleanPath === '/postutme' || cleanPath === '/post-utme' || cleanPath === '/result-slip' || cleanPath === '/result') {
    title = "2026/2027 Post-UTME Screening Hub & Release Dates | CampusAI";
    description = "Official tracking for 2026 Post-UTME registration dates, screening schedules, and merit cut-off marks for Nigerian federal and state universities.";
    jsonLd = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Post-UTME Release Hub 2026",
      "url": canonical,
      "description": description
    };
  } else if (cleanPath === '/status') {
    title = "System Status & Service Uptime | CampusAI Nigeria";
    description = "Real-time status and uptime for CampusAI Nigeria admission strategist nodes, database sync, and calculator services.";
    jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "CampusAI System Status",
      "url": canonical,
      "description": description
    };
  } else if (cleanPath === '/dashboard') {
    title = "Student Admission Dashboard & Tracker 2026 | CampusAI";
    description = "Monitor your JAMB scores, university merit chances, and academic progress in real-time with personalized AI insights on CampusAI.";
    jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Student Admission Dashboard 2026",
      "url": canonical,
      "description": description
    };
  } else if (cleanPath === '/terms' || cleanPath === '/terms-of-service') {
    title = "Terms of Service | CampusAI Nigeria";
    description = "Read CampusAI Nigeria terms of service, platform usage rules, AI consultation disclaimer, and account guidelines.";
  } else if (cleanPath === '/privacy' || cleanPath === '/privacy-policy' || cleanPath === '/calculator-privacy' || cleanPath === '/calculation-privacy') {
    title = "Privacy Policy | CampusAI Nigeria";
    description = "CampusAI data protection standards, user privacy guidelines, cookie policies, and secure profile data handling practices.";
  } else if (cleanPath === '/cookies' || cleanPath === '/cookie-policy') {
    title = "Cookie Policy | CampusAI Nigeria";
    description = "CampusAI cookie policy and tracking preference details.";
  } else if (cleanPath === '/news') {
    title = "2026/2027 JAMB & Admission News Hub | CampusAI";
    description = "Stay informed with real-time JAMB updates, university Post-UTME registration dates, cutoff marks, and admission news across Nigerian institutions.";
    jsonLd = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "CampusAI Admissions News Feed",
      "url": canonical,
      "description": description
    };

    try {
      let newsItems: any[] = [];
      if (adminDb) {
        const snap = await adminDb.collection('news').orderBy('createdAt', 'desc').limit(10).get();
        snap.forEach((doc: any) => newsItems.push(doc.data()));
      }
      if (newsItems.length > 0) {
        const listHtml = newsItems.map(item => `
          <div style="margin-bottom: 24px; padding: 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px;">
            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; background-color: #2563eb; color: #ffffff; padding: 3px 8px; border-radius: 9999px;">${item.category || 'News'}</span>
            <h2 style="font-size: 1.25rem; font-weight: 800; margin: 12px 0 8px 0;">
              <a href="${siteDomain}/news/${item.slug || item.id}" style="color: #0f172a; text-decoration: none;">${item.title}</a>
            </h2>
            <p style="font-size: 0.95rem; color: #475569; margin-bottom: 12px; line-height: 1.5;">${item.excerpt || ''}</p>
            <a href="${siteDomain}/news/${item.slug || item.id}" style="font-size: 12px; font-weight: 800; color: #2563eb; text-decoration: none;">Read Full Article →</a>
          </div>
        `).join('');

        serverBodyHtml = `
          <section style="max-width: 820px; margin: 0 auto; padding: 32px 20px; font-family: 'Inter', system-ui, sans-serif;">
            <h1 style="font-size: 2rem; font-weight: 900; color: #0f172a; margin-bottom: 8px;">2026 Admissions News & Updates</h1>
            <p style="font-size: 1rem; color: #64748b; margin-bottom: 32px;">Verified news, cut-off marks, and Post-UTME screening forms for Nigerian Universities, Polytechnics, and Colleges.</p>
            ${listHtml}
          </section>
        `;
      }
    } catch (e) {
      console.warn("[SEO] Failed to pre-render news list:", e);
    }
  } else if (cleanPath === '/calculator') {
    title = "Official 2026 JAMB & University Aggregate Calculator | CampusAI";
    description = "Calculate your 2026 university aggregate score automatically. Supports UNILAG, LASU, UI, OAU, UNIBEN, and 50+ other Nigerian institutions.";
    jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "JAMB & University Aggregate Calculator 2026",
      "url": canonical,
      "description": description,
      "applicationCategory": "EducationalApplication",
      "operatingSystem": "All"
    };

    serverBodyHtml = `
      <section style="max-width: 820px; margin: 0 auto; padding: 32px 20px; font-family: 'Inter', system-ui, sans-serif; text-align: center;">
        <h1 style="font-size: 2.25rem; font-weight: 900; color: #0f172a; margin-bottom: 12px;">2026 JAMB & University Aggregate Calculator</h1>
        <p style="font-size: 1.1rem; color: #475569; max-width: 600px; margin: 0 auto 32px auto; line-height: 1.6;">Calculate your admission chances for UNILAG, LASU, UI, OAU, FUTA, UNIBEN, and 50+ Nigerian higher institutions instantly.</p>
        <div style="padding: 24px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 20px; text-align: left;">
          <h3 style="font-size: 1.2rem; font-weight: 800; color: #0f172a; margin-bottom: 12px;">Supported Institutional Formulas:</h3>
          <ul style="line-height: 1.8; color: #334155; font-size: 1rem; padding-left: 20px;">
            <li><strong>50/50 JAMB-to-Post-UTME Ratio</strong> (UNILAG, LASU, FUTA, UNIBEN, etc.)</li>
            <li><strong>O'Level Point Grading System</strong> (A1 = 10pts, B2 = 9pts, B3 = 8pts, etc.)</li>
            <li><strong>Custom Percentage Ratio Mode</strong> for specialized state & private universities</li>
            <li><strong>Catchment Area & ELDS Quota Assessment</strong></li>
          </ul>
        </div>
      </section>
    `;
  } else if (cleanPath.endsWith('-aggregate-calculator')) {
    const schoolSlug = cleanPath.split('/').pop()?.replace("-aggregate-calculator", "").toUpperCase();
    if (schoolSlug) {
      title = `${schoolSlug} 2026 Aggregate Calculator | CampusAI`;
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

      serverBodyHtml = `
        <section style="max-width: 820px; margin: 0 auto; padding: 32px 20px; font-family: 'Inter', system-ui, sans-serif; text-align: center;">
          <h1 style="font-size: 2.25rem; font-weight: 900; color: #0f172a; margin-bottom: 12px;">${schoolSlug} Aggregate Calculator 2026</h1>
          <p style="font-size: 1.1rem; color: #475569; max-width: 600px; margin: 0 auto 32px auto; line-height: 1.6;">Calculate your official 2026 ${schoolSlug} aggregate score using JAMB UTME, Post-UTME screening, and O'Level subject points.</p>
        </section>
      `;
    }
  } else {
    jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "CampusAI Nigeria",
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

  // Formatting constraints
  let cleanTitle = title;
  if (cleanTitle.length > 70) {
    const truncated = cleanTitle.substring(0, 67);
    const lastSpace = truncated.lastIndexOf(' ');
    cleanTitle = (lastSpace > 25 ? truncated.substring(0, lastSpace) : truncated) + '...';
  }

  let cleanDescription = description;
  if (cleanDescription.length > 160) {
    const truncatedDesc = cleanDescription.substring(0, 157);
    const lastSpace = truncatedDesc.lastIndexOf(' ');
    cleanDescription = (lastSpace > 50 ? truncatedDesc.substring(0, lastSpace) : truncatedDesc) + '...';
  }

  // Build complete dynamic Open Graph & Twitter meta tags block
  const imageType = (imageUrl.endsWith('.jpg') || imageUrl.endsWith('.jpeg')) ? 'image/jpeg' : imageUrl.endsWith('.svg') ? 'image/svg+xml' : 'image/png';

  const metaTags = `
    <!-- Primary Page Metadata -->
    <title data-rh="true">${cleanTitle}</title>
    <meta data-rh="true" name="description" content="${cleanDescription}">
    <meta data-rh="true" name="keywords" content="JAMB 2026, aggregate calculator, cutoff marks 2026, Nigerian university admission, Post-UTME updates, UNILAG, LASU, UI, OAU, FUTA, UNIBEN">
    <meta data-rh="true" name="author" content="${articleAuthor}">
    <link data-rh="true" rel="canonical" href="${canonical}">

    <!-- Open Graph / Facebook / WhatsApp / Telegram / LinkedIn / Discord -->
    <meta data-rh="true" property="og:type" content="${isArticle ? 'article' : 'website'}">
    <meta data-rh="true" property="og:site_name" content="CampusAI Nigeria">
    <meta data-rh="true" property="og:title" content="${cleanTitle}">
    <meta data-rh="true" property="og:description" content="${cleanDescription}">
    <meta data-rh="true" property="og:image" content="${imageUrl}">
    <meta data-rh="true" property="og:image:secure_url" content="${imageUrl}">
    <meta data-rh="true" property="og:image:type" content="${imageType}">
    <meta data-rh="true" property="og:image:width" content="1200">
    <meta data-rh="true" property="og:image:height" content="630">
    <meta data-rh="true" property="og:image:alt" content="${cleanTitle}">
    <meta data-rh="true" property="og:url" content="${canonical}">
    <meta data-rh="true" property="og:locale" content="en_NG">
    ${isArticle ? `
    <meta data-rh="true" property="article:published_time" content="${publishedTimeIso}">
    <meta data-rh="true" property="article:modified_time" content="${modifiedTimeIso}">
    <meta data-rh="true" property="article:author" content="${articleAuthor}">
    <meta data-rh="true" property="article:section" content="${articleSection}">
    ` : ''}

    <!-- Twitter Card Tags -->
    <meta data-rh="true" name="twitter:card" content="summary_large_image">
    <meta data-rh="true" name="twitter:site" content="@CampusAI_NG">
    <meta data-rh="true" name="twitter:creator" content="@CampusAI_NG">
    <meta data-rh="true" name="twitter:title" content="${cleanTitle}">
    <meta data-rh="true" name="twitter:description" content="${cleanDescription}">
    <meta data-rh="true" name="twitter:image" content="${imageUrl}">
    <meta data-rh="true" name="twitter:image:alt" content="${cleanTitle}">
  `;

  // Strip existing conflicting title, meta description, og:*, twitter:*, article:* and canonical tags
  html = html.replace(/<title[^>]*>.*?<\/title>/gi, '');
  html = html.replace(/<meta[^>]*name="description"[^>]*>/gi, '');
  html = html.replace(/<meta[^>]*property="og:[^"]*"[^>]*>/gi, '');
  html = html.replace(/<meta[^>]*name="twitter:[^"]*"[^>]*>/gi, '');
  html = html.replace(/<meta[^>]*property="twitter:[^"]*"[^>]*>/gi, '');
  html = html.replace(/<meta[^>]*property="article:[^"]*"[^>]*>/gi, '');
  html = html.replace(/<link[^>]*rel="canonical"[^>]*>/gi, '');

  // Inject metaTags block before </head>
  html = html.replace('</head>', `${metaTags}\n</head>`);

  // Inject JSON-LD
  if (jsonLd) {
    const jsonLdString = `<script data-rh="true" type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>`;
    if (html.includes('type="application/ld+json"')) {
      html = html.replace(/<script[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/i, jsonLdString);
    } else {
      html = html.replace('</head>', `  ${jsonLdString}\n  </head>`);
    }
  }

  // Inject Server Rendered Body into <div id="root"> and <noscript> for crawlers, AI bots, and non-JS clients
  if (serverBodyHtml) {
    if (html.includes('<div id="root">')) {
      html = html.replace(/<div id="root">[\s\S]*<\/div>(?=\s*<script)/i, `<div id="root">\n${serverBodyHtml}\n</div>`);
    }
    if (html.includes('<noscript>')) {
      html = html.replace(/<noscript>[\s\S]*?<\/noscript>/i, `<noscript>\n${serverBodyHtml}\n</noscript>`);
    }
  }

  return html;
}
