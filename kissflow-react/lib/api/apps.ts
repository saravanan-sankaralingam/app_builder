import { apiGet, apiPost, apiPut, apiDelete, PaginatedResponse } from './client';

// Types matching backend
export type AppType = 'app' | 'portal';
export type AppStatus = 'draft' | 'live' | 'archived';

export interface AppUser {
  id: string;
  name: string;
  email: string;
}

export interface App {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  iconBg: string;
  type: AppType;
  status: AppStatus;
  isPublic: boolean;
  version: number;
  createdById: string;
  createdAt: string;
  updatedById: string;
  updatedAt: string;
  createdBy: AppUser;
  updatedBy: AppUser;
}

export interface CreateAppInput {
  name: string;
  description?: string;
  icon?: string;
  iconBg?: string;
  type?: AppType;
}

export interface UpdateAppInput {
  name?: string;
  description?: string | null;
  icon?: string;
  iconBg?: string;
  type?: AppType;
  status?: AppStatus;
  isPublic?: boolean;
}

export interface ListAppsParams {
  status?: AppStatus;
  type?: AppType;
  search?: string;
  page?: number;
  limit?: number;
}

// API Functions

export async function listApps(params: ListAppsParams = {}): Promise<PaginatedResponse<App>> {
  const searchParams = new URLSearchParams();

  if (params.status) searchParams.set('status', params.status);
  if (params.type) searchParams.set('type', params.type);
  if (params.search) searchParams.set('search', params.search);
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());

  const queryString = searchParams.toString();
  const endpoint = queryString ? `/api/apps?${queryString}` : '/api/apps';

  return apiGet<PaginatedResponse<App>>(endpoint);
}

export async function getApp(id: string): Promise<App> {
  return apiGet<App>(`/api/apps/${id}`);
}

export async function getAppBySlug(slug: string): Promise<App> {
  return apiGet<App>(`/api/apps/slug/${slug}`);
}

export async function createApp(input: CreateAppInput): Promise<App> {
  return apiPost<App>('/api/apps', input);
}

export async function updateApp(id: string, input: UpdateAppInput): Promise<App> {
  return apiPut<App>(`/api/apps/${id}`, input);
}

export async function deleteApp(id: string): Promise<void> {
  await apiDelete(`/api/apps/${id}`);
}

export async function checkAppName(name: string, excludeId?: string): Promise<boolean> {
  const params = new URLSearchParams({ name });
  if (excludeId) params.set('excludeId', excludeId);

  const result = await apiGet<{ available: boolean }>(`/api/apps/check-name?${params}`);
  return result.available;
}
