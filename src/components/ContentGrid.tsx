import { memo, useState, useCallback } from 'react';
import type { CloudflareImage, DirectoryNode } from '../types';
import { getThumbnailURL, formatFileSize, formatUploadDate } from '../utils/imageUrls';

interface ContentGridProps {
  subdirs: DirectoryNode[];
  images: CloudflareImage[];
  onDirClick: (path: string) => void;
  onImageClick: (image: CloudflareImage) => void;
  loading: boolean;
}

interface DirCardProps {
  dir: DirectoryNode;
  onClick: (path: string) => void;
}

interface ImageCardProps {
  image: CloudflareImage;
  onClick: (image: CloudflareImage) => void;
}

const DirCard = memo(function DirCard({ dir, onClick }: DirCardProps) {
  const handleClick = useCallback(() => {
    onClick(dir.path);
  }, [dir.path, onClick]);

  const imageCount = dir.images?.length || 0;
  const subdirCount = dir.subdirs?.length || 0;

  return (
    <div
      className="
        bg-dark-secondary rounded-lg overflow-hidden cursor-pointer
        border border-purple/30 hover:border-purple
        transform transition-all duration-300 hover:scale-105
        hover:shadow-[0_0_15px_rgba(160,0,255,0.4)]
      "
      onClick={handleClick}
    >
      {/* Folder icon area */}
      <div className="aspect-video bg-[#0a0a0a] flex items-center justify-center">
        <svg className="w-16 h-16 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      </div>

      {/* Info container */}
      <div className="p-3">
        <p className="font-mono text-sm text-gray-200 truncate" title={dir.name}>
          {dir.name}
        </p>
        <div className="flex justify-between items-center mt-1.5 text-xs text-gray-500">
          <span>{subdirCount} folders</span>
          <span className="text-purple">{imageCount} images</span>
        </div>
      </div>
    </div>
  );
});

const ImageCard = memo(function ImageCard({ image, onClick }: ImageCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleClick = useCallback(() => {
    onClick(image);
  }, [image, onClick]);

  const handleLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  return (
    <div
      className="
        bg-dark-secondary rounded-lg overflow-hidden cursor-pointer
        border border-[#333] hover-glow
        transform transition-all duration-300 hover:scale-105
      "
      onClick={handleClick}
    >
      {/* Image container */}
      <div className="relative aspect-video bg-[#0a0a0a] overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="spin-glow w-8 h-8" />
          </div>
        )}
        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        ) : (
          <img
            src={getThumbnailURL(image.id)}
            alt={image.filename}
            className={`
              w-full h-full object-cover transition-opacity duration-300
              ${imageLoaded ? 'opacity-100' : 'opacity-0'}
            `}
            loading="lazy"
            onLoad={handleLoad}
            onError={handleError}
          />
        )}
      </div>

      {/* Info container */}
      <div className="p-3">
        <p className="font-mono text-sm text-gray-200 truncate" title={image.filename}>
          {image.filename}
        </p>
        <div className="flex justify-between items-center mt-1.5 text-xs text-gray-500">
          <span>{formatUploadDate(image.uploadedDate)}</span>
          {image.size && <span className="text-cyan">{formatFileSize(image.size)}</span>}
        </div>
      </div>
    </div>
  );
});

function ContentGrid({ subdirs, images, onDirClick, onImageClick, loading }: ContentGridProps) {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="spin-glow w-12 h-12 mx-auto mb-4" />
          <p className="text-cyan font-mono">Scanning sector for signals...</p>
        </div>
      </div>
    );
  }

  const isEmpty = subdirs.length === 0 && images.length === 0;

  if (isEmpty) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <p className="text-gray-400 font-mono text-lg mb-2">No signals detected in this sector</p>
          <p className="text-gray-600 font-mono text-sm">Navigate to a different subsystem</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {/* Directories first, sorted A-Z */}
        {[...subdirs].sort((a, b) => a.name.localeCompare(b.name)).map((dir) => (
          <DirCard key={dir.path} dir={dir} onClick={onDirClick} />
        ))}
        {/* Then images, sorted A-Z */}
        {[...images].sort((a, b) => a.filename.localeCompare(b.filename)).map((image) => (
          <ImageCard key={image.id} image={image} onClick={onImageClick} />
        ))}
      </div>
    </div>
  );
}

export default memo(ContentGrid);
