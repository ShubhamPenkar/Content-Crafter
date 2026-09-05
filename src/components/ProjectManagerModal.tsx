import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Copy,
  Trash2,
  Edit2,
  Check,
  X,
  Clock,
  Film,
  Layers,
  Sparkles,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { JodoCoProject } from '../project-engine/types';

interface ProjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: JodoCoProject[];
  activeProjectId: string;
  onSelectProject: (projectId: string) => void;
  onCreateProject: (name: string, topic?: string) => void;
  onRenameProject: (projectId: string, newName: string) => void;
  onDuplicateProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
}

export const ProjectManagerModal: React.FC<ProjectManagerModalProps> = ({
  isOpen,
  onClose,
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onRenameProject,
  onDuplicateProject,
  onDeleteProject,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectTopic, setNewProjectTopic] = useState('');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartCreate = () => {
    setIsCreating(true);
    setNewProjectName('New Brand Campaign');
    setNewProjectTopic('');
  };

  const handleConfirmCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    onCreateProject(newProjectName.trim(), newProjectTopic.trim() || undefined);
    setIsCreating(false);
    onClose();
  };

  const handleStartRename = (project: JodoCoProject) => {
    setEditingProjectId(project.id);
    setEditNameValue(project.name);
  };

  const handleSaveRename = (projectId: string) => {
    if (editNameValue.trim()) {
      onRenameProject(projectId, editNameValue.trim());
    }
    setEditingProjectId(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-[#1A2B48]/10 rounded-2xl max-w-3xl w-full shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1A2B48] text-white flex items-center justify-center font-bold shadow-xs">
              <FolderKanban className="w-5 h-5 text-[#8FE3C0]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#1A2B48] tracking-tight">
                Project Workspace Manager
              </h2>
              <p className="text-xs text-slate-500">
                {projects.length} Saved {projects.length === 1 ? 'Project' : 'Projects'} in local vault
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isCreating && (
              <button
                onClick={handleStartCreate}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1A2B48] hover:bg-[#1A2B48]/90 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#8FE3C0]" />
                <span>New Project</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Create New Project Inline Form */}
          {isCreating && (
            <form
              onSubmit={handleConfirmCreate}
              className="bg-slate-50 border-2 border-[#1A2B48]/20 rounded-2xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1A2B48] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF8C73]" />
                  Create New JodoCo Project
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g., Summer Brand Launch"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-[#1A2B48] focus:outline-none focus:ring-2 focus:ring-[#FF8C73]/50 focus:border-[#FF8C73]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Initial Topic / Angle (Optional)
                </label>
                <input
                  type="text"
                  value={newProjectTopic}
                  onChange={(e) => setNewProjectTopic(e.target.value)}
                  placeholder="e.g., Why B2B Brands Need Founder-Led Reels"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-[#1A2B48] focus:outline-none focus:ring-2 focus:ring-[#FF8C73]/50 focus:border-[#FF8C73]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#1A2B48] text-white text-xs font-bold shadow-xs hover:bg-[#1A2B48]/90 cursor-pointer"
                >
                  Create & Launch Workspace
                </button>
              </div>
            </form>
          )}

          {/* Projects List */}
          <div className="space-y-3">
            {projects.map((project) => {
              const isActive = project.id === activeProjectId;
              const isEditing = editingProjectId === project.id;
              const isConfirmingDelete = deleteConfirmId === project.id;

              return (
                <div
                  key={project.id}
                  className={`border rounded-2xl p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isActive
                      ? 'border-[#1A2B48] bg-slate-50/80 shadow-xs ring-1 ring-[#1A2B48]/10'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  {/* Left Project Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {isActive && (
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#1A2B48] text-white">
                          Active Workspace
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-slate-400">
                        v{project.schemaVersion || 1}
                      </span>
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          value={editNameValue}
                          onChange={(e) => setEditNameValue(e.target.value)}
                          className="px-2 py-1 border border-[#1A2B48] rounded-lg text-xs font-bold text-[#1A2B48] focus:outline-none"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(project.id);
                            if (e.key === 'Escape') setEditingProjectId(null);
                          }}
                        />
                        <button
                          onClick={() => handleSaveRename(project.id)}
                          className="p-1 rounded-md bg-[#1A2B48] text-white hover:bg-black"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingProjectId(null)}
                          className="p-1 rounded-md bg-slate-200 text-slate-600 hover:bg-slate-300"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-[#1A2B48] truncate">
                          {project.name}
                        </h3>
                        <button
                          onClick={() => handleStartRename(project)}
                          className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                          title="Rename Project"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {project.topic || 'No topic specified'}
                    </p>

                    {/* Stats & Metadata */}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 text-slate-600">
                        <Film className="w-3.5 h-3.5 text-[#FF8C73]" />
                        {project.reelProject?.scenes?.length || 0} Scenes
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-600">
                        <Layers className="w-3.5 h-3.5 text-[#B8A7EA]" />
                        {project.carouselProject?.slides?.length || 0} Slides
                      </span>
                      <span>•</span>
                      <span>{project.assets?.length || 0} Assets</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isConfirmingDelete ? (
                      <div className="flex items-center gap-1.5 bg-red-50 p-1.5 rounded-xl border border-red-200">
                        <span className="text-[11px] font-bold text-red-700">Delete?</span>
                        <button
                          onClick={() => {
                            onDeleteProject(project.id);
                            setDeleteConfirmId(null);
                          }}
                          className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[10px] font-bold"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => onDuplicateProject(project.id)}
                          className="p-2 text-slate-400 hover:text-[#1A2B48] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                          title="Duplicate Project"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteConfirmId(project.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                          title="Delete Project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        {isActive ? (
                          <button
                            onClick={onClose}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                          >
                            Current
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              onSelectProject(project.id);
                              onClose();
                            }}
                            className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#1A2B48] text-white text-xs font-bold hover:bg-[#1A2B48]/90 transition-all cursor-pointer"
                          >
                            <span>Open</span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#8FE3C0]" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>All projects persist automatically in your local browser workspace storage.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
