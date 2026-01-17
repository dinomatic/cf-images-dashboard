import { memo, useEffect, useCallback, useState, useRef } from 'react';
import type { CloudflareImage } from '../types';
import { getFullSizeURL, formatFileSize, formatUploadDate } from '../utils/imageUrls';

interface ImageModalProps {
  image: CloudflareImage | null;
  onClose: () => void;
}

function ImageModal({ image, onClose }: ImageModalProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [copied, setCopied] = useState(false);
  const prevImageIdRef = useRef<string | undefined>(undefined);

  // Reset states when image changes (using ref to avoid lint warning)
  if (image?.id !== prevImageIdRef.current) {
    prevImageIdRef.current = image?.id;
    if (imageLoaded) setImageLoaded(false);
    if (imageError) setImageError(false);
    if (copied) setCopied(false);
  }

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (image) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [image, onClose]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  const handleCopyUrl = useCallback(async () => {
    if (!image) return;
    try {
      await navigator.clipboard.writeText(getFullSizeURL(image.id));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = getFullSizeURL(image.id);
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [image]);

  if (!image) return null;

  const imageUrl = getFullSizeURL(image.id);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 fade-in"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-cyan transition-colors z-10 p-2"
        aria-label="Close modal"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Modal content */}
      <div className="flex flex-col items-center max-w-[90vw] max-h-[90vh]">
        {/* Filename */}
        <h2 id="modal-title" className="neon-cyan font-mono text-lg mb-4 text-center px-4">
          {image.filename}
        </h2>

        {/* Image container */}
        <div className="relative border-neon-cyan-strong rounded-lg overflow-hidden bg-dark">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center min-w-[200px] min-h-[200px]">
              <div className="spin-glow w-12 h-12" />
            </div>
          )}
          {imageError ? (
            <div className="flex flex-col items-center justify-center min-w-[300px] min-h-[200px] p-8">
              <svg className="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-red-400 font-mono text-sm">Failed to load image</p>
              <p className="text-gray-600 font-mono text-xs mt-1">Signal transmission interrupted</p>
            </div>
          ) : (
            <img
              src={imageUrl}
              alt={image.filename}
              className={`
                max-w-full max-h-[70vh] object-contain transition-opacity duration-300
                ${imageLoaded ? 'opacity-100' : 'opacity-0'}
              `}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
        </div>

        {/* Metadata */}
        <div className="flex gap-6 mt-4 font-mono text-sm">
          {image.uploadedDate && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Uploaded:</span>
              <span className="text-cyan">{formatUploadDate(image.uploadedDate)}</span>
            </div>
          )}
          {image.size && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Size:</span>
              <span className="text-cyan">{formatFileSize(image.size)}</span>
            </div>
          )}
        </div>

        {/* URL with copy button */}
        <div className="flex items-center gap-2 mt-3 max-w-full px-4">
          <span className="font-mono text-xs text-gray-600 truncate">{imageUrl}</span>
          <button
            onClick={handleCopyUrl}
            className="flex-shrink-0 p-1.5 text-gray-500 hover:text-cyan transition-colors rounded hover:bg-white/5"
            aria-label="Copy URL to clipboard"
            title="Copy URL"
          >
            {copied ? (
              <svg className="w-4 h-4 text-lime" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(ImageModal);
