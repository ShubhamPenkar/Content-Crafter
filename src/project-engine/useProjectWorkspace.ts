import { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  JodoCoProject,
  JodoCoAsset,
  ProjectSaveStatus,
  WorkspaceTab,
  PROJECT_SCHEMA_VERSION,
  CONTENT_MODEL_VERSION,
} from './types';
import { loadProjectsFromStorage, saveProjectsToStorage } from './storage';
import { createBlankProject, createDefaultProject } from './defaults';
import { ReelProject } from '../types';
import { CarouselProject } from '../carousel-engine/types';
import { JodoCoGeneratedContent } from '../content-engine/types';
import { mapGeneratedContentToReelProject } from '../content-engine';
import { mapGeneratedContentToCarouselProject } from '../carousel-engine/bridge';

export interface UseProjectWorkspaceReturn {
  projects: JodoCoProject[];
  activeProject: JodoCoProject;
  activeProjectId: string;
  activeTab: WorkspaceTab;
  setActiveTab: (tab: WorkspaceTab) => void;
  saveStatus: ProjectSaveStatus;
  updateActiveProject: (
    updater: Partial<JodoCoProject> | ((prev: JodoCoProject) => JodoCoProject)
  ) => void;
  updateReelProject: (reelProject: ReelProject) => void;
  updateCarouselProject: (carouselProject: CarouselProject) => void;
  updateGeneratedContent: (
    content: JodoCoGeneratedContent | null,
    topic?: string,
    script?: string
  ) => void;
  addAsset: (asset: JodoCoAsset) => void;
  updateAsset: (assetId: string, patch: Partial<JodoCoAsset>) => void;
  updateAssetStatus: (
    assetId: string,
    status: 'reviewing' | 'approved' | 'rejected' | 'archived'
  ) => void;
  approveAsset: (assetId: string) => void;
  rejectAsset: (assetId: string) => void;
  archiveAsset: (assetId: string) => void;
  addGeneratedVisualAsset: (
    assetData: Partial<JodoCoAsset> & {
      sceneId: number;
      url: string;
      name?: string;
    }
  ) => JodoCoAsset;
  useAssetInScene: (assetId: string, sceneId: number) => void;
  detachAssetFromScene: (sceneId: number) => void;
  useAssetInCarouselSlide: (assetId: string, slideId: string) => void;
  detachAssetFromCarouselSlide: (slideId: string) => void;
  addGeneratedCarouselAsset: (
    assetData: Partial<JodoCoAsset> & {
      slideNumber: number;
      slideId: string;
      url: string;
      name?: string;
    }
  ) => JodoCoAsset;
  removeAsset: (assetId: string) => void;
  createNewProject: (name?: string, topic?: string) => JodoCoProject;
  switchProject: (projectId: string) => void;
  renameProject: (projectId: string, newName: string) => void;
  duplicateProject: (projectId: string) => JodoCoProject;
  deleteProject: (projectId: string) => void;
  buildReelFromContent: (overrideProject?: ReelProject) => void;
  buildCarouselFromContent: (overrideCarousel?: CarouselProject) => void;
  forceSaveNow: () => void;
}

export function useProjectWorkspace(): UseProjectWorkspaceReturn {
  // Load initial projects and active ID
  const [projects, setProjects] = useState<JodoCoProject[]>(() => {
    const { projects } = loadProjectsFromStorage();
    return projects;
  });

  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    const { activeId } = loadProjectsFromStorage();
    return activeId;
  });

  const [activeTab, setActiveTab] = useState<WorkspaceTab>('reel');
  const [saveStatus, setSaveStatus] = useState<ProjectSaveStatus>('saved');

  // Debounced auto-save timer ref
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Active project lookup with fallback
  const activeProject =
    projects.find((p) => p.id === activeProjectId) ||
    projects[0] ||
    createDefaultProject();

  // Trigger debounced auto-save whenever projects change
  useEffect(() => {
    setSaveStatus('unsaved');

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      setSaveStatus('saving');
      saveProjectsToStorage(projects, activeProjectId);
      setTimeout(() => {
        setSaveStatus('saved');
      }, 300);
    }, 600);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [projects, activeProjectId]);

  const forceSaveNow = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    setSaveStatus('saving');
    saveProjectsToStorage(projects, activeProjectId);
    setTimeout(() => {
      setSaveStatus('saved');
    }, 200);
  }, [projects, activeProjectId]);

  const updateActiveProject = useCallback(
    (updater: Partial<JodoCoProject> | ((prev: JodoCoProject) => JodoCoProject)) => {
      setProjects((prevProjects) => {
        return prevProjects.map((p) => {
          if (p.id !== activeProjectId) return p;

          const updated =
            typeof updater === 'function' ? updater(p) : { ...p, ...updater };

          return {
            ...updated,
            updatedAt: new Date().toISOString(),
          };
        });
      });
    },
    [activeProjectId]
  );

  const updateReelProject = useCallback(
    (reelProject: ReelProject) => {
      updateActiveProject((prev) => ({
        ...prev,
        reelProject,
      }));
    },
    [updateActiveProject]
  );

  const updateCarouselProject = useCallback(
    (carouselProject: CarouselProject) => {
      updateActiveProject((prev) => ({
        ...prev,
        carouselProject,
      }));
    },
    [updateActiveProject]
  );

  const updateGeneratedContent = useCallback(
    (
      content: JodoCoGeneratedContent | null,
      topic?: string,
      script?: string
    ) => {
      updateActiveProject((prev) => ({
        ...prev,
        generatedContent: content,
        topic: topic !== undefined ? topic : prev.topic,
        originalScript: script !== undefined ? script : prev.originalScript,
      }));
    },
    [updateActiveProject]
  );

  const addAsset = useCallback(
    (asset: JodoCoAsset) => {
      updateActiveProject((prev) => ({
        ...prev,
        assets: [asset, ...prev.assets],
      }));
    },
    [updateActiveProject]
  );

  const updateAsset = useCallback(
    (assetId: string, patch: Partial<JodoCoAsset>) => {
      updateActiveProject((prev) => ({
        ...prev,
        assets: prev.assets.map((a) =>
          a.id === assetId
            ? { ...a, ...patch, updatedAt: new Date().toISOString() }
            : a
        ),
      }));
    },
    [updateActiveProject]
  );

  const updateAssetStatus = useCallback(
    (
      assetId: string,
      status: 'reviewing' | 'approved' | 'rejected' | 'archived'
    ) => {
      updateActiveProject((prev) => {
        const updatedAssets = prev.assets.map((a) =>
          a.id === assetId
            ? { ...a, status, updatedAt: new Date().toISOString() }
            : a
        );

        return {
          ...prev,
          assets: updatedAssets,
        };
      });
    },
    [updateActiveProject]
  );

  const approveAsset = useCallback(
    (assetId: string) => {
      updateAssetStatus(assetId, 'approved');
    },
    [updateAssetStatus]
  );

  const rejectAsset = useCallback(
    (assetId: string) => {
      updateAssetStatus(assetId, 'rejected');
    },
    [updateAssetStatus]
  );

  const archiveAsset = useCallback(
    (assetId: string) => {
      updateAssetStatus(assetId, 'archived');
    },
    [updateAssetStatus]
  );

  /**
   * Generates a new version for a scene's visual asset, preserving previous versions.
   */
  const addGeneratedVisualAsset = useCallback(
    (
      assetData: Partial<JodoCoAsset> & {
        sceneId: number;
        url: string;
        name?: string;
      }
    ): JodoCoAsset => {
      const sceneId = assetData.sceneId;
      const timestamp = new Date().toISOString();

      // Find all existing versions for this scene to compute next version number
      const sceneAssets = activeProject.assets.filter(
        (a) => a.sceneId === sceneId
      );
      const maxVer = sceneAssets.reduce(
        (max, a) => Math.max(max, typeof a.version === 'number' ? a.version : 1),
        0
      );
      const nextVersion = maxVer + 1;

      const newAssetId =
        assetData.id ||
        `asset-veo-scene-${sceneId}-v${nextVersion}-${Date.now()}`;

      const createdAsset: JodoCoAsset = {
        id: newAssetId,
        assetId: newAssetId,
        projectId: activeProject.id,
        sceneId,
        name:
          assetData.name ||
          `Scene ${sceneId} AI Visual v${nextVersion}.mp4`,
        type: 'video',
        mimeType: 'video/mp4',
        url: assetData.url,
        version: nextVersion,
        status: 'reviewing',
        dimensions: assetData.dimensions || { width: 720, height: 1280 },
        duration: assetData.duration || 4.0,
        createdAt: timestamp,
        updatedAt: timestamp,
        source: assetData.source || 'veo-ai',
        generationModel: assetData.generationModel || 'veo-3.1-generate-preview',
        prompt: assetData.prompt || assetData.sourcePrompt || '',
        sourcePrompt: assetData.prompt || assetData.sourcePrompt || '',
        tags: ['ai-visual', `scene-${sceneId}`, `v${nextVersion}`],
        notes: `Generated for Scene ${sceneId} (Version ${nextVersion})`,
        visualDecision: assetData.visualDecision || 'ai_video',
        visualPriority: assetData.visualPriority || 'high',
        visualPrompt: assetData.visualPrompt || assetData.prompt || '',
        visualReason: assetData.visualReason || '',
        replacesAssetId: assetData.replacesAssetId,
      };

      // Add to project assets and automatically bind to the reel scene
      updateActiveProject((prev) => {
        const updatedScenes = prev.reelProject.scenes.map((s) => {
          if (s.id === sceneId) {
            return {
              ...s,
              videoAssetId: newAssetId,
              visualAssetId: newAssetId,
              videoUrl: assetData.url,
              visualStatus: 'ready' as const,
              visualPrompt: createdAsset.prompt,
              visualReason: createdAsset.visualReason,
            };
          }
          return s;
        });

        return {
          ...prev,
          assets: [createdAsset, ...prev.assets],
          reelProject: {
            ...prev.reelProject,
            scenes: updatedScenes,
          },
        };
      });

      return createdAsset;
    },
    [activeProject.assets, activeProject.id, updateActiveProject]
  );

  const useAssetInScene = useCallback(
    (assetId: string, sceneId: number) => {
      const targetAsset = activeProject.assets.find((a) => a.id === assetId);
      if (!targetAsset) return;

      updateActiveProject((prev) => {
        const updatedScenes = prev.reelProject.scenes.map((s) => {
          if (s.id === sceneId) {
            return {
              ...s,
              videoAssetId: targetAsset.id,
              visualAssetId: targetAsset.id,
              videoUrl: targetAsset.url,
              visualStatus: 'ready' as const,
              visualPrompt: targetAsset.prompt || s.visualPrompt,
              visualReason: targetAsset.visualReason || s.visualReason,
            };
          }
          return s;
        });

        return {
          ...prev,
          reelProject: {
            ...prev.reelProject,
            scenes: updatedScenes,
          },
        };
      });
    },
    [activeProject.assets, updateActiveProject]
  );

  const detachAssetFromScene = useCallback(
    (sceneId: number) => {
      updateActiveProject((prev) => {
        const updatedScenes = prev.reelProject.scenes.map((s) => {
          if (s.id === sceneId) {
            return {
              ...s,
              videoAssetId: undefined,
              visualAssetId: undefined,
              videoUrl: undefined,
              visualStatus: 'idle' as const,
            };
          }
          return s;
        });

        return {
          ...prev,
          reelProject: {
            ...prev.reelProject,
            scenes: updatedScenes,
          },
        };
      });
    },
    [updateActiveProject]
  );

  const useAssetInCarouselSlide = useCallback(
    (assetId: string, slideId: string) => {
      const targetAsset = activeProject.assets.find((a) => a.id === assetId);
      if (!targetAsset) return;

      updateActiveProject((prev) => {
        const updatedSlides = prev.carouselProject.slides.map((s) => {
          if (s.id === slideId || String(s.slideNumber) === slideId) {
            return {
              ...s,
              visualAssetId: targetAsset.id,
              visualUrl: targetAsset.url,
              visualAssetType: (targetAsset.type === 'video' ? 'video' : 'image') as any,
              visualPrompt: targetAsset.sourcePrompt || targetAsset.prompt || s.visualPrompt,
              visualVersion: targetAsset.version || 1,
            };
          }
          return s;
        });

        return {
          ...prev,
          carouselProject: {
            ...prev.carouselProject,
            slides: updatedSlides,
          },
        };
      });
    },
    [activeProject.assets, updateActiveProject]
  );

  const detachAssetFromCarouselSlide = useCallback(
    (slideId: string) => {
      updateActiveProject((prev) => {
        const updatedSlides = prev.carouselProject.slides.map((s) => {
          if (s.id === slideId || String(s.slideNumber) === slideId) {
            return {
              ...s,
              visualAssetId: undefined,
              visualUrl: undefined,
              visualAssetType: undefined,
            };
          }
          return s;
        });

        return {
          ...prev,
          carouselProject: {
            ...prev.carouselProject,
            slides: updatedSlides,
          },
        };
      });
    },
    [updateActiveProject]
  );

  const addGeneratedCarouselAsset = useCallback(
    (
      assetData: Partial<JodoCoAsset> & {
        slideNumber: number;
        slideId: string;
        url: string;
        name?: string;
      }
    ): JodoCoAsset => {
      const slideNumber = assetData.slideNumber;
      const timestamp = new Date().toISOString();

      const slideAssets = activeProject.assets.filter(
        (a) => a.carouselSlideId === slideNumber
      );
      const maxVer = slideAssets.reduce(
        (max, a) => Math.max(max, typeof a.version === 'number' ? a.version : 1),
        0
      );
      const nextVersion = maxVer + 1;

      const newAssetId =
        assetData.id ||
        `asset-carousel-slide-${slideNumber}-v${nextVersion}-${Date.now()}`;

      const createdAsset: JodoCoAsset = {
        id: newAssetId,
        assetId: newAssetId,
        projectId: activeProject.id,
        carouselSlideId: slideNumber,
        name:
          assetData.name ||
          `Slide ${slideNumber} 4:5 Visual v${nextVersion}.png`,
        type: 'image',
        mimeType: 'image/png',
        url: assetData.url,
        version: nextVersion,
        status: 'reviewing',
        dimensions: assetData.dimensions || { width: 1080, height: 1350 },
        createdAt: timestamp,
        updatedAt: timestamp,
        source: assetData.source || 'imagen-ai',
        generationModel: assetData.generationModel || 'imagen-3.0-generate-002',
        prompt: assetData.prompt || assetData.sourcePrompt || '',
        sourcePrompt: assetData.prompt || assetData.sourcePrompt || '',
        tags: ['ai-visual', 'carousel', `slide-${slideNumber}`, `v${nextVersion}`, '4:5'],
        notes: `Generated for Carousel Slide ${slideNumber} (Version ${nextVersion})`,
        targetMedium: 'carousel',
        aspectRatio: '4:5',
        visualDecision: assetData.visualDecision || 'ai_image',
        visualPriority: assetData.visualPriority || 'high',
        visualPrompt: assetData.visualPrompt || assetData.prompt || '',
        visualReason: assetData.visualReason || '',
        replacesAssetId: assetData.replacesAssetId,
      };

      updateActiveProject((prev) => {
        const updatedSlides = prev.carouselProject.slides.map((s) => {
          if (s.id === assetData.slideId || s.slideNumber === slideNumber) {
            return {
              ...s,
              visualAssetId: newAssetId,
              visualUrl: assetData.url,
              visualAssetType: 'image' as const,
              visualPrompt: createdAsset.prompt,
              visualReason: createdAsset.visualReason,
              visualVersion: nextVersion,
            };
          }
          return s;
        });

        return {
          ...prev,
          assets: [createdAsset, ...prev.assets],
          carouselProject: {
            ...prev.carouselProject,
            slides: updatedSlides,
          },
        };
      });

      return createdAsset;
    },
    [activeProject.assets, activeProject.id, updateActiveProject]
  );

  const removeAsset = useCallback(
    (assetId: string) => {
      updateActiveProject((prev) => ({
        ...prev,
        assets: prev.assets.filter((a) => a.id !== assetId),
      }));
    },
    [updateActiveProject]
  );

  const createNewProject = useCallback(
    (name?: string, topic?: string): JodoCoProject => {
      const newProj = createBlankProject(name || 'Untitled Project');
      if (topic) {
        newProj.topic = topic;
      }
      setProjects((prev) => [newProj, ...prev]);
      setActiveProjectId(newProj.id);
      setActiveTab('content');

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.4 },
        colors: ['#FF8C73', '#B8A7EA', '#8FE3C0'],
      });

      return newProj;
    },
    []
  );

  const switchProject = useCallback((projectId: string) => {
    setActiveProjectId(projectId);
  }, []);

  const renameProject = useCallback((projectId: string, newName: string) => {
    if (!newName.trim()) return;
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, name: newName.trim(), updatedAt: new Date().toISOString() }
          : p
      )
    );
  }, []);

  const duplicateProject = useCallback(
    (projectId: string): JodoCoProject => {
      const target = projects.find((p) => p.id === projectId) || activeProject;
      const timestamp = new Date().toISOString();
      const duplicate: JodoCoProject = {
        ...JSON.parse(JSON.stringify(target)),
        id: `project-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: `${target.name} (Copy)`,
        createdAt: timestamp,
        updatedAt: timestamp,
        schemaVersion: PROJECT_SCHEMA_VERSION,
        contentModelVersion: CONTENT_MODEL_VERSION,
      };

      setProjects((prev) => [duplicate, ...prev]);
      setActiveProjectId(duplicate.id);

      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.5 },
      });

      return duplicate;
    },
    [projects, activeProject]
  );

  const deleteProject = useCallback(
    (projectId: string) => {
      setProjects((prev) => {
        const remaining = prev.filter((p) => p.id !== projectId);
        if (remaining.length === 0) {
          const fresh = createDefaultProject();
          setActiveProjectId(fresh.id);
          return [fresh];
        }

        if (activeProjectId === projectId) {
          setActiveProjectId(remaining[0].id);
        }
        return remaining;
      });
    },
    [activeProjectId]
  );

  // Build Reel from active project's generated content
  const buildReelFromContent = useCallback(
    (overrideProject?: ReelProject) => {
      if (overrideProject) {
        updateReelProject(overrideProject);
        setActiveTab('reel');
        return;
      }
      if (!activeProject.generatedContent) return;
      try {
        const newReel = mapGeneratedContentToReelProject(activeProject.generatedContent);
        updateReelProject(newReel);
        setActiveTab('reel');

        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.5 },
          colors: ['#FF8C73', '#B8A7EA', '#8FE3C0', '#1A2B48'],
        });
      } catch (err) {
        console.error('Failed to map generated content to Reel:', err);
      }
    },
    [activeProject.generatedContent, updateReelProject]
  );

  // Build Carousel from active project's generated content
  const buildCarouselFromContent = useCallback(
    (overrideCarousel?: CarouselProject) => {
      if (overrideCarousel) {
        updateCarouselProject(overrideCarousel);
        setActiveTab('carousel');
        return;
      }
      if (!activeProject.generatedContent) return;
      try {
        const newCarousel = mapGeneratedContentToCarouselProject(activeProject.generatedContent);
        updateCarouselProject(newCarousel);
        setActiveTab('carousel');

        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.5 },
          colors: ['#B8A7EA', '#8FE3C0', '#FF8C73', '#1A2B48'],
        });
      } catch (err) {
        console.error('Failed to map generated content to Carousel:', err);
      }
    },
    [activeProject.generatedContent, updateCarouselProject]
  );

  return {
    projects,
    activeProject,
    activeProjectId: activeProject.id,
    activeTab,
    setActiveTab,
    saveStatus,
    updateActiveProject,
    updateReelProject,
    updateCarouselProject,
    updateGeneratedContent,
    addAsset,
    updateAsset,
    updateAssetStatus,
    approveAsset,
    rejectAsset,
    archiveAsset,
    addGeneratedVisualAsset,
    useAssetInScene,
    detachAssetFromScene,
    useAssetInCarouselSlide,
    detachAssetFromCarouselSlide,
    addGeneratedCarouselAsset,
    removeAsset,
    createNewProject,
    switchProject,
    renameProject,
    duplicateProject,
    deleteProject,
    buildReelFromContent,
    buildCarouselFromContent,
    forceSaveNow,
  };
}
