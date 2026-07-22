export const INDEXNOW_KEY = '14fbbbae19ab4b788d8153edd1d2550e';
export const INDEXNOW_HOST = 'campusai.com.ng';
export const INDEXNOW_KEY_LOCATION = `https://${INDEXNOW_HOST}/${INDEXNOW_KEY}.txt`;

/**
 * Submits a list of relative or absolute URLs to IndexNow API for instant indexing on Bing, Yandex, Seznam, Naver, etc.
 */
export async function submitToIndexNow(urls: string[]): Promise<{ success: boolean; status: number; message: string }> {
  if (!urls || urls.length === 0) {
    return { success: false, status: 400, message: 'No URLs provided for IndexNow submission' };
  }

  // Format URLs to ensure they are full absolute URLs
  const formattedUrls = urls.map(url => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `https://${INDEXNOW_HOST}${cleanPath}`;
  });

  const payload = {
    host: INDEXNOW_HOST,
    key: INDEXNOW_KEY,
    keyLocation: INDEXNOW_KEY_LOCATION,
    urlList: formattedUrls
  };

  try {
    const response = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok || response.status === 200 || response.status === 202) {
      return { success: true, status: response.status, message: 'URLs submitted to IndexNow successfully!' };
    } else {
      const errorText = await response.text().catch(() => '');
      return {
        success: false,
        status: response.status,
        message: `IndexNow returned status ${response.status}: ${errorText || response.statusText}`
      };
    }
  } catch (err: any) {
    console.error('IndexNow submission error:', err);
    return {
      success: false,
      status: 0,
      message: `Failed to connect to IndexNow API: ${err?.message || 'Network error'}`
    };
  }
}
