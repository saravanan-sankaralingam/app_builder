import { apiGet, apiPost, apiPut, apiDelete } from './client';

// Types matching backend
export type ComponentType = 'page' | 'form';
export type ComponentMethod = 'scratch' | 'ai';

export interface Parameter {
  id: string;
  name: string;
  paramId: string;
  type: 'string' | 'number' | 'static_dropdown';
  defaultValue?: string;
}

export interface Component {
  id: string;
  appId: string;
  name: string;
  slug: string;
  description: string | null;
  type: ComponentType;
  method: ComponentMethod;
  prompt: string | null;
  config: Record<string, unknown> | null;
  parameters: Parameter[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateComponentInput {
  name: string;
  type?: ComponentType;
  method?: ComponentMethod;
  prompt?: string;
  description?: string;
}

export interface UpdateComponentInput {
  name?: string;
  type?: ComponentType;
  description?: string | null;
  config?: Record<string, unknown>;
  parameters?: Parameter[];
}

export interface AddParameterInput {
  id: string;
  name: string;
  paramId: string;
  type: 'string' | 'number' | 'static_dropdown';
  defaultValue?: string;
}

export interface ListComponentsParams {
  search?: string;
  type?: ComponentType;
}

// API Functions

export async function listComponents(
  appId: string,
  params: ListComponentsParams = {}
): Promise<Component[]> {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set('search', params.search);
  if (params.type) searchParams.set('type', params.type);

  const queryString = searchParams.toString();
  const endpoint = queryString
    ? `/api/apps/${appId}/components?${queryString}`
    : `/api/apps/${appId}/components`;

  return apiGet<Component[]>(endpoint);
}

export async function getComponentById(
  appId: string,
  componentId: string
): Promise<Component> {
  return apiGet<Component>(`/api/apps/${appId}/components/${componentId}`);
}

export async function getComponentBySlug(
  appId: string,
  slug: string
): Promise<Component> {
  return apiGet<Component>(`/api/apps/${appId}/components/slug/${slug}`);
}

export async function createComponent(
  appId: string,
  input: CreateComponentInput
): Promise<Component> {
  return apiPost<Component>(`/api/apps/${appId}/components`, input);
}

export async function updateComponent(
  appId: string,
  componentId: string,
  input: UpdateComponentInput
): Promise<Component> {
  return apiPut<Component>(`/api/apps/${appId}/components/${componentId}`, input);
}

export async function deleteComponent(
  appId: string,
  componentId: string
): Promise<void> {
  await apiDelete(`/api/apps/${appId}/components/${componentId}`);
}

// Parameter-specific API functions

export async function addParameter(
  appId: string,
  componentId: string,
  parameter: AddParameterInput
): Promise<Component> {
  return apiPost<Component>(
    `/api/apps/${appId}/components/${componentId}/parameters`,
    parameter
  );
}

export async function deleteParameter(
  appId: string,
  componentId: string,
  parameterId: string
): Promise<Component> {
  return apiDelete<Component>(
    `/api/apps/${appId}/components/${componentId}/parameters/${parameterId}`
  );
}
