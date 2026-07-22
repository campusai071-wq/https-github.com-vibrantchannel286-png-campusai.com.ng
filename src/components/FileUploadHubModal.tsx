import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, Loader2, Trash2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { PdfReader } from './PdfReader';

interface FileUploadHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTextParsed?: (extractedText: string) => void;
}

interface UploadedFileItem {
  id: string;
  name: string;
  size: string;
  type: string;
  date: string;
  extractedText?: string;
}

export const FileUploadHubModal: React.FC<FileUploadHubModalProps> = ({ isOpen, onClose, onTextParsed }) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'history'>('upload');
  const [parsedPreview, setParsedPreview] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const file = files[0];
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const resultText = event.target?.result as string || `Uploaded document: ${file.name}`;
      const newItem: UploadedFileItem = {
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type || 'application/pdf',
        date: new Date().toLocaleDateString(),
        extractedText: resultText
      };

      setUploadedFiles(prev => [newItem, ...prev]);
      setParsedPreview(resultText);
      setIsUploading(false);
      if (onTextParsed) {
        onTextParsed(resultText);
      }
    };

    if (file.type.includes('image')) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handlePdfTextExtracted = (text: string) => {
    const newItem: UploadedFileItem = {
      id: Math.random().toString(36).substring(2, 9),
      name: `O-Level_Result_Slip_${Date.now()}.pdf`,
      size: `${(text.length / 1024).toFixed(1)} KB`,
      type: 'application/pdf',
      date: new Date().toLocaleDateString(),
      extractedText: text
    };
    setUploadedFiles(prev => [newItem, ...prev]);
    setParsedPreview(text);
    if (onTextParsed) {
      onTextParsed(text);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Upload size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Document & File Upload Hub</h3>
              <p className="text-[10px] text-gray-500">Upload O-Level results, JAMB slips, or past questions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 px-6">
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${activeTab === 'upload' ? 'border-purple-600 text-purple-600 dark:text-purple-400' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
          >
            Upload Document
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${activeTab === 'history' ? 'border-purple-600 text-purple-600 dark:text-purple-400' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
          >
            Uploaded Files ({uploadedFiles.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 space-y-6">
          {activeTab === 'upload' ? (
            <div className="space-y-6">
              
              {/* Drag and Drop Zone */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-3xl p-8 text-center hover:border-purple-500 transition-all bg-gray-50 dark:bg-gray-800/20 relative">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.png,.jpg,.jpeg,.txt"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center mx-auto mb-4">
                  {isUploading ? <Loader2 className="animate-spin" size={24} /> : <Upload size={24} />}
                </div>
                <h4 className="text-sm font-black text-gray-900 dark:text-white">Click or drag files here to upload</h4>
                <p className="text-xs text-gray-500 mt-1">Supports PDF (WAEC/NECO slips), PNG, JPG, or TXT documents</p>
                <span className="inline-block mt-4 px-3 py-1 bg-purple-600 text-white font-bold text-[10px] uppercase rounded-full shadow-md shadow-purple-500/20">
                  Browse Files
                </span>
              </div>

              {/* PDF Parser Helper */}
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-blue-500" />
                  <span className="text-xs font-black text-blue-900 dark:text-blue-200 uppercase tracking-wider">PDF Result Slip Extractor</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Select a PDF result slip to automatically parse scores and grades for your calculator:
                </p>
                <div className="mt-1">
                  <PdfReader onTextExtracted={handlePdfTextExtracted} />
                </div>
              </div>

              {/* Parsed Preview */}
              {parsedPreview && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={16} />
                    <span className="text-xs font-black uppercase tracking-wider">Document Parsed Successfully</span>
                  </div>
                  <p className="text-xs font-mono text-gray-700 dark:text-gray-300 max-h-32 overflow-y-auto bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-800">
                    {parsedPreview.substring(0, 400)}...
                  </p>
                </div>
              )}

            </div>
          ) : (
            <div className="space-y-4">
              {uploadedFiles.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <FileText size={40} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm font-bold">No files uploaded yet</p>
                  <p className="text-xs text-gray-500 mt-1">Upload result slips or documents to see them here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                          <FileText size={20} />
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-xs font-black text-gray-900 dark:text-white truncate">{file.name}</h5>
                          <p className="text-[10px] text-gray-500">{file.size} • Uploaded on {file.date}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setUploadedFiles(prev => prev.filter(f => f.id !== file.id))}
                        className="p-2 text-gray-400 hover:text-red-500 transition-all rounded-lg hover:bg-red-500/10"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/20 transition-all"
          >
            Done & Return
          </button>
        </div>

      </div>
    </div>
  );
};
