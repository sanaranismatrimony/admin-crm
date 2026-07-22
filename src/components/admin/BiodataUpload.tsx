'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, FileText, Loader2, Check, AlertCircle, Eye, X, Zap, Cpu, Brain } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BiodataReviewPanel } from './BiodataReviewPanel';
import type { ExtractionResult, ExtractStage } from '@/types';

interface ExtractionMeta {
  source: 'cache' | 'rules' | 'groq' | 'merged' | 'vision';
  confidence: { overall: number; percentage: number; meetsThreshold: boolean };
  warnings: { field: string; severity: string; message: string }[];
}

interface BiodataUploadProps {
  onExtracted: (data: ExtractionResult, normalizedFields?: ExtractionResult['fields']) => void;
}

const stageLabels: Record<ExtractStage, string> = {
  uploading: 'Uploading biodata...',
  analyzing: 'Analyzing with AI...',
  extracting: 'Extracting fields...',
  done: 'Extraction complete',
  error: 'Extraction failed',
};

const sourceConfig: Record<string, { label: string; icon: typeof Zap; color: string }> = {
  cache: { label: 'Cache', icon: FileText, color: 'var(--blue)' },
  rules: { label: 'Rules', icon: Cpu, color: 'var(--green)' },
  groq: { label: 'AI', icon: Brain, color: 'var(--amber)' },
  merged: { label: 'Rules + AI', icon: Brain, color: 'var(--amber)' },
  vision: { label: 'Vision AI', icon: Brain, color: 'var(--amber)' },
};

export function BiodataUpload({ onExtracted }: BiodataUploadProps) {
  const [stage, setStage] = useState<ExtractStage | null>(null);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [meta, setMeta] = useState<ExtractionMeta | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [fileUrl, setFileUrl] = useState<string>('');
  const fileMimeRef = useRef('');

  const handleFile = useCallback(async (file: File) => {
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setStage('error');
      setError(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 10MB.`);
      return;
    }
    setStage('uploading');
    setError('');
    setFileName(file.name);
    setResult(null);
    setMeta(null);
    setShowReview(false);

    const blobUrl = URL.createObjectURL(file);
    setFileUrl(blobUrl);
    fileMimeRef.current = file.type;

    try {
      const formData = new FormData();
      formData.append('file', file);

      setStage('analyzing');

      const res = await fetch('/api/parse-biodata', {
        method: 'POST',
        body: formData,
      });

      setStage('extracting');

      let json: any;
      try {
        json = await res.json();
      } catch {
        const text = await res.text();
        if (res.status === 504 || text.includes('timed out')) {
          setError('The server took too long to process the image. Try a smaller file or a compressed image.');
        } else if (text.includes('502') || text.includes('bad gateway')) {
          setError('Server temporarily unavailable. Please try again.');
        } else {
          setError(`Server error (${res.status}). Please try again with a different file.`);
        }
        setStage('error');
        return;
      }

      if (!res.ok) {
        const msg = json.error || 'Failed to parse biodata';
        const isRateLimit = res.status === 429;
        setError(isRateLimit ? `${msg} (retry in a few seconds)` : msg);
        setStage('error');
        return;
      }

      if (json.data) {
        setResult(json.data);
        setMeta({
          source: json.source || 'rules',
          confidence: json.confidence || { overall: 0, percentage: 0, meetsThreshold: false },
          warnings: json.warnings || [],
        });
        setStage('done');
        onExtracted(json.data, json.normalized?.fields);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload');
      setStage('error');
    }
  }, [onExtracted]);

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) await handleFile(file);
  }

  async function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) await handleFile(file);
    e.target.value = '';
  }

  const stageIndex = stage ? ['uploading', 'analyzing', 'extracting', 'done'].indexOf(stage) : -1;
  const totalStages = 4;
  const progressPercent = stageIndex >= 0 ? Math.round(((stageIndex) / (totalStages - 1)) * 100) : 0;

  function getQualityLabel(): { text: string; color: string } {
    if (!result) return { text: '', color: '' };
    const fields = Object.values(result.fields);
    const high = fields.filter(f => f.confidence === 'high').length;
    const total = fields.filter(f => f.value !== null).length;
    const ratio = total > 0 ? high / total : 0;
    if (ratio >= 0.7) return { text: 'High', color: 'var(--green)' };
    if (ratio >= 0.4) return { text: 'Medium', color: 'var(--amber)' };
    return { text: 'Low', color: 'var(--red)' };
  }

  function getLowConfidenceCount(): number {
    if (!result) return 0;
    return Object.values(result.fields).filter(f => f.value !== null && f.confidence === 'low').length;
  }

  const src = meta ? sourceConfig[meta.source] : null;

  const dropzoneStyle: React.CSSProperties = stage === 'error'
    ? { borderColor: 'var(--red)', background: 'rgba(220,38,38,0.06)' }
    : stage === 'done'
    ? { borderColor: 'var(--green)', background: 'rgba(22,163,74,0.06)' }
    : stage && stage !== 'uploading'
    ? { borderColor: 'var(--gold)', background: 'rgba(212,168,83,0.06)' }
    : { borderColor: 'var(--border-input)', background: 'transparent' };

  return (
    <div className="space-y-3">
      <label
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed transition-colors cursor-pointer"
        style={dropzoneStyle}
      >
        {stage === 'uploading' || stage === 'analyzing' || stage === 'extracting' ? (
          <div className="flex flex-col items-center w-full">
            <Loader2 className="w-8 h-8 animate-spin mb-2" style={{ color: 'var(--gold)' }} />
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{stageLabels[stage]}</p>
            {fileName && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{fileName}</p>}
            <div className="w-full max-w-xs mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--gray-100)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ background: 'var(--gold)', width: `${progressPercent}%` }}
              />
            </div>
          </div>
        ) : stage === 'done' && result ? (
          <div className="flex flex-col items-center w-full">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2" style={{ background: 'rgba(22,163,74,0.15)' }}>
              <Check className="w-5 h-5" style={{ color: 'var(--green)' }} />
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--green)' }}>Extraction complete</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{fileName}</p>
            <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              {src && (
                <span className="inline-flex items-center gap-1" style={{ color: src.color }}>
                  <src.icon className="w-3 h-3" />
                  {src.label}
                </span>
              )}
              {meta?.confidence.percentage !== undefined && (
                <span style={{ color: meta.confidence.meetsThreshold ? 'var(--green)' : 'var(--amber)' }}>
                  {meta.confidence.percentage}% confidence
                </span>
              )}
              <span>{result.field_count} fields</span>
              {getLowConfidenceCount() > 0 && (
                <span style={{ color: 'var(--red)' }}>{getLowConfidenceCount()} need review</span>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={(e) => { e.preventDefault(); setShowReview(true); }}
            >
              <Eye className="w-3.5 h-3.5 mr-1" />
              Review Extraction
            </Button>
          </div>
        ) : stage === 'error' ? (
          <div className="flex flex-col items-center">
            <AlertCircle className="w-8 h-8 mb-2" style={{ color: 'var(--red)' }} />
            <p className="text-sm" style={{ color: 'var(--red)' }}>{stageLabels.error}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Try again or fill the form manually</p>
          </div>
        ) : (
          <>
            <Upload className="w-8 h-8 mb-2" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Upload biodata PDF, DOCX, or Image</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Drag & drop or click to browse</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>AI will extract and auto-fill the form</p>
          </>
        )}
        <input type="file" accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,.webp" className="hidden" onChange={handleSelect} disabled={stage === 'uploading' || stage === 'analyzing' || stage === 'extracting'} />
      </label>

      {error && (
        <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(217,119,6,0.08)', color: 'var(--amber)', border: '1px solid rgba(217,119,6,0.2)' }}>
          <p>{error}</p>
          <button
            type="button"
            className="mt-2 text-xs underline hover:no-underline"
            onClick={() => {
              setStage(null);
              setError('');
              setFileName('');
              setResult(null);
              setMeta(null);
            }}
          >
            Try again with a different file
          </button>
        </div>
      )}

      {meta?.warnings && meta.warnings.length > 0 && stage === 'done' && (
        <div className="p-3 rounded-xl" style={{ background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.2)' }}>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--amber)' }}>Extraction notes:</p>
          {meta.warnings.map((w, i) => (
            <p key={i} className="text-xs" style={{ color: 'var(--amber)' }}>
              {w.field}: {w.message}
            </p>
          ))}
        </div>
      )}

      {stage !== null && stage !== 'error' && fileName && stage !== 'uploading' && stage !== 'analyzing' && stage !== 'extracting' && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--green)' }}>
            <Check className="w-4 h-4" />
            Parsed: {fileName}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setStage(null);
              setResult(null);
              setMeta(null);
              setFileName('');
              setError('');
              setFileUrl('');
              URL.revokeObjectURL(fileUrl);
            }}
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Clear
          </Button>
        </div>
      )}

      {showReview && result && fileUrl && (
        <BiodataReviewPanel
          result={result}
          fileUrl={fileUrl}
          mimeType={fileMimeRef.current}
          fileName={fileName}
          onClose={() => setShowReview(false)}
        />
      )}

      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        Supported formats: PDF, DOCX, JPG, PNG, WEBP. AI extracts fields and auto-fills the form below.
      </p>
    </div>
  );
}
