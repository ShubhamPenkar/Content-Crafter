import React, { useState, useRef } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Archive,
  Film,
  Sparkles,
  Info,
  Copy,
  Check,
  Tag,
  Maximize2,
  FileVideo,
  FileImage,
  Music2,
  AlertTriangle,
} from 'lucide-react';
import { JodoCoAsset, AssetLifecycleStatus } from '../project-engine/types';

export interface AssetPreviewProps {
  asset: JodoCoAsset;
  sceneName?: string;
  onApprove?: (assetId: string) => void;
  onReject?: (assetId: string) => void;
  onArchive?: (assetId: string) => void;
  onReplace?: (asset: JodoCoAsset) => void;
  onUseInScene?: (assetId: string, sceneId: number) => void;
  availableScenes?: Array<{ id: number; name: string }>;
  showActions?: boolean;
  compact?: boolean;
}

export const AssetPreview: React.FC<AssetPreviewProps> = ({
  asset,
  sceneName,
  onApprove,
  onReject,
  onArchive,
  onReplace,
  onUseInScene,
  availableScenes = [],
  showActions = true,
  compact = false,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [showPromptDetails, setShowPromptDetails] = useState(false);
  const [targetSceneId, setTargetSceneId] = useState<number>(asset.sceneId || 1);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleRestart = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play().catch(() => {});
    setIsPlaying(true);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const getStatusBadge = (status: AssetLifecycleStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Rejected
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold">
            <Archive className="w-3.5 h-3.5 text-slate-500" />
            Archived
          </span>
        );
      case 'reviewing':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-bold">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Reviewing
          </span>
        );
    }
  };

  const promptText = asset.prompt || asset.sourcePrompt || asset.visualPrompt || '';

  return (
    <div className={`bg-white border border-[#EAE6DF] rounded-2xl overflow-hidden shadow-xs flex flex-col ${compact ? 'p-3' : 'p-5'} text-[#1A2B48]`}>
      {/* Header Info */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {getStatusBadge(asset.status || 'reviewing')}
            <span className="px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#EAE6DF] font-mono font-black text-xs text-[#1A2B48]">
              v{asset.version || 1}
            </span>
            {asset.sceneId && (
              <span className="px-2 py-0.5 rounded-md bg-[#1A2B48]/5 text-[#1A2B48] text-xs font-semibold">
                Scene {asset.sceneId} {sceneName ? `• ${sceneName}` : ''}
              </span>
            )}
          </div>
          <h4 className="font-bold text-sm text-[#1A2B48] truncate font-heading mt-1" title={asset.name}>
            {asset.name}
          </h4>
        </div>

        <div className="text-right text-[11px] text-slate-500 shrink-0 font-mono">
          {new Date(asset.createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* Media Canvas / Player */}
      <div className="relative w-full rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center aspect-[9/16] max-h-96 border border-slate-800 shadow-inner group">
        {asset.type === 'video' ? (
          <>
            <video
              ref={videoRef}
              src={asset.url}
              loop
              playsInline
              muted={isMuted}
              className="w-full h-full object-cover"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />

            {/* Video Controls Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 pointer-events-none">
              <div className="flex items-center justify-between pointer-events-auto">
                <span className="px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-mono">
                  {asset.dimensions ? `${asset.dimensions.width}×${asset.dimensions.height}` : '720×1280'}
                </span>
                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white text-xs cursor-pointer transition-colors"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center justify-center pointer-events-auto">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-full bg-white/90 hover:bg-white text-[#1A2B48] flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between text-white text-[11px] font-mono pointer-events-auto">
                <span>{asset.duration ? `${asset.duration.toFixed(1)}s` : '4.0s'}</span>
                <button
                  type="button"
                  onClick={handleRestart}
                  className="p-1 rounded bg-black/60 hover:bg-black/80 text-white text-[10px] flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restart</span>
                </button>
              </div>
            </div>
          </>
        ) : asset.type === 'logo' || asset.type === 'image' ? (
          <div className="w-full h-full flex items-center justify-center p-4 bg-[#FAF7F2]">
            <img src={asset.url} alt={asset.name} className="max-h-full max-w-full object-contain" />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-slate-400 gap-2">
            <Music2 className="w-10 h-10" />
            <span className="text-xs font-mono">{asset.name}</span>
          </div>
        )}
      </div>

      {/* Metadata Specification Grid */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 rounded-lg bg-[#FAF8F5] border border-[#EAE6DF]">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Model / Engine</span>
          <span className="font-semibold text-[#1A2B48] truncate block text-[11px]">
            {asset.generationModel || asset.source || 'Veo 3.1 AI'}
          </span>
        </div>
        <div className="p-2 rounded-lg bg-[#FAF8F5] border border-[#EAE6DF]">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Resolution / Size</span>
          <span className="font-semibold text-[#1A2B48] text-[11px]">
            {asset.dimensions ? `${asset.dimensions.width}×${asset.dimensions.height}` : '720×1280'}
            {asset.fileSize ? ` • ${(asset.fileSize / (1024 * 1024)).toFixed(1)}MB` : ''}
          </span>
        </div>
      </div>

      {/* Visual Rationale & Prompt Section */}
      {promptText && (
        <div className="mt-2.5 p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#FF8C73]" /> Production Prompt
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopyPrompt(promptText)}
                className="text-[10px] text-slate-500 hover:text-[#1A2B48] flex items-center gap-1 cursor-pointer"
              >
                {copiedPrompt ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600 font-bold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Prompt</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowPromptDetails(!showPromptDetails)}
                className="text-[10px] font-bold text-[#FF8C73] hover:underline cursor-pointer"
              >
                {showPromptDetails ? 'Collapse' : 'Expand'}
              </button>
            </div>
          </div>

          <p className={`text-[#1A2B48]/85 text-[11px] leading-relaxed font-mono ${showPromptDetails ? '' : 'line-clamp-2'}`}>
            {promptText}
          </p>

          {asset.visualReason && showPromptDetails && (
            <div className="pt-2 border-t border-[#EAE6DF] text-[11px] text-[#1A2B48]/75">
              <strong className="text-[#1A2B48]">Editorial Rationale:</strong> {asset.visualReason}
            </div>
          )}
        </div>
      )}

      {/* Action Bar */}
      {showActions && (
        <div className="mt-4 pt-3 border-t border-[#EAE6DF] space-y-2">
          {/* Primary Lifecycle Controls: Approve / Reject / Archive */}
          <div className="flex flex-wrap items-center gap-1.5">
            {onApprove && asset.status !== 'approved' && (
              <button
                type="button"
                onClick={() => onApprove(asset.id)}
                className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve</span>
              </button>
            )}

            {onReject && asset.status !== 'rejected' && (
              <button
                type="button"
                onClick={() => onReject(asset.id)}
                className="py-1.5 px-2.5 rounded-lg bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
            )}

            {onReplace && (
              <button
                type="button"
                onClick={() => onReplace(asset)}
                className="py-1.5 px-2.5 rounded-lg bg-[#FAF8F5] border border-[#EAE6DF] hover:bg-slate-100 text-[#1A2B48] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FF8C73]" />
                <span>Replace (v{(asset.version || 1) + 1})</span>
              </button>
            )}

            {onArchive && asset.status !== 'archived' && (
              <button
                type="button"
                onClick={() => onArchive(asset.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                title="Archive Asset"
              >
                <Archive className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Attach to Scene Action */}
          {onUseInScene && availableScenes.length > 0 && (
            <div className="flex items-center gap-2 pt-1 text-xs">
              <select
                value={targetSceneId}
                onChange={(e) => setTargetSceneId(Number(e.target.value))}
                className="px-2 py-1 rounded-lg bg-[#FAF8F5] border border-[#EAE6DF] text-xs text-[#1A2B48] font-medium"
              >
                {availableScenes.map((s) => (
                  <option key={s.id} value={s.id}>
                    Scene {s.id}: {s.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => onUseInScene(asset.id, targetSceneId)}
                className="flex-1 py-1 px-2.5 rounded-lg bg-[#1A2B48] hover:bg-[#253D66] text-white font-bold text-xs transition-colors cursor-pointer text-center"
              >
                Use in Scene {targetSceneId}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
