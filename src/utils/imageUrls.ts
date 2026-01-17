// Cloudflare Images account hash (configurable via env)
const ACCOUNT_HASH = import.meta.env.VITE_CF_ACCOUNT_HASH;
const BASE_URL = `https://imagedelivery.net/${ACCOUNT_HASH}`;

/**
 * Format file size in bytes to human-readable format
 */
export function formatFileSize(bytes: number | undefined): string {
  if (bytes === undefined || bytes === null) return '';

  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return unitIndex === 0
    ? Math.round(size) + ' ' + units[unitIndex]
    : size.toFixed(1) + ' ' + units[unitIndex];
}

/**
 * Construct thumbnail URL for grid display
 */
export function getThumbnailURL(imageId: string): string {
  return `${BASE_URL}/${imageId}/thumbnail`;
}

/**
 * Construct full-size URL for modal display
 */
export function getFullSizeURL(imageId: string): string {
  return `${BASE_URL}/${imageId}/public`;
}

/**
 * Construct default variant URL
 */
export function getDefaultURL(imageId: string): string {
  return `${BASE_URL}/${imageId}/default`;
}

/**
 * Format upload date to readable format
 */
export function formatUploadDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
