import { apiGet, apiPost, apiPut, apiDelete } from './client';

// Types matching backend
export type DataLayerType = 'dataform' | 'board' | 'process' | 'list';

export interface DataLayer {
  id: string;
  appId: string;
  name: string;
  slug: string;
  description: string | null;
  type: DataLayerType;
  config: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDataLayerInput {
  name: string;
  description?: string;
  type?: DataLayerType;
}

export interface UpdateDataLayerInput {
  name?: string;
  description?: string | null;
  config?: Record<string, any>;
}

export interface ListDataLayersParams {
  type?: DataLayerType;
  search?: string;
}

// API Functions

export async function listDataLayers(appId: string, params: ListDataLayersParams = {}): Promise<DataLayer[]> {
  const searchParams = new URLSearchParams();

  if (params.type) searchParams.set('type', params.type);
  if (params.search) searchParams.set('search', params.search);

  const queryString = searchParams.toString();
  const endpoint = queryString
    ? `/api/apps/${appId}/data-layers?${queryString}`
    : `/api/apps/${appId}/data-layers`;

  return apiGet<DataLayer[]>(endpoint);
}

export async function getDataLayer(id: string): Promise<DataLayer> {
  return apiGet<DataLayer>(`/api/data-layers/${id}`);
}

export async function getDataLayerBySlug(appId: string, slug: string): Promise<DataLayer> {
  return apiGet<DataLayer>(`/api/apps/${appId}/data-layers/slug/${slug}`);
}

export async function createDataLayer(appId: string, input: CreateDataLayerInput): Promise<DataLayer> {
  return apiPost<DataLayer>(`/api/apps/${appId}/data-layers`, input);
}

export async function updateDataLayer(id: string, input: UpdateDataLayerInput): Promise<DataLayer> {
  return apiPut<DataLayer>(`/api/data-layers/${id}`, input);
}

export async function deleteDataLayer(id: string): Promise<void> {
  await apiDelete(`/api/data-layers/${id}`);
}

export async function duplicateDataLayer(
  appId: string,
  id: string,
  options: { name: string; includeViews?: boolean; includeReports?: boolean }
): Promise<DataLayer> {
  return apiPost<DataLayer>(
    `/api/apps/${appId}/data-layers/${id}/duplicate`,
    options
  );
}
