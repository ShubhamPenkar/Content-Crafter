import React, { useState } from 'react';
import { SceneInfo, ReelProject } from '../types';
import { JodoCoAsset } from '../project-engine/types';
import {
  Play,
  Sparkles,
  MessageSquare,
  Monitor,
  Edit3,
  Check,
  X,
  RotateCcw,
  Video,
  Film,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { SceneVisualGeneratorModal } from './SceneVisualGeneratorModal';

interface StoryboardViewProps {
  project?: ReelProject;
  currentTime: number;
  topic?: string;
  projectAssets?: JodoCoAsset[];
  onSelectScene: (startTime: number) => void;
  onUpdateScene?: (scene: SceneInfo) => void;
  onResetProject?: () => void;
  onAddAsset?: (asset: JodoCoAsset) => void;
  onApproveAsset?: (assetId: string) => void;
  onRejectAsset?: (assetId: string) => void;
}

export const StoryboardView: React.FC<StoryboardViewProps> = ({
  project,
  currentTime,
  topic,
  projectAssets = [],
  onSelectScene,
  onUpdateScene,
  onResetProject,
  onAddAsset,
  onApproveAsset,
  onRejectAsset,
}) => {
  const scenes = project?.scenes || [];
  const [editingScene, setEditingScene] = useState<SceneInfo | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [editVoiceover, setEditVoiceover] = useState<string>('');
  const [editKeyVisual, setEditKeyVisual] = useState<string>('');
  const [visualGeneratorScene, setVisualGeneratorScene] = useState<SceneInfo | null>(null);

  const handleOpenEdit = (scene: SceneInfo) => {
    setEditingScene(scene);
    setEditText(scene.onScreenText.join(' | '));
    setEditVoiceover(scene.voiceover);
    setEditKeyVisual(scene.keyVisual);
  };

  const handleSaveEdit = () => {
    if (!editingScene || !onUpdateScene) return;
    const updated: SceneInfo = {
      ...editingScene,
      onScreenText: editText.split('|').map((s) => s.trim()).filter(Boolean),
      voiceover: editVoiceover.trim(),
      keyVisual: editKeyVisual.trim(),
    };
    onUpdateScene(updated);
    setEditingScene(null);
  };

  const handleAttachVisual = (
    sceneId: number,
    asset: JodoCoAsset,
    videoUrl: string,
    prompt: string
  ) => {
    if (!onUpdateScene) return;
    const target = scenes.find((s) => s.id === sceneId);
    if (!target) return;

    const updated: SceneInfo = {
      ...target,
      videoAssetId: asset.id,
      videoUrl: videoUrl,
      visualPrompt: prompt,
      visualStatus: 'ready',
    };
    onUpdateScene(updated);
  };

  const handleDetachVisual = (sceneId: number) => {
    if (!onUpdateScene) return;
    const target = scenes.find((s) => s.id === sceneId);
    if (!target) return;

    const updated: SceneInfo = {
      ...target,
      videoAssetId: undefined,
      videoUrl: undefined,
      visualStatus: 'idle',
    };
    onUpdateScene(updated);
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#EAE6DF] p-4 rounded-2xl shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFB3A7]/30 text-[#1A2B48] text-[10px] font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3 text-[#FF8C73]" />
            Script Architecture & AI Visuals
          </div>
          <h3 className="text-lg font-bold text-[#1A2B48] flex items-center gap-2 font-heading">
            Complete Storyboard Breakdown & Script
          </h3>
          <p className="text-xs text-[#1A2B48]/70 mt-0.5">
            25-second educational Instagram Reel. Generate AI Visuals with Veo 3.1 or edit narrative beats directly.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {onResetProject && (
            <button
              onClick={onResetProject}
              className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#F0EAE1] text-[#1A2B48] font-bold border border-[#E0D9CB] flex items-center gap-1 cursor-pointer transition-colors"
              title="Reset project to default"
            >
              <RotateCcw className="w-3 h-3 text-[#64748B]" />
              Reset
            </button>
          )}
          <span className="px-2.5 py-1 rounded-lg bg-[#FFB3A7]/30 text-[#1A2B48] font-bold border border-[#FFB3A7]/50">
            7 Sequential Beats
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-[#D1F2EB] text-[#1A2B48] font-bold border border-[#B3E5DB]">
            Veo 3.1 Ready
          </span>
        </div>
      </div>

      {/* Edit Scene Modal */}
      {editingScene && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-[#EAE6DF] space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-3">
              <div className="flex items-center gap-2">
                <span
                  className="w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs text-[#1A2B48]"
                  style={{ backgroundColor: editingScene.colorTheme.accent }}
                >
                  0{editingScene.id}
                </span>
                <h4 className="font-bold text-[#1A2B48] font-heading">
                  Edit Scene {editingScene.id}: {editingScene.name}
                </h4>
              </div>
              <button
                onClick={() => setEditingScene(null)}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#1A2B48] mb-1">
                  On-Screen Typography (separate phrases with |)
                </label>
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-[#EAE6DF] p-2.5 text-xs text-[#1A2B48] focus:border-[#FF8C73] focus:ring-1 focus:ring-[#FF8C73] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1A2B48] mb-1">
                  Voiceover Delivery
                </label>
                <textarea
                  value={editVoiceover}
                  onChange={(e) => setEditVoiceover(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-[#EAE6DF] p-2.5 text-xs text-[#1A2B48] focus:border-[#FF8C73] focus:ring-1 focus:ring-[#FF8C73] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1A2B48] mb-1">
                  Key Visual Direction
                </label>
                <textarea
                  value={editKeyVisual}
                  onChange={(e) => setEditKeyVisual(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-[#EAE6DF] p-2.5 text-xs text-[#1A2B48] focus:border-[#FF8C73] focus:ring-1 focus:ring-[#FF8C73] outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#EAE6DF]">
              <button
                onClick={() => {
                  setEditingScene(null);
                  setVisualGeneratorScene(editingScene);
                }}
                className="px-3 py-1.5 rounded-xl border border-[#8FE3C0] bg-[#8FE3C0]/15 text-[#1A2B48] text-xs font-bold flex items-center gap-1.5 hover:bg-[#8FE3C0]/25 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FF8C73]" />
                <span>Open AI Visual Generator</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingScene(null)}
                  className="px-3.5 py-1.5 rounded-xl border border-[#EAE6DF] text-[#1A2B48]/70 text-xs font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 rounded-xl bg-[#1A2B48] hover:bg-[#253A5E] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Check className="w-3.5 h-3.5 text-[#8FE3C0]" />
                  Save & Update Reel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Veo AI Visual Generator Modal */}
      {visualGeneratorScene && (
        <SceneVisualGeneratorModal
          scene={visualGeneratorScene}
          topic={topic}
          isOpen={Boolean(visualGeneratorScene)}
          onClose={() => setVisualGeneratorScene(null)}
          onAttachVisual={handleAttachVisual}
          onDetachVisual={handleDetachVisual}
          onAddAsset={onAddAsset}
          projectAssets={projectAssets}
        />
      )}

      {/* Storyboard Scene Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scenes.map((scene) => {
          const isCurrent = currentTime >= scene.startTime && currentTime < scene.endTime;
          const hasVisual = Boolean(scene.videoUrl);
          const attachedAsset = projectAssets.find(
            (a) => a.id === scene.videoAssetId || a.id === scene.visualAssetId
          );
          const assetStatus = attachedAsset?.status || 'approved';
          const assetVersion = attachedAsset?.version || 1;

          return (
            <div
              key={scene.id}
              className={`rounded-2xl p-4 transition-all border flex flex-col justify-between space-y-4 shadow-xs ${
                isCurrent
                  ? 'bg-white border-[#1A2B48] ring-2 ring-[#FFB3A7] shadow-md'
                  : 'bg-white border-[#EAE6DF] hover:border-[#D5CFC3]'
              }`}
            >
              {/* Scene Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs text-[#1A2B48] shadow-2xs"
                    style={{ backgroundColor: scene.colorTheme.accent }}
                  >
                    0{scene.id}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-[#1A2B48] font-heading">{scene.name}</h4>
                    <span className="text-[11px] font-mono text-[#1A2B48]/60">{scene.subtitle}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(scene)}
                    className="px-2 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#1A2B48] hover:text-white text-[#1A2B48] text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer border border-[#E0D9CB] shadow-2xs"
                    title="Edit Scene Content"
                  >
                    <Edit3 className="w-3 h-3 text-[#FF8C73]" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => onSelectScene(scene.startTime)}
                    className="px-2.5 py-1 rounded-lg bg-[#F4EFE6] hover:bg-[#1A2B48] hover:text-white text-[#1A2B48] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-[#E0D9CB] shadow-2xs"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Preview</span>
                  </button>
                </div>
              </div>

              {/* On-Screen Text & Visual Concept */}
              <div className="space-y-2.5 bg-[#FAF8F5] p-3 rounded-xl border border-[#EAE6DF] text-xs">
                <div>
                  <span className="text-[10px] font-bold text-[#1A2B48]/70 uppercase tracking-wider flex items-center gap-1 mb-1">
                    <Monitor className="w-3 h-3 text-[#1A2B48]" /> On-Screen Typography
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {scene.onScreenText.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-white text-[#1A2B48] border border-[#EAE6DF] font-semibold shadow-2xs"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#1A2B48]/70 uppercase tracking-wider flex items-center gap-1 mb-1">
                    <Sparkles className="w-3 h-3 text-[#FF8C73]" /> Visual Motion Direction
                  </span>
                  <p className="text-[#1A2B48]/80 text-[11px] leading-relaxed">{scene.keyVisual}</p>
                </div>
              </div>

              {/* Voiceover Snippet */}
              <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#EAE6DF] flex items-start gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-[#FF8C73] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-[#1A2B48] block uppercase tracking-wider">
                    Voiceover Delivery
                  </span>
                  <p className="text-xs text-[#1A2B48]/85 italic mt-0.5">"{scene.voiceover}"</p>
                </div>
              </div>

              {/* AI Visual Status Bar & Trigger */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                {hasVisual ? (
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Status Pill */}
                    {assetStatus === 'approved' ? (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>v{assetVersion} Approved</span>
                      </div>
                    ) : assetStatus === 'rejected' ? (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 font-bold text-[11px]">
                        <span>v{assetVersion} Rejected (Blocked)</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 font-bold text-[11px]">
                          <span>v{assetVersion} Reviewing</span>
                        </div>
                        {attachedAsset && onApproveAsset && (
                          <button
                            type="button"
                            onClick={() => onApproveAsset(attachedAsset.id)}
                            className="px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] cursor-pointer"
                          >
                            Approve
                          </button>
                        )}
                        {attachedAsset && onRejectAsset && (
                          <button
                            type="button"
                            onClick={() => onRejectAsset(attachedAsset.id)}
                            className="px-2 py-0.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px] border border-rose-200 cursor-pointer"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => handleDetachVisual(scene.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                      title="Detach AI Visual"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-400 font-medium">
                    Vector Graphic Fallback
                  </span>
                )}

                <button
                  onClick={() => setVisualGeneratorScene(scene)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    hasVisual
                      ? 'bg-slate-100 hover:bg-slate-200 text-[#1A2B48]'
                      : 'bg-linear-to-r from-[#1A2B48] to-[#253A5E] hover:from-[#253A5E] hover:to-[#1A2B48] text-white shadow-2xs'
                  }`}
                >
                  <Video className="w-3.5 h-3.5 text-[#8FE3C0]" />
                  <span>{hasVisual ? 'Change / Re-generate' : 'Generate AI Visual'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
