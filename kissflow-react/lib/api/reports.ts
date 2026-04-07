import { apiGet, apiPost, apiPut, apiDelete } from './client';

// Types matching backend
export type ReportType = 'table' | 'chart' | 'pivot' | 'card';

export interface Report {
  id: string;
  dataLayerId: string;
  name: string;
  slug: string;
  type: ReportType;
  description: string | null;
  config: Record<string, unknown> | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReportInput {
  name: string;
  type: ReportType;
  description?: string;
  config?: Record<string, unknown>;
}

export interface UpdateReportInput {
  name?: string;
  type?: ReportType;
  description?: string | null;
  config?: Record<string, unknown>;
  isDefault?: boolean;
}

export interface ListReportsParams {
  search?: string;
  type?: ReportType;
}

// API Functions

export async function listReports(
  dataLayerId: string,
  params: ListReportsParams = {}
): Promise<Report[]> {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set('search', params.search);
  if (params.type) searchParams.set('type', params.type);

  const queryString = searchParams.toString();
  const endpoint = queryString
    ? `/api/data-layers/${dataLayerId}/reports?${queryString}`
    : `/api/data-layers/${dataLayerId}/reports`;

  return apiGet<Report[]>(endpoint);
}

export async function getReportById(
  dataLayerId: string,
  reportId: string
): Promise<Report> {
  return apiGet<Report>(`/api/data-layers/${dataLayerId}/reports/${reportId}`);
}

export async function getReportBySlug(
  dataLayerId: string,
  slug: string
): Promise<Report> {
  return apiGet<Report>(`/api/data-layers/${dataLayerId}/reports/slug/${slug}`);
}

export async function createReport(
  dataLayerId: string,
  input: CreateReportInput
): Promise<Report> {
  return apiPost<Report>(`/api/data-layers/${dataLayerId}/reports`, input);
}

export async function updateReport(
  dataLayerId: string,
  reportId: string,
  input: UpdateReportInput
): Promise<Report> {
  return apiPut<Report>(`/api/data-layers/${dataLayerId}/reports/${reportId}`, input);
}

export async function deleteReport(
  dataLayerId: string,
  reportId: string
): Promise<void> {
  await apiDelete(`/api/data-layers/${dataLayerId}/reports/${reportId}`);
}
