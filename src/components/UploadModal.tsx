import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { uploadImage } from '../utils/api';

interface UploadModalProps {
  isOpen: boolean;
  currentPath: string;
  onClose: () => void;
  onUploadComplete: () => void;
}

function UploadModal({ isOpen, currentPath, onClose, onUploadComplete }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [customPath, setCustomPath] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setFile(null);
      setCustomPath(currentPath);
      setError(null);
      setUploading(false);
    }
  }, [isOpen, currentPath]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !uploading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, uploading, onClose]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !uploading) {
      onClose();
    }
  }, [uploading, onClose]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (droppedFile.type.startsWith('image/')) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError('Only image files are allowed');
      }
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      // Build the full image ID (path + filename)
      const basePath = customPath.trim();
      const imageId = basePath ? `${basePath}/${file.name}` : file.name;

      const result = await uploadImage(file, imageId);

      if (result.success) {
        onUploadComplete();
        onClose();
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [file, customPath, onUploadComplete, onClose]);

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 fade-in"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        disabled={uploading}
        className="absolute top-4 right-4 text-gray-400 hover:text-cyan transition-colors z-10 p-2 disabled:opacity-50"
        aria-label="Close modal"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Modal content */}
      <div className="bg-dark border border-cyan/30 rounded-lg p-6 max-w-md w-full mx-4">
        <h2 id="upload-modal-title" className="neon-cyan font-mono text-lg mb-6 text-center">
          Upload Image
        </h2>

        {/* Drop zone */}
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 mb-4 text-center transition-colors cursor-pointer
            ${dragOver ? 'border-cyan bg-cyan/10' : 'border-gray-600 hover:border-gray-500'}
            ${file ? 'border-lime/50 bg-lime/5' : ''}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleBrowseClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {file ? (
            <div>
              <svg className="w-12 h-12 mx-auto mb-3 text-lime" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-200 font-mono text-sm">{file.name}</p>
              <p className="text-gray-500 text-xs mt-1">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          ) : (
            <div>
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-gray-400 font-mono text-sm">Drop image here or click to browse</p>
              <p className="text-gray-600 text-xs mt-1">PNG, JPG, WebP, GIF, SVG</p>
            </div>
          )}
        </div>

        {/* Path input */}
        <div className="mb-4">
          <label className="block text-gray-400 font-mono text-xs mb-2">
            Directory Path
          </label>
          <input
            type="text"
            value={customPath}
            onChange={(e) => setCustomPath(e.target.value)}
            placeholder="e.g., themes/flavor"
            className="
              w-full px-3 py-2 bg-[#0a0a0a] border border-gray-700 rounded
              font-mono text-sm text-gray-200 placeholder-gray-600
              focus:outline-none focus:border-cyan/50
            "
          />
          <p className="text-gray-600 text-xs mt-1">
            {file && (
              <>Final ID: <span className="text-cyan">{customPath ? `${customPath}/${file.name}` : file.name}</span></>
            )}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded">
            <p className="text-red-400 font-mono text-sm">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={uploading}
            className="
              flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700
              text-gray-300 font-mono text-sm rounded transition-colors
              disabled:opacity-50
            "
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="
              flex-1 px-4 py-2 bg-cyan/20 hover:bg-cyan/30 border border-cyan/50
              text-cyan font-mono text-sm rounded transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-cyan/30 border-t-cyan rounded-full animate-spin" />
                Uploading...
              </span>
            ) : (
              'Upload'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(UploadModal);
