import { Request, Response } from 'express';
import { handleOgImageRequest } from './ogImage.js';

export async function handleArticleImageRequest(req: Request, res: Response, dbInstance?: any) {
  try {
    const slug = typeof req.query.slug === 'string' ? req.query.slug.trim() : '';
    const id = typeof req.query.id === 'string' ? req.query.id.trim() : slug;
    const targetSlug = slug || id;

    if (!targetSlug) {
      return handleOgImageRequest(req, res);
    }

    let docData: any = null;

    if (dbInstance) {
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
          }
        }
      } catch (e) {
        console.warn("[Article Image Handler] Firestore read error:", e);
      }
    }

    if (!docData) {
      try {
        const { MOCK_NEWS } = await import('../src/constants.js');
        docData = MOCK_NEWS.find((n: any) => n.id === targetSlug || n.slug === targetSlug);
      } catch (e) {}
    }

    if (docData) {
      const rawImg = docData.image || (Array.isArray(docData.images) && docData.images.length > 0 ? docData.images[0] : null) || docData.imageUrl || docData.coverImage || docData.featuredImage;

      if (typeof rawImg === 'string' && rawImg.trim()) {
        const imgStr = rawImg.trim();

        // If Base64 Data URI
        if (imgStr.startsWith('data:image/')) {
          const matches = imgStr.match(/^data:(image\/[a-zA-Z0-9\+\-\.]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            const mimeType = matches[1];
            const base64Data = matches[2];
            const imgBuffer = Buffer.from(base64Data, 'base64');
            res.setHeader('Content-Type', mimeType);
            res.setHeader('Content-Length', String(imgBuffer.length));
            res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
            return res.status(200).send(imgBuffer);
          }
        } else if (imgStr.startsWith('http://') || imgStr.startsWith('https://')) {
          return res.redirect(302, imgStr);
        }
      }
    }

    return handleOgImageRequest(req, res);
  } catch (err) {
    console.error("[Article Image Request Error]:", err);
    return handleOgImageRequest(req, res);
  }
}
