export interface CloudflareImage {
  id: string;                    // e.g., "themes/akurai/logo.webp"
  filename: string;              // e.g., "logo.webp"
  uploadedDate: string;          // ISO 8601 format, e.g., "2025-01-15T10:30:00Z"
  size?: number;                 // File size in bytes
  requireSignedURLs: boolean;    // Whether signed URLs are required
}

export interface DirectoryNode {
  name: string;                  // e.g., "akurai"
  path: string;                  // Full path, e.g., "themes/akurai"
  subdirs?: DirectoryNode[];     // Nested subdirectories
  images?: CloudflareImage[];    // Images in this directory
}

export interface DirectoryResponse {
  path: string;                  // Current path
  subdirs: DirectoryNode[];      // Subdirectories at this path
  images: CloudflareImage[];     // Images at this path
}

export interface ImagesResponse {
  images: CloudflareImage[];     // Array of all images
  total: number;                 // Total image count
}
