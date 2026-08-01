import React, { useState } from 'react';
import { Image as ImageIcon, Plus, Trash2, Loader2, Check, Sparkles } from 'lucide-react';
import { compressImage } from '../services/utils';

interface ArticleImagesUploaderProps {
  images?: string[];
  featuredImage?: string;
  onChangeImages: (images: string[], featuredImage: string) => void;
  onInsertMarkdown?: (imageUrl: string) => void;
}

export const ArticleImagesUploader: React.FC<ArticleImagesUploaderProps> = ({
  images = [],
  featuredImage = '',
  onChangeImages,
  onInsertMarkdown
}) => {
  const [isCompressing, setIsCompressing] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const handleFilesAdded = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsCompressing(true);
    try {
      const newBase64s: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const compressed = await compressImage(files[i], 1000);
        newBase64s.push(compressed);
      }
      
      // Combine existing images and newly added images
      const combined = [...images];
      newBase64s.forEach(img => {
        if (!combined.includes(img)) {
          combined.push(img);
        }
      });
      
      // Set the newly uploaded image as the featured primary image
      const newFeatured = newBase64s[0] || combined[0] || '';
      onChangeImages(combined, newFeatured);
    } catch (err) {
      console.error("Error compressing images:", err);
      alert("Failed to process image files.");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    const url = urlInput.trim();
    const updated = images.includes(url) ? images : [...images, url];
    // Automatically make newly added URL the primary picture
    const newFeatured = url;
    onChangeImages(updated, newFeatured);
    setUrlInput('');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const targetUrl = images[indexToRemove];
    const updatedList = images.filter((_, idx) => idx !== indexToRemove);
    let newFeatured = featuredImage;
    if (featuredImage === targetUrl || !updatedList.includes(featuredImage)) {
      newFeatured = updatedList[0] || '';
    }
    onChangeImages(updatedList, newFeatured);
  };

  const handleSetFeatured = (imgUrl: string) => {
    onChangeImages(images, imgUrl);
  };

  return (
    <div className="space-y-4 p-5 bg-gray-50 dark:bg-gray-800/60 rounded-3xl border border-gray-100 dark:border-gray-700/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="text-[11px] font-black text-gray-700 dark:text-gray-200 uppercase tracking-widest flex items-center gap-2">
            <ImageIcon size={14} className="text-blue-600 dark:text-blue-400" /> Article Pictures / Gallery ({images.length})
          </label>
          <p className="text-[10px] font-semibold text-gray-400">Upload multiple photos for article body & photo gallery</p>
        </div>

        <label className="cursor-pointer px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20">
          {isCompressing ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          <span>{isCompressing ? "Processing Pictures..." : "Upload Multiple Pictures"}</span>
          <input 
            type="file" 
            accept="image/*" 
            multiple 
            className="hidden" 
            disabled={isCompressing}
            onChange={e => handleFilesAdded(e.target.files)} 
          />
        </label>
      </div>

      {/* URL Input fallback */}
      <div className="flex gap-2">
        <input
          type="url"
          value={urlInput}
          onChange={e => setUrlInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddUrl(); } }}
          className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium dark:text-white outline-none focus:border-blue-500"
          placeholder="Or paste external image URL (https://...)"
        />
        <button
          type="button"
          onClick={handleAddUrl}
          className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors"
        >
          Add URL
        </button>
      </div>

      {/* Images Thumbnails Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
          {images.map((img, idx) => {
            if (!img || typeof img !== 'string' || !img.trim()) return null;
            const cleanImg = img.trim();
            const isFeatured = cleanImg === featuredImage;
            return (
              <div 
                key={idx} 
                className={`group relative aspect-video rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-950 border-2 transition-all ${
                  isFeatured ? 'border-blue-500 ring-4 ring-blue-500/20 shadow-lg' : 'border-gray-200 dark:border-gray-800 hover:border-gray-400'
                }`}
              >
                <img src={cleanImg} alt={`Uploaded ${idx + 1}`} className="w-full h-full object-cover" />
                
                {isFeatured ? (
                  <span className="absolute top-2 left-2 bg-blue-600 text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md border border-white/20 flex items-center gap-1">
                    <Check size={8} /> Featured
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSetFeatured(img)}
                    className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 hover:bg-blue-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full backdrop-blur-xs"
                  >
                    Set as Primary
                  </button>
                )}

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors shadow-md"
                      title="Delete this picture"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <div className="flex gap-1">
                    {onInsertMarkdown && (
                      <button
                        type="button"
                        onClick={() => onInsertMarkdown(img)}
                        className="w-full py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1 shadow-md"
                      >
                        <Sparkles size={10} /> Insert in Content
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-6 border-2 border-dashed border-gray-200 dark:border-gray-700/80 rounded-2xl text-center space-y-1">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400">No article pictures uploaded yet.</p>
          <p className="text-[10px] text-gray-400">Click <span className="font-bold text-blue-500">"Upload Multiple Pictures"</span> to select photos from your device.</p>
        </div>
      )}
    </div>
  );
};
