const fs = require('fs');

let content = fs.readFileSync('src/components/PdfExportModal.tsx', 'utf8');

// replace imports
content = content.replace("import html2canvas from 'html2canvas';", "import * as htmlToImage from 'html-to-image';");

// find handleDownloadPdf and handleDownloadImage
const startIdx = content.indexOf('const handleDownloadPdf = async () => {');
const endIdx = content.indexOf('const handleDownloadText = () => {');

const newFunctions = `
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const element = document.getElementById('printable-result-slip');
      if (!element) return;
      
      const width = element.offsetWidth;
      const height = element.scrollHeight;

      const dataUrl = await htmlToImage.toPng(element, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        width: width,
        height: height,
        style: {
          transform: 'none',
          overflow: 'visible'
        }
      });

      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (height * pdfWidth) / width;
      
      // If the image is taller than one page, jsPDF might make it span, but let's just add it.
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);

      const uniName = targetUni?.name || 'University';
      const courseName = targetCourse || courseSearch || 'Course';
      const cleanFileName = \`\${uniName.replace(/[^a-zA-Z0-9]/g, '_')}_\${courseName.replace(/[^a-zA-Z0-9]/g, '_')}_Result_Slip.pdf\`;

      try {
        const pdfBlob = pdf.output('blob');
        const blobUrl = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = cleanFileName;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(blobUrl);
        }, 1000);
      } catch (blobErr) {
        pdf.save(cleanFileName);
      }
    } catch (error) {
      console.error("PDF generation failed:", error);
      handleDownloadText();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadImage = async () => {
    setIsGeneratingPdf(true);
    try {
      const element = document.getElementById('printable-result-slip');
      if (!element) return;
      
      const width = element.offsetWidth;
      const height = element.scrollHeight;

      const dataUrl = await htmlToImage.toPng(element, {
        quality: 1.0,
        pixelRatio: 3,
        backgroundColor: '#ffffff',
        width: width,
        height: height,
        style: {
          transform: 'none',
          overflow: 'visible'
        }
      });

      const cleanFileName = \`\${(targetUni?.name || 'University').replace(/[^a-zA-Z0-9]/g, '_')}_\${(targetCourse || 'Course').replace(/[^a-zA-Z0-9]/g, '_')}_Result_Slip.png\`;
      
      const link = document.createElement('a');
      link.download = cleanFileName;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error("Image generation failed:", error);
      alert("Failed to generate image.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };
`;

if (startIdx !== -1 && endIdx !== -1) {
  content = content.slice(0, startIdx) + newFunctions + '\\n  ' + content.slice(endIdx);
  fs.writeFileSync('src/components/PdfExportModal.tsx', content, 'utf8');
  console.log('Replaced successfully!');
} else {
  console.log('Could not find boundaries.');
}
