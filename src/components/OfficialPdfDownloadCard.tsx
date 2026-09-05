import React, { useState } from 'react';
import { Download, FileText, CheckCircle2, Loader2, Eye, ExternalLink } from 'lucide-react';

interface OfficialPdfDownloadCardProps {
  url: string;
  title?: string;
  noteText?: string;
  category?: string;
}

export const OfficialPdfDownloadCard: React.FC<OfficialPdfDownloadCardProps> = ({
  url,
  title,
  noteText,
  category = "Official Document"
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract a clean title if none or generic is provided
  const rawTitle = title || (url.split('/').pop()?.replace(/\.pdf.*$/i, '').replace(/[-_]/g, ' ') || 'Document (PDF)');
  const displayTitle = rawTitle.replace(/^(download\s*)+/i, 'Download ').trim();
  
  // Format title for the top heading: "DOWNLOAD THE OFFICIAL [NAME] (PDF)"
  const cleanNameForHeading = displayTitle
    .replace(/^Download\s+/i, '')
    .replace(/\s*\(PDF\)\s*$/i, '')
    .trim();
  const headingText = `DOWNLOAD THE OFFICIAL ${cleanNameForHeading.toUpperCase()} (PDF)`;
  
  // Ensure link text ends with (PDF)
  const linkText = displayTitle.toLowerCase().endsWith('(pdf)')
    ? displayTitle
    : `${displayTitle} (PDF)`;

  const defaultNote = noteText || "This PDF contains the full timetable with all subjects, paper codes, and examination dates. Candidates are advised to download and print it for easy reference.";

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (downloading) return;
    setDownloading(true);
    setError(null);

    const safeFilename = `${displayTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;

    try {
      // Determine the best target URL:
      // If it's an external URL (http/https), route through our proxy to bypass CORS / hotlink blocking
      let targetUrl = url;
      if (url.startsWith('http://') || url.startsWith('https://')) {
        targetUrl = `/api/pdf/proxy-download?url=${encodeURIComponent(url)}&title=${encodeURIComponent(displayTitle)}`;
      } else if (!url.includes('/api/')) {
        targetUrl = `/api/pdf-store/file/${encodeURIComponent(url)}?download=1&title=${encodeURIComponent(displayTitle)}`;
      }

      const res = await fetch(targetUrl);
      if (!res.ok) {
        // Fallback to synthetic vault download directly so user ALWAYS gets a real PDF
        const fallbackUrl = `/api/pdf-store/file/${encodeURIComponent(cleanNameForHeading.toLowerCase().replace(/\s+/g, '-'))}?download=1&title=${encodeURIComponent(displayTitle)}`;
        const fallbackRes = await fetch(fallbackUrl);
        if (!fallbackRes.ok) throw new Error("Could not fetch document");
        
        const blob = await fallbackRes.blob();
        triggerBlobDownload(blob, safeFilename);
      } else {
        const blob = await res.blob();
        triggerBlobDownload(blob, safeFilename);
      }

      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 6000);
    } catch (err: any) {
      console.warn("[PDF Download] Proxy fetch failed, triggering direct fallback...", err);
      // Last-ditch direct anchor navigation fallback
      try {
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.download = safeFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setDownloaded(true);
      } catch {
        setError("Download failed. Please check your internet connection.");
      }
    } finally {
      setDownloading(false);
    }
  };

  const triggerBlobDownload = (blob: Blob, filename: string) => {
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    let previewUrl = url;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      previewUrl = `/api/pdf/proxy-download?url=${encodeURIComponent(url)}&title=${encodeURIComponent(displayTitle)}&inline=1`;
    } else if (!url.includes('/api/')) {
      previewUrl = `/api/pdf-store/file/${encodeURIComponent(url)}?title=${encodeURIComponent(displayTitle)}`;
    }
    window.open(previewUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="my-8 not-prose bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* 1. Header with blue underline (Exact Nigerian Educational Portal Format) */}
      <div className="pb-2 mb-3 border-b-2 border-blue-600 dark:border-blue-500">
        <h4 className="text-sm sm:text-base font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <span className="text-base sm:text-lg">📥</span>
          <span>{headingText}</span>
        </h4>
      </div>

      {/* 2. Descriptive lead-in text */}
      <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-4 leading-relaxed font-normal">
        Candidates can download the complete official timetable in PDF format using the link below:
      </p>

      {/* 3. Primary Download Button/Link (Styled with document icon) */}
      <div className="my-3 flex flex-wrap items-center gap-3">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="group inline-flex items-center gap-2.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold text-base sm:text-lg text-left transition-all cursor-pointer focus:outline-none"
        >
          {downloading ? (
            <Loader2 size={22} className="animate-spin text-blue-600 dark:text-blue-400 shrink-0" />
          ) : downloaded ? (
            <CheckCircle2 size={22} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <span className="text-xl shrink-0">📄</span>
          )}
          <span className="underline decoration-blue-400 group-hover:decoration-blue-600 underline-offset-4 decoration-1">
            {linkText}
          </span>
        </button>

        {/* Action Pills */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
            title="Download PDF directly to device"
          >
            {downloading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Downloading...</span>
              </>
            ) : downloaded ? (
              <>
                <CheckCircle2 size={13} />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Download size={13} />
                <span>Download</span>
              </>
            )}
          </button>

          <button
            onClick={handlePreview}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
            title="Preview PDF in new tab"
          >
            <Eye size={13} />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-2 text-xs text-red-600 dark:text-red-400 font-medium">
          {error}
        </div>
      )}

      {/* 4. Styled Note Callout Card with blue vertical accent border */}
      <div className="mt-5 border-l-4 border-blue-600 dark:border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 px-4 py-3.5 rounded-r-xl">
        <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed italic">
          <strong className="font-bold not-italic text-gray-900 dark:text-white mr-1.5">
            📌 Note:
          </strong>
          {defaultNote}
        </p>
      </div>
    </div>
  );
};
