const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  apps: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  let data;
  try {
    data = await response.json();
  } catch {
    throw new ApiError(
      'Network error or invalid response from server',
      response.status || 0,
      null
    );
  }

  if (!response.ok) {
    throw new ApiError(
      data.error || 'An error occurred',
      response.status,
      data
    );
  }

  return data.data;
}

export async function apiGet<T>(endpoint: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch {
    throw new ApiError('Unable to connect to server', 0, null);
  }

  return handleResponse<T>(response);
}

export async function apiPost<T>(endpoint: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError('Unable to connect to server', 0, null);
  }

  return handleResponse<T>(response);
}

export async function apiPut<T>(endpoint: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError('Unable to connect to server', 0, null);
  }

  return handleResponse<T>(response);
}

export async function apiDelete<T>(endpoint: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch {
    throw new ApiError('Unable to connect to server', 0, null);
  }

  return handleResponse<T>(response);
}
