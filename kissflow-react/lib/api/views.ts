import { apiGet, apiPost, apiPut, apiDelete } from './client';

// Types matching backend
export type ViewType = 'datatable' | 'gallery' | 'sheet';

export interface View {
  id: string;
  dataLayerId: string;
  name: string;
  slug: string;
  type: ViewType;
  description: string | null;
  config: Record<string, unknown> | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateViewInput {
  name: string;
  type: ViewType;
  description?: string;
  config?: Record<string, unknown>;
}

export interface UpdateViewInput {
  name?: string;
  type?: ViewType;
  description?: string | null;
  config?: Record<string, unknown>;
  isDefault?: boolean;
}

export interface ListViewsParams {
  search?: string;
  type?: ViewType;
}

// API Functions

export async function listViews(
  dataLayerId: string,
  params: ListViewsParams = {}
): Promise<View[]> {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set('search', params.search);
  if (params.type) searchParams.set('type', params.type);

  const queryString = searchParams.toString();
  const endpoint = queryString
    ? `/api/data-layers/${dataLayerId}/views?${queryString}`
    : `/api/data-layers/${dataLayerId}/views`;

  return apiGet<View[]>(endpoint);
}

export async function getViewById(
  dataLayerId: string,
  viewId: string
): Promise<View> {
  return apiGet<View>(`/api/data-layers/${dataLayerId}/views/${viewId}`);
}

export async function getViewBySlug(
  dataLayerId: string,
  slug: string
): Promise<View> {
  return apiGet<View>(`/api/data-layers/${dataLayerId}/views/slug/${slug}`);
}

export async function createView(
  dataLayerId: string,
  input: CreateViewInput
): Promise<View> {
  return apiPost<View>(`/api/data-layers/${dataLayerId}/views`, input);
}

export async function updateView(
  dataLayerId: string,
  viewId: string,
  input: UpdateViewInput
): Promise<View> {
  return apiPut<View>(`/api/data-layers/${dataLayerId}/views/${viewId}`, input);
}

export async function deleteView(
  dataLayerId: string,
  viewId: string
): Promise<void> {
  await apiDelete(`/api/data-layers/${dataLayerId}/views/${viewId}`);
}
