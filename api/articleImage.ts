import { Request, Response } from 'express';
import axios from 'axios';
import { handleOgImageRequest, generateOgImageSvg } from './ogImage.js';
import { Resvg } from '@resvg/resvg-js';
import { MOCK_NEWS } from '../src/constants.js';

// Memory cache for proxied or generated article images (max 100 items)
const imageCache = new Map<string, { buffer: Buffer; contentType: string; timestamp: number }>();
const IMAGE_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export function clearArticleImageCache(slug?: string) {
  if (slug) {
    imageCache.delete(slug.toLowerCase());
  } else {
    imageCache.clear();
  }
}

export async function handleArticleImageRequest(req: Request, res: Response, adminDb?: any, dbInstance?: any) {
  try {
    const rawSlug = typeof req.query.slug === 'string' ? req.query.slug.trim() : '';
    const rawId = typeof req.query.id === 'string' ? req.query.id.trim() : '';
    const targetSlug = decodeURIComponent(rawSlug || rawId || '').trim();

    if (!targetSlug) {
      return handleOgImageRequest(req, res);
    }

    const cacheKey = targetSlug.toLowerCase();
    const cached = imageCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < IMAGE_CACHE_TTL)) {
      res.setHeader('Content-Type', cached.contentType);
      res.setHeader('Content-Length', String(cached.buffer.length));
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(200).send(cached.buffer);
    }

    let docData: any = null;

    // 1. Check Admin SDK (Primary for server environment)
    if (adminDb) {
      try {
        const docRef = adminDb.collection('news').doc(targetSlug);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
          docData = docSnap.data();
        } else {
          const qSnap = await adminDb.collection('news').where('slug', '==', targetSlug).limit(1).get();
          if (!qSnap.empty) {
            docData = qSnap.docs[0].data();
          } else {
            const idSnap = await adminDb.collection('news').where('id', '==', targetSlug).limit(1).get();
            if (!idSnap.empty) {
              docData = idSnap.docs[0].data();
            }
          }
        }
      } catch (adminErr) {
        console.warn("[Article Image Handler] AdminDb lookup failed:", adminErr);
      }
    }

    // 2. Check Client SDK (Secondary Fallback)
    if (!docData && dbInstance) {
      try {
        const { doc, getDoc, collection, query, where, limit, getDocs } = await import('firebase/firestore');
        const docRef = doc(dbInstance, 'news', targetSlug);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          docData = docSnap.data();
        } else {
          const q = query(collection(dbInstance, 'news'), where('slug', '==', targetSlug), limit(1));
          const querySnap = await getDocs(q);
          if (!querySnap.empty) {
            docData = querySnap.docs[0].data();
          } else {
            const qId = query(collection(dbInstance, 'news'), where('id', '==', targetSlug), limit(1));
            const idSnap = await getDocs(qId);
            if (!idSnap.empty) {
              docData = idSnap.docs[0].data();
            }
          }
        }
      } catch (clientErr) {
        console.warn("[Article Image Handler] ClientDb lookup failed:", clientErr);
      }
    }

    // 3. Check MOCK_NEWS Array
    if (!docData && Array.isArray(MOCK_NEWS)) {
      docData = MOCK_NEWS.find((n: any) => n.id === targetSlug || n.slug === targetSlug);
    }

    const title = docData?.title || targetSlug.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
    const category = docData?.category || 'JAMB News';
    const date = docData?.date || '2026/2027 Admission Season';

    if (docData) {
      const rawImg = docData.image || docData.featuredImage || (Array.isArray(docData.images) && docData.images.length > 0 ? docData.images[0] : null) || docData.imageUrl || docData.coverImage;

      if (typeof rawImg === 'string' && rawImg.trim()) {
        const imgStr = rawImg.trim();

        // If Base64 Data URI (Uploaded directly in app)
        if (imgStr.startsWith('data:image/')) {
          const matches = imgStr.match(/^data:(image\/[a-zA-Z0-9\+\-\.]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            const mimeType = matches[1];
            const base64Data = matches[2];
            const imgBuffer = Buffer.from(base64Data, 'base64');
            
            // Cache valid buffer
            imageCache.set(cacheKey, { buffer: imgBuffer, contentType: mimeType, timestamp: Date.now() });

            res.setHeader('Content-Type', mimeType);
            res.setHeader('Content-Length', String(imgBuffer.length));
            res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
            res.setHeader('Access-Control-Allow-Origin', '*');
            return res.status(200).send(imgBuffer);
          }
        } else if (imgStr.startsWith('http://') || imgStr.startsWith('https://')) {
          // Fetch external image directly and stream it so WhatsApp/Facebook scrapers do not fail on 302 redirects
          try {
            const fetchRes = await axios.get(imgStr, {
              responseType: 'arraybuffer',
              timeout: 3000,
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
              }
            });

            if (fetchRes.status === 200 && fetchRes.data) {
              const contentType = String(fetchRes.headers['content-type'] || 'image/jpeg');
              const imgBuffer = Buffer.from(fetchRes.data);

              imageCache.set(cacheKey, { buffer: imgBuffer, contentType, timestamp: Date.now() });

              res.setHeader('Content-Type', contentType);
              res.setHeader('Content-Length', String(imgBuffer.length));
              res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
              res.setHeader('Access-Control-Allow-Origin', '*');
              return res.status(200).send(imgBuffer);
            }
          } catch (fetchErr) {
            console.warn("[Article Image Handler] Remote image fetch failed, generating high-res branded card for scraper:", imgStr);
            // Fall through to step 4 to generate dynamic 1200x630 branded card
          }
        }
      }
    }

    // 4. Generate dynamic branded OpenGraph PNG card for this article
    try {
      const svgContent = generateOgImageSvg(title, category, date);
      const resvg = new Resvg(svgContent, {
        fitTo: { mode: 'width', value: 1200 },
      });
      const pngData = resvg.render();
      const pngBuffer = pngData.asPng();

      imageCache.set(cacheKey, { buffer: pngBuffer, contentType: 'image/png', timestamp: Date.now() });

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Length', String(pngBuffer.length));
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(200).send(pngBuffer);
    } catch (renderErr) {
      console.error("[Article Image Handler] Dynamic OG image render error:", renderErr);
      return handleOgImageRequest(req, res);
    }
  } catch (err) {
    console.error("[Article Image Request Error]:", err);
    return handleOgImageRequest(req, res);
  }
}
