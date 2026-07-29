const fs = require('fs');

let content = fs.readFileSync('src/components/PdfExportModal.tsx', 'utf8');

const newFn = `
  const handleDownloadImage = async () => {
    setIsGeneratingPdf(true);
    try {
      const element = document.getElementById('printable-result-slip');
      if (!element) return;

      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');

      const convertOklchColors = (cssText) => {
        if (!cssText || typeof cssText !== 'string' || !cssText.includes('okl')) {
          return cssText;
        }
        return cssText.replace(/(?:oklch|oklab|color)\([^)]+\)/gi, (match) => {
          try {
            if (ctx) {
              ctx.fillStyle = '#000000';
              ctx.fillStyle = match;
              const safe = ctx.fillStyle;
              if (safe && safe !== '#000000') return safe;
            }
          } catch (e) {
          }
          return '#2563eb';
        });
      };

      const canvas = await html2canvas(element, {
        scale: 3, // Higher scale for images
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          const styleElements = clonedDoc.querySelectorAll('style');
          styleElements.forEach((styleEl) => {
            if (styleEl.textContent) {
              styleEl.textContent = convertOklchColors(styleEl.textContent);
            }
          });

          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el) => {
            const htmlEl = el;
            if (htmlEl.style) {
              const inlineStyle = htmlEl.getAttribute('style');
              if (inlineStyle && inlineStyle.includes('okl')) {
                htmlEl.setAttribute('style', convertOklchColors(inlineStyle));
              }
            }
          });
        }
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const cleanFileName = \`\${(targetUni?.name || 'University').replace(/\s+/g, '_')}_\${(targetCourse || 'Course').replace(/\s+/g, '_')}_Result_Slip.png\`;
      
      const link = document.createElement('a');
      link.download = cleanFileName;
      link.href = imgData;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error("Image generation failed:", error);
      alert("Failed to generate image. Please try downloading as PDF instead.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };
`;

const insertIndex = content.indexOf('const handleDownloadText = () => {');
if (insertIndex !== -1) {
  content = content.slice(0, insertIndex) + newFn + '\n  ' + content.slice(insertIndex);
}

// Add the image icon import if not present
if (!content.includes('Image as ImageIcon')) {
    content = content.replace("Award, FileText, Loader2 } from 'lucide-react';", "Award, FileText, Loader2, Image as ImageIcon } from 'lucide-react';");
}

// Add the download image button
const targetButtonBlock = `            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <FileText size={14} />
                  <span>Download PDF Result Slip</span>
                </>
              )}
            </button>`;

const newButtons = `            <button
              onClick={handleDownloadImage}
              disabled={isGeneratingPdf}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span className="hidden sm:inline">Generating...</span>
                </>
              ) : (
                <>
                  <ImageIcon size={14} />
                  <span className="hidden sm:inline">Save Image</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span className="hidden sm:inline">Generating...</span>
                </>
              ) : (
                <>
                  <FileText size={14} />
                  <span className="hidden sm:inline">Save PDF</span>
                </>
              )}
            </button>`;

content = content.replace(targetButtonBlock, newButtons);

fs.writeFileSync('src/components/PdfExportModal.tsx', content, 'utf8');
