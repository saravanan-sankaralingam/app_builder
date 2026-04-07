const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface UploadedFile {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
}

export interface UploadResponse {
  message: string;
  file: UploadedFile;
}

export async function uploadBundleFile(
  appId: string,
  componentId: string,
  file: File
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(
    `${API_BASE_URL}/api/apps/${appId}/components/${componentId}/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload file');
  }

  return response.json();
}

export async function getBundleFileInfo(
  appId: string,
  componentId: string
): Promise<UploadedFile | null> {
  const response = await fetch(
    `${API_BASE_URL}/api/apps/${appId}/components/${componentId}/upload`,
    {
      method: 'GET',
    }
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get bundle info');
  }

  return response.json();
}

export async function deleteBundleFile(
  appId: string,
  componentId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/apps/${appId}/components/${componentId}/upload`,
    {
      method: 'DELETE',
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete file');
  }
}
