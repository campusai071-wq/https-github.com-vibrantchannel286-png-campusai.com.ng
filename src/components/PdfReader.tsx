import React, { useState } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { Loader2 } from 'lucide-react';

// Set the worker source
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export const PdfReader: React.FC<{ onTextExtracted: (text: string) => void }> = ({ onTextExtracted }) => {
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const typedarray = new Uint8Array(e.target?.result as ArrayBuffer);
      const pdf = await pdfjs.getDocument(typedarray).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(' ');
      }
      onTextExtracted(text);
      setLoading(false);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="p-4 border rounded-xl">
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      {loading && <Loader2 className="animate-spin" />}
    </div>
  );
};
