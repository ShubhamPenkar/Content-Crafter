import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Video as VideoIcon,
  Music,
  Shield,
  Trash2,
  Copy,
  Check,
  Search,
  Plus,
  Play,
  Pause,
  ExternalLink,
  Tag,
  Clock,
  Maximize2,
  Filter,
  CheckCircle2,
  XCircle,
  Archive,
  RotateCw,
  Sparkles,
  Eye,
  Film,
  Layers,
  X,
} from 'lucide-react';
import { JodoCoAsset, AssetType, AssetLifecycleStatus } from '../project-engine/types';
import { AssetPreview } from './AssetPreview';
import { SceneInfo } from '../types';

interface AssetLibraryViewProps {
  assets: JodoCoAsset[];
  scenes?: SceneInfo[];
  onAddAsset: (asset: JodoCoAsset) => void;
  onRemoveAsset: (assetId: string) => void;
  onUpdateAssetStatus?: (assetId: string, status: AssetLifecycleStatus) => void;
  onApproveAsset?: (assetId: string) => void;
  onRejectAsset?: (assetId: string) => void;
  onArchiveAsset?: (assetId: string) => void;
  onUseAssetInScene?: (assetId: string, sceneId: number) => void;
  onOpenGeneratorForScene?: (scene: SceneInfo) => void;
}

export const AssetLibraryView: React.FC<AssetLibraryViewProps> = ({
  assets,
  scenes = [],
  onAddAsset,
  onRemoveAsset,
  onUpdateAssetStatus,
  onApproveAsset,
  onRejectAsset,
  onArchiveAsset,
  onUseAssetInScene,
  onOpenGeneratorForScene,
}) => {
  const [filterType, setFilterType] = useState<AssetType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<AssetLifecycleStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [inspectingAsset, setInspectingAsset] = useState<JodoCoAsset | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Filtered assets
  const filteredAssets = assets.filter((asset) => {
    const matchesType = filterType === 'all' || asset.type === filterType;
    const currentStatus = asset.status || 'approved';
    const matchesStatus = filterStatus === 'all' || currentStatus === filterStatus;
    const matchesSearch =
      !searchQuery.trim() ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      asset.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.prompt?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  const availableScenes = scenes.map((s) => ({
    id: s.id,
    name: s.name,
  }));

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const fileId = `asset-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const fileUrl = URL.createObjectURL(file);
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isAudio = file.type.startsWith('audio/');
      const isSvg = file.type === 'image/svg+xml' || file.name.endsWith('.svg');

      let detectedType: AssetType = 'other';
      if (isSvg || file.name.toLowerCase().includes('logo')) {
        detectedType = 'logo';
      } else if (isImage) {
        detectedType = 'image';
      } else if (isVideo) {
        detectedType = 'video';
      } else if (isAudio) {
        detectedType = 'audio';
      }

      // Extract metadata asynchronously
      if (isImage) {
        const img = new Image();
        img.src = fileUrl;
        img.onload = () => {
          onAddAsset({
            id: fileId,
            name: file.name,
            type: detectedType,
            mimeType: file.type,
            url: fileUrl,
            fileSize: file.size,
            version: 1,
            status: 'approved',
            dimensions: { width: img.naturalWidth, height: img.naturalHeight },
            createdAt: new Date().toISOString(),
            tags: ['upload', detectedType],
          });
        };
      } else if (isVideo) {
        const video = document.createElement('video');
        video.src = fileUrl;
        video.onloadedmetadata = () => {
          onAddAsset({
            id: fileId,
            name: file.name,
            type: 'video',
            mimeType: file.type,
            url: fileUrl,
            fileSize: file.size,
            version: 1,
            status: 'approved',
            dimensions: { width: video.videoWidth, height: video.videoHeight },
            duration: Math.round(video.duration * 10) / 10,
            createdAt: new Date().toISOString(),
            tags: ['upload', 'video', 'b-roll'],
          });
        };
      } else if (isAudio) {
        const audio = new Audio(fileUrl);
        audio.onloadedmetadata = () => {
          onAddAsset({
            id: fileId,
            name: file.name,
            type: 'audio',
            mimeType: file.type,
            url: fileUrl,
            fileSize: file.size,
            version: 1,
            status: 'approved',
            duration: Math.round(audio.duration * 10) / 10,
            createdAt: new Date().toISOString(),
            tags: ['upload', 'audio', 'sfx'],
          });
        };
      } else {
        onAddAsset({
          id: fileId,
          name: file.name,
          type: detectedType,
          mimeType: file.type,
          url: fileUrl,
          fileSize: file.size,
          version: 1,
          status: 'approved',
          createdAt: new Date().toISOString(),
          tags: ['upload'],
        });
      }
    });
  };

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleToggleAudio = (asset: JodoCoAsset) => {
    if (playingAudioId === asset.id) {
      audioElementRef.current?.pause();
      setPlayingAudioId(null);
    } else {
      if (asset.url.startsWith('#')) {
        return;
      }
      if (!audioElementRef.current) {
        audioElementRef.current = new Audio(asset.url);
      } else {
        audioElementRef.current.src = asset.url;
      }
      audioElementRef.current.play();
      setPlayingAudioId(asset.id);
      audioElementRef.current.onended = () => setPlayingAudioId(null);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getTypeIcon = (type: AssetType) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-4 h-4 text-[#FF8C73]" />;
      case 'video':
        return <VideoIcon className="w-4 h-4 text-[#8FE3C0]" />;
      case 'audio':
        return <Music className="w-4 h-4 text-[#B8A7EA]" />;
      case 'logo':
        return <Shield className="w-4 h-4 text-[#FF8C73]" />;
      default:
        return <Tag className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: AssetLifecycleStatus = 'reviewing') => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-[10px] font-bold">
            <XCircle className="w-3 h-3 text-rose-600" />
            Rejected
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold">
            <Archive className="w-3 h-3 text-slate-500" />
            Archived
          </span>
        );
      case 'reviewing':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-bold">
            <Clock className="w-3 h-3 text-amber-600" />
            Reviewing
          </span>
        );
    }
  };

  const countByStatus = (status: AssetLifecycleStatus) => {
    return assets.filter((a) => (a.status || 'reviewing') === status).length;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Stats Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#EAE6DF] rounded-3xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase bg-[#1A2B48]/5 text-[#1A2B48]">
              AI Asset & Visual Pipeline
            </span>
            <span className="text-xs text-slate-400">• {assets.length} Total Registered Assets</span>
          </div>
          <h1 className="text-2xl font-black text-[#1A2B48] tracking-tight font-heading">
            Asset Library & Pipeline
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Manage the full production lifecycle of generated visuals, brand logos, b-roll, and SFX with versioning and quality approval.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileUpload(e.target.files)}
            multiple
            accept="image/*,video/*,audio/*,.svg"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A2B48] text-white text-sm font-bold shadow-xs hover:bg-[#253D66] transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4 text-[#8FE3C0]" />
            <span>Upload Media</span>
          </button>
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFileUpload(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-6 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-[#FF8C73] bg-[#FF8C73]/5 scale-[0.99]'
            : 'border-slate-200 hover:border-[#1A2B48]/30 bg-white/60 hover:bg-white'
        }`}
      >
        <div className="w-10 h-10 mx-auto rounded-full bg-[#FAF8F5] border border-[#EAE6DF] flex items-center justify-center text-[#1A2B48] mb-2">
          <Upload className="w-4 h-4 text-[#FF8C73]" />
        </div>
        <p className="text-xs font-bold text-[#1A2B48]">
          Drop footage, graphics, audio, or logos here to ingest
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
          Auto-tags dimensions, formats, duration, and assigns initial version
        </p>
      </div>

      {/* Lifecycle Status Pipeline Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {(
          [
            { id: 'all', label: 'All Lifecycle', count: assets.length, icon: Layers, color: 'text-slate-700' },
            { id: 'reviewing', label: 'Reviewing', count: countByStatus('reviewing'), icon: Clock, color: 'text-amber-600' },
            { id: 'approved', label: 'Approved', count: countByStatus('approved'), icon: CheckCircle2, color: 'text-emerald-600' },
            { id: 'rejected', label: 'Rejected', count: countByStatus('rejected'), icon: XCircle, color: 'text-rose-600' },
            { id: 'archived', label: 'Archived', count: countByStatus('archived'), icon: Archive, color: 'text-slate-500' },
          ] as const
        ).map((st) => {
          const Icon = st.icon;
          const isSelected = filterStatus === st.id;
          return (
            <button
              key={st.id}
              type="button"
              onClick={() => setFilterStatus(st.id)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                isSelected
                  ? 'bg-[#1A2B48] border-[#1A2B48] text-white shadow-xs'
                  : 'bg-white border-[#EAE6DF] hover:bg-[#FAF8F5] text-[#1A2B48]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : st.color}`} />
                <span className="text-xs font-bold">{st.label}</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {st.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Secondary Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Type Filters */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white border border-[#EAE6DF] rounded-2xl w-full sm:w-auto">
          {(
            [
              { id: 'all', label: 'All Media', count: assets.length },
              { id: 'video', label: 'AI & Video', count: assets.filter((a) => a.type === 'video').length },
              { id: 'image', label: 'Graphics', count: assets.filter((a) => a.type === 'image').length },
              { id: 'logo', label: 'Logos', count: assets.filter((a) => a.type === 'logo').length },
              { id: 'audio', label: 'Audio', count: assets.filter((a) => a.type === 'audio').length },
            ] as const
          ).map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setFilterType(filter.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterType === filter.id
                  ? 'bg-[#1A2B48] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-[#1A2B48] hover:bg-slate-100'
              }`}
            >
              <span>{filter.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  filterType === filter.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {filter.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prompt, tags, scene..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#EAE6DF] rounded-2xl text-xs text-[#1A2B48] placeholder-slate-400 focus:outline-hidden focus:border-[#FF8C73]"
          />
        </div>
      </div>

      {/* Asset Grid */}
      {filteredAssets.length === 0 ? (
        <div className="bg-white border border-[#EAE6DF] rounded-3xl p-12 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <Filter className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#1A2B48] font-heading">No matching assets found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search or filter criteria, or generate new visual assets from the Reel Storyboard.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAssets.map((asset) => {
            const currentStatus = asset.status || 'reviewing';
            return (
              <div
                key={asset.id}
                className={`group bg-white border rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                  currentStatus === 'rejected'
                    ? 'border-rose-200 bg-rose-50/10'
                    : currentStatus === 'approved'
                    ? 'border-emerald-200'
                    : 'border-[#EAE6DF]'
                }`}
              >
                {/* Thumbnail / Preview Area */}
                <div className="relative aspect-[9/16] max-h-56 bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-100">
                  {asset.type === 'image' || asset.type === 'logo' ? (
                    asset.url.startsWith('data:image') || asset.url.startsWith('blob:') || asset.url.startsWith('http') ? (
                      <img
                        src={asset.url}
                        alt={asset.name}
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <Shield className="w-8 h-8 text-[#FF8C73] mx-auto mb-1" />
                        <span className="text-[11px] font-bold text-slate-600">Brand Vector</span>
                      </div>
                    )
                  ) : asset.type === 'video' ? (
                    <video
                      src={asset.url}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                      onMouseLeave={(e) => {
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = 0;
                      }}
                    />
                  ) : asset.type === 'audio' ? (
                    <div className="flex flex-col items-center justify-center gap-2 p-4 text-[#1A2B48]">
                      <button
                        type="button"
                        onClick={() => handleToggleAudio(asset)}
                        className="w-10 h-10 rounded-full bg-[#1A2B48] text-white flex items-center justify-center shadow-xs hover:scale-105 transition-transform cursor-pointer"
                      >
                        {playingAudioId === asset.id ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4 ml-0.5" />
                        )}
                      </button>
                      <span className="text-[11px] font-bold text-slate-500">
                        {asset.duration ? `${asset.duration}s Audio` : 'Audio Track'}
                      </span>
                    </div>
                  ) : (
                    <Tag className="w-8 h-8 text-slate-400" />
                  )}

                  {/* Top Floating Badges */}
                  <div className="absolute top-2 left-2 flex flex-wrap items-center gap-1">
                    <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono font-bold">
                      v{asset.version || 1}
                    </span>
                    {asset.sceneId && (
                      <span className="px-2 py-0.5 rounded-md bg-[#FF8C73] text-white text-[10px] font-bold">
                        Scene {asset.sceneId}
                      </span>
                    )}
                    {asset.carouselSlideId && (
                      <span className="px-2 py-0.5 rounded-md bg-[#B8A7EA] text-[#1A2B48] text-[10px] font-bold">
                        Slide {asset.carouselSlideId}
                      </span>
                    )}
                    {asset.targetMedium === 'carousel' && !asset.carouselSlideId && (
                      <span className="px-2 py-0.5 rounded-md bg-[#8FE3C0] text-[#1A2B48] text-[10px] font-bold">
                        Carousel 4:5
                      </span>
                    )}
                  </div>

                  {/* Quick Inspect Button */}
                  <button
                    type="button"
                    onClick={() => setInspectingAsset(asset)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Inspect Details & Metadata"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Bottom Technical Indicators */}
                  {(asset.dimensions || asset.duration) && (
                    <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono">
                      {asset.dimensions && `${asset.dimensions.width}×${asset.dimensions.height}`}
                      {asset.duration && ` • ${asset.duration}s`}
                    </div>
                  )}
                </div>

                {/* Body Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4
                        className="text-xs font-bold text-[#1A2B48] truncate font-heading"
                        title={asset.name}
                      >
                        {asset.name}
                      </h4>
                      {getStatusBadge(currentStatus)}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 font-mono">
                      <span>{formatFileSize(asset.fileSize)}</span>
                      <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
                    </div>

                    {asset.prompt && (
                      <p className="text-[11px] text-[#1A2B48]/75 font-mono line-clamp-2 italic bg-[#FAF8F5] p-2 rounded-xl border border-[#EAE6DF]/60 mb-2">
                        "{asset.prompt}"
                      </p>
                    )}
                  </div>

                  {/* Action Toolbar */}
                  <div className="pt-2.5 border-t border-[#EAE6DF] space-y-2">
                    {/* Lifecycle Action Buttons */}
                    <div className="flex items-center gap-1.5">
                      {onApproveAsset && currentStatus !== 'approved' && (
                        <button
                          type="button"
                          onClick={() => onApproveAsset(asset.id)}
                          className="flex-1 py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Approve</span>
                        </button>
                      )}

                      {onRejectAsset && currentStatus !== 'rejected' && (
                        <button
                          type="button"
                          onClick={() => onRejectAsset(asset.id)}
                          className="py-1 px-2 rounded-lg bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <XCircle className="w-3 h-3" />
                          <span>Reject</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setInspectingAsset(asset)}
                        className="py-1 px-2 rounded-lg bg-[#FAF8F5] border border-[#EAE6DF] hover:bg-slate-100 text-[#1A2B48] text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        title="Open Full Preview"
                      >
                        <Eye className="w-3 h-3 text-[#FF8C73]" />
                        <span>Preview</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onRemoveAsset(asset.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete from Library"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Scene Linking */}
                    {onUseAssetInScene && asset.type === 'video' && scenes.length > 0 && (
                      <div className="flex items-center gap-1.5 pt-1">
                        <select
                          defaultValue={asset.sceneId || 1}
                          onChange={(e) => onUseAssetInScene(asset.id, Number(e.target.value))}
                          className="w-full text-[11px] py-1 px-2 rounded-lg bg-[#FAF8F5] border border-[#EAE6DF] text-[#1A2B48] font-medium"
                        >
                          {scenes.map((s) => (
                            <option key={s.id} value={s.id}>
                              Attach to Scene {s.id} ({s.name})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inspect / Asset Preview Modal */}
      {inspectingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl my-8 relative">
            <button
              type="button"
              onClick={() => setInspectingAsset(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-slate-700 shadow-md transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <AssetPreview
              asset={inspectingAsset}
              sceneName={scenes.find((s) => s.id === inspectingAsset.sceneId)?.name}
              onApprove={onApproveAsset}
              onReject={onRejectAsset}
              onArchive={onArchiveAsset}
              onUseInScene={onUseAssetInScene}
              availableScenes={availableScenes}
              onReplace={(asset) => {
                setInspectingAsset(null);
                const targetScene = scenes.find((s) => s.id === asset.sceneId);
                if (targetScene && onOpenGeneratorForScene) {
                  onOpenGeneratorForScene(targetScene);
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
