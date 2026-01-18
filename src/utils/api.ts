// API utilities for image operations

const getApiBaseUrl = () => {
  return import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL || '');
};

const getApiKey = () => {
  return import.meta.env.VITE_DASHBOARD_API_KEY || '';
};

export interface UploadResult {
  success: boolean;
  image?: {
    id: string;
    filename: string;
    uploaded: string;
  };
  error?: string;
}

export interface DeleteResult {
  success: boolean;
  deleted?: string;
  error?: string;
}

/**
 * Upload an image to Cloudflare Images
 */
export async function uploadImage(file: File, id?: string): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  if (id) {
    formData.append('id', id);
  }

  const response = await fetch(`${getApiBaseUrl()}/api/images`, {
    method: 'POST',
    headers: {
      'X-API-Key': getApiKey(),
    },
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    return {
      success: false,
      error: result.error || 'Upload failed',
    };
  }

  return result;
}

/**
 * Delete an image from Cloudflare Images
 */
export async function deleteImage(id: string): Promise<DeleteResult> {
  const response = await fetch(`${getApiBaseUrl()}/api/images?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: {
      'X-API-Key': getApiKey(),
    },
  });

  const result = await response.json();

  if (!response.ok) {
    return {
      success: false,
      error: result.error || 'Delete failed',
    };
  }

  return result;
}
