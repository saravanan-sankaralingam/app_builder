import { AppSchema, CreateAppInput } from './types';

const STORAGE_KEY = 'kissflow_apps';

// Generate a unique ID for apps
export function generateAppId(): string {
  return `app_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Generate URL-friendly slug from app name
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Get all apps from localStorage
export function getApps(): AppSchema[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const data = JSON.parse(stored);
    return data.apps || [];
  } catch (error) {
    console.error('Error reading apps from localStorage:', error);
    return [];
  }
}

// Get a single app by ID
export function getAppById(id: string): AppSchema | null {
  const apps = getApps();
  return apps.find((app) => app.id === id) || null;
}

// Get a single app by slug
export function getAppBySlug(slug: string): AppSchema | null {
  const apps = getApps();
  return apps.find((app) => app.slug === slug) || null;
}

// Save all apps to localStorage
function saveApps(apps: AppSchema[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ apps }));
  } catch (error) {
    console.error('Error saving apps to localStorage:', error);
  }
}

// Create a new app
export function createApp(input: CreateAppInput): AppSchema {
  const apps = getApps();
  const now = new Date().toISOString();

  // Generate unique slug
  let slug = generateSlug(input.name);
  let counter = 1;
  while (apps.some((app) => app.slug === slug)) {
    slug = `${generateSlug(input.name)}-${counter}`;
    counter++;
  }

  const newApp: AppSchema = {
    id: generateAppId(),
    name: input.name,
    slug,
    icon: input.icon,
    iconBg: input.iconBg,
    description: input.description,
    type: input.type || 'data',
    fields: [],
    views: [],
    forms: [],
    createdAt: now,
    updatedAt: now,
  };

  apps.push(newApp);
  saveApps(apps);

  return newApp;
}

// Update an existing app
export function updateApp(id: string, updates: Partial<AppSchema>): AppSchema | null {
  const apps = getApps();
  const index = apps.findIndex((app) => app.id === id);

  if (index === -1) return null;

  const updatedApp: AppSchema = {
    ...apps[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  apps[index] = updatedApp;
  saveApps(apps);

  return updatedApp;
}

// Delete an app
export function deleteApp(id: string): boolean {
  const apps = getApps();
  const filteredApps = apps.filter((app) => app.id !== id);

  if (filteredApps.length === apps.length) return false;

  saveApps(filteredApps);
  return true;
}

// Check if an app name already exists
export function isAppNameTaken(name: string, excludeId?: string): boolean {
  const apps = getApps();
  return apps.some(
    (app) =>
      app.name.toLowerCase() === name.toLowerCase() && app.id !== excludeId
  );
}
