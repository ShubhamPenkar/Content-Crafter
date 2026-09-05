import { JodoCoProject, PROJECT_SCHEMA_VERSION, CONTENT_MODEL_VERSION } from './types';
import { createDefaultProject, STARTER_ASSETS } from './defaults';
import { DEFAULT_REEL_PROJECT } from '../data/storyboardData';
import { KNOWN_CAROUSEL_FIXTURE } from '../carousel-engine/fixture';
import { KNOWN_JODOCO_FIXTURE } from '../content-engine/fixture';

export const WORKSPACE_STORAGE_KEYS = {
  PROJECTS_LIST: 'jodoco_workspace_projects_v1',
  ACTIVE_PROJECT_ID: 'jodoco_active_project_id_v1',
  LEGACY_REEL: 'jodoco_active_reel_project_v1',
  LEGACY_CAROUSEL: 'jodoco_active_carousel_project_v1',
  LEGACY_CONTENT_ENGINE: 'jodoco_content_engine_state_v1',
};

/**
 * Migrates any previous standalone localStorage items into a unified JodoCo project.
 */
function migrateLegacyData(): JodoCoProject | null {
  try {
    const legacyReelRaw = localStorage.getItem(WORKSPACE_STORAGE_KEYS.LEGACY_REEL);
    const legacyCarouselRaw = localStorage.getItem(WORKSPACE_STORAGE_KEYS.LEGACY_CAROUSEL);
    const legacyContentRaw = localStorage.getItem(WORKSPACE_STORAGE_KEYS.LEGACY_CONTENT_ENGINE);

    if (!legacyReelRaw && !legacyCarouselRaw && !legacyContentRaw) {
      return null;
    }

    const reel = legacyReelRaw ? JSON.parse(legacyReelRaw) : DEFAULT_REEL_PROJECT;
    const carousel = legacyCarouselRaw ? JSON.parse(legacyCarouselRaw) : KNOWN_CAROUSEL_FIXTURE;
    
    let content = KNOWN_JODOCO_FIXTURE;
    let topic = 'Why Modern Brands Are Shifting From Banner Ads to Creator Partnerships';
    let script = 'Direct banner ads suffer from extreme audience fatigue and rising CPMs. When brands partner with high-trust niche creators who already have organic rapport, audience engagement jumps 4x.';

    if (legacyContentRaw) {
      const parsedContent = JSON.parse(legacyContentRaw);
      if (parsedContent.content) content = parsedContent.content;
      if (parsedContent.topic) topic = parsedContent.topic;
      if (parsedContent.rawScript) script = parsedContent.rawScript;
    }

    const timestamp = new Date().toISOString();
    return {
      id: `project-migrated-${Date.now()}`,
      name: 'Cold Ads vs Creator Trust Campaign',
      topic,
      originalScript: script,
      generatedContent: content,
      reelProject: reel,
      carouselProject: carousel,
      assets: [...STARTER_ASSETS],
      projectStatus: 'in_production',
      createdAt: timestamp,
      updatedAt: timestamp,
      schemaVersion: PROJECT_SCHEMA_VERSION,
      contentModelVersion: CONTENT_MODEL_VERSION,
    };
  } catch (err) {
    console.warn('Could not migrate legacy workspace data:', err);
    return null;
  }
}

/**
 * Loads all projects from localStorage with graceful fallback.
 */
export function loadProjectsFromStorage(): { projects: JodoCoProject[]; activeId: string } {
  try {
    const rawProjects = localStorage.getItem(WORKSPACE_STORAGE_KEYS.PROJECTS_LIST);
    const rawActiveId = localStorage.getItem(WORKSPACE_STORAGE_KEYS.ACTIVE_PROJECT_ID);

    if (rawProjects) {
      const parsed = JSON.parse(rawProjects);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Validate and apply schema version upgrades if necessary
        const validProjects: JodoCoProject[] = parsed.map((p) => ({
          ...p,
          schemaVersion: p.schemaVersion || PROJECT_SCHEMA_VERSION,
          contentModelVersion: p.contentModelVersion || CONTENT_MODEL_VERSION,
          assets: (Array.isArray(p.assets) ? p.assets : [...STARTER_ASSETS]).map((a: any, idx: number) => ({
            ...a,
            id: a.id || a.assetId || `asset-${Date.now()}-${idx}`,
            version: typeof a.version === 'number' ? a.version : 1,
            status: a.status || (a.type === 'logo' || a.type === 'audio' ? 'approved' : 'reviewing'),
            source: a.source || (a.tags?.includes('ai-visual') ? 'veo-ai' : 'upload'),
            createdAt: a.createdAt || new Date().toISOString(),
          })),
        }));

        let activeId = rawActiveId || validProjects[0].id;
        if (!validProjects.some((p) => p.id === activeId)) {
          activeId = validProjects[0].id;
        }

        return { projects: validProjects, activeId };
      }
    }

    // Try migration from legacy individual keys
    const migrated = migrateLegacyData();
    if (migrated) {
      const initialProjects = [migrated];
      saveProjectsToStorage(initialProjects, migrated.id);
      return { projects: initialProjects, activeId: migrated.id };
    }

    // Otherwise, create fresh default project
    const defaultProj = createDefaultProject();
    const initialProjects = [defaultProj];
    saveProjectsToStorage(initialProjects, defaultProj.id);
    return { projects: initialProjects, activeId: defaultProj.id };
  } catch (error) {
    console.error('Failed to load projects from storage, creating fresh default:', error);
    const fallback = createDefaultProject();
    return { projects: [fallback], activeId: fallback.id };
  }
}

/**
 * Saves projects and active project ID to localStorage.
 */
export function saveProjectsToStorage(projects: JodoCoProject[], activeId: string): void {
  try {
    localStorage.setItem(WORKSPACE_STORAGE_KEYS.PROJECTS_LIST, JSON.stringify(projects));
    localStorage.setItem(WORKSPACE_STORAGE_KEYS.ACTIVE_PROJECT_ID, activeId);
  } catch (error) {
    console.error('Failed to save projects to storage:', error);
  }
}
