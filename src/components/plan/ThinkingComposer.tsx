import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Image as ImageIcon, Mic, Paperclip, Square, X } from 'lucide-react';
import { PrimaryButton } from '../app/ui';
import { formatBytes, formatDuration, type Attachment } from './shared';

interface ThinkingComposerProps {
  value: string;
  onChange: (v: string) => void;
  attachments: Attachment[];
  onAddAttachment: (a: Attachment) => void;
  onRemoveAttachment: (id: string) => void;
  onAnalyze: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

/**
 * The page's writing surface. Deliberately not styled like a chat input \u2014
 * large, quiet, and generous, so typing here feels closer to opening a
 * notebook than opening a messenger.
 */
export default function ThinkingComposer({
  value,
  onChange,
  attachments,
  onAddAttachment,
  onRemoveAttachment,
  onAnalyze,
  disabled,
  autoFocus,
}: ThinkingComposerProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  function handleFiles(files: FileList | null, kind: 'image' | 'document') {
    if (!files) return;
    Array.from(files).forEach((file) => {
      onAddAttachment({
        id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        kind,
        name: file.name,
        size: file.size,
        previewUrl: kind === 'image' ? URL.createObjectURL(file) : undefined,
      });
    });
  }

  async function toggleVoice() {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        if (recordTimerRef.current) clearInterval(recordTimerRef.current);
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const seconds = recordSeconds;
        onAddAttachment({
          id: `att_${Date.now()}`,
          kind: 'voice',
          name: 'Voice note',
          previewUrl: URL.createObjectURL(blob),
          durationSeconds: seconds,
        });
        setIsRecording(false);
        setRecordSeconds(0);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordSeconds(0);
      recordTimerRef.current = setInterval(() => setRecordSeconds((s) => s + 1), 1000);
    } catch {
      // Mic permission denied or unavailable \u2014 fail quietly, the rest of
      // the composer still works without voice.
    }
  }

  return (
    <div
      className="flex flex-col gap-5"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = e.dataTransfer.files;
        if (!files?.length) return;
        Array.from(files).forEach((file) => {
          const kind = file.type.startsWith('image/') ? 'image' : 'document';
          onAddAttachment({
            id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            kind,
            name: file.name,
            size: file.size,
            previewUrl: kind === 'image' ? URL.createObjectURL(file) : undefined,
          });
        });
      }}
    >
      <div>
        <h1 className="font-display font-semibold text-[28px] sm:text-[32px] tracking-tight" style={{ color: 'var(--text)' }}>
          Plan
        </h1>
        <p className="text-[14.5px] mt-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Describe what you&rsquo;re trying to build. Don&rsquo;t worry about structure. Think out loud.
        </p>
      </div>

      <div
        className="relative rounded-3xl transition-colors"
        style={{
          background: 'var(--glass)',
          border: `1.5px solid ${isDragOver ? 'var(--violet)' : 'var(--line)'}`,
        }}
      >
        <textarea
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="I want to&hellip;"
          rows={10}
          className="w-full resize-none outline-none bg-transparent rounded-3xl"
          style={{
            padding: '28px 26px',
            fontSize: 16,
            lineHeight: 1.7,
            color: 'var(--text)',
            fontFamily: 'var(--font-body)',
            minHeight: 220,
          }}
        />
        {isDragOver && (
          <div
            className="absolute inset-0 rounded-3xl flex items-center justify-center pointer-events-none"
            style={{ background: 'rgba(131,53,253,0.06)', border: '1.5px dashed var(--violet)' }}
          >
            <span className="text-sm font-medium" style={{ color: 'var(--violet)' }}>Drop to attach</span>
          </div>
        )}
      </div>

      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((a) => (
            <AttachmentChip key={a.id} attachment={a} onRemove={() => onRemoveAttachment(a.id)} />
          ))}
        </div>
      )}

      {isRecording && (
        <div className="flex items-center gap-2.5 rounded-xl px-4 py-2.5" style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)' }}>
          <motion.span
            className="w-2 h-2 rounded-full"
            style={{ background: '#f87171' }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          <span className="text-[13px] font-mono" style={{ color: '#f87171' }}>Recording &middot; {formatDuration(recordSeconds)}</span>
          <button onClick={toggleVoice} className="ml-auto text-[12px] flex items-center gap-1" style={{ color: '#f87171' }}>
            <Square size={11} fill="#f87171" /> Stop
          </button>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5">
          <ComposerAction icon={Paperclip} label="Attach" onClick={() => docInputRef.current?.click()} />
          <ComposerAction icon={Mic} label="Voice" onClick={toggleVoice} active={isRecording} />
          <ComposerAction icon={ImageIcon} label="Image" onClick={() => imageInputRef.current?.click()} />
          <ComposerAction icon={FileText} label="Document" onClick={() => docInputRef.current?.click()} />
        </div>
        <PrimaryButton onClick={onAnalyze} disabled={disabled || !value.trim()}>
          Analyze Plan
        </PrimaryButton>
      </div>

      <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { handleFiles(e.target.files, 'image'); e.target.value = ''; }} />
      <input ref={docInputRef} type="file" accept=".pdf,.doc,.docx,.txt,.md,image/*" multiple className="hidden" onChange={(e) => { handleFiles(e.target.files, 'document'); e.target.value = ''; }} />
    </div>
  );
}

function ComposerAction({ icon: Icon, label, onClick, active }: { icon: typeof Paperclip; label: string; onClick: () => void; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12.5px] transition-colors"
      style={{
        color: active ? '#f87171' : 'var(--text-muted)',
        background: active ? 'rgba(248,113,113,0.1)' : 'transparent',
      }}
    >
      <Icon size={14} /> {label}
    </button>
  );
}

function AttachmentChip({ attachment, onRemove }: { attachment: Attachment; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full" style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
      {attachment.kind === 'image' && attachment.previewUrl ? (
        <img src={attachment.previewUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
      ) : (
        <span className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'var(--glass-strong)' }}>
          {attachment.kind === 'voice' ? <Mic size={11} color="var(--text-muted)" /> : <FileText size={11} color="var(--text-muted)" />}
        </span>
      )}
      <span className="text-[11.5px] max-w-[140px] truncate" style={{ color: 'var(--text)' }}>{attachment.name}</span>
      <span className="text-[10.5px]" style={{ color: 'var(--text-faint)' }}>
        {attachment.kind === 'voice' ? formatDuration(attachment.durationSeconds ?? 0) : attachment.size ? formatBytes(attachment.size) : ''}
      </span>
      <button onClick={onRemove} aria-label="Remove attachment" style={{ color: 'var(--text-faint)' }}>
        <X size={12} />
      </button>
    </div>
  );
}
