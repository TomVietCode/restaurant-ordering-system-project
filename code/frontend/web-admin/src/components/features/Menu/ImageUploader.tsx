'use client';

import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { ImageIcon, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { apiWithToken } from '@/lib/api';

// Khớp với PresignedUrlResponseDto bên backend (uploads/dtos.ts)
interface PresignedRes { uploadUrl: string; fileUrl: string; key: string }
interface ApiRes<T> { data: T }

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 5;

// Ảnh đã có sẵn URL thật (món đang sửa) hoặc ảnh mới chọn — chỉ giữ preview local, CHƯA upload.
type Slot = { kind: 'url'; url: string } | { kind: 'file'; file: File; preview: string };
const slotSrc = (s: Slot) => s.kind === 'url' ? s.url : s.preview;

export interface ImageUploaderHandle {
  /** Upload mọi ảnh đang chờ (mới chọn nhưng chưa lưu) lên cloud; trả về mảng URL cuối cùng theo đúng thứ tự hiển thị (vị trí 0 = ảnh chính). */
  commit(): Promise<string[]>;
}

interface Props {
  /** Ảnh đã có sẵn (khi sửa món) — chỉ dùng để khởi tạo state lúc mount, không cập nhật lại khi đổi. */
  initialUrls: string[];
  token: string | null;
  max?: number;
}

/**
 * Khu vực chọn/kéo-thả & quản lý ảnh món ăn: ảnh chính to bên trái, ảnh phụ xếp dọc bên phải.
 * Ảnh mới chọn CHỈ hiển thị preview local (object URL) — chưa upload lên S3.
 * Upload thật sự chỉ xảy ra khi cha gọi `ref.current.commit()` (lúc bấm Lưu).
 */
export const ImageUploader = forwardRef<ImageUploaderHandle, Props>(function ImageUploader(
  { initialUrls, token, max = 4 },
  ref,
) {
  const [slots, setSlots] = useState<Slot[]>(() => initialUrls.map(url => ({ kind: 'url', url })));
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    async commit() {
      const urls = await Promise.all(slots.map(async s => {
        if (s.kind === 'url') return s.url;
        const res = await apiWithToken(token).post<ApiRes<PresignedRes>>('/uploads/presigned-url', {
          fileName: s.file.name,
          fileType: s.file.type,
        });
        const putRes = await fetch(res.data.uploadUrl, {
          method: 'PUT',
          body: s.file,
          headers: {
            'Content-Type': s.file.type,
            'x-amz-acl': 'public-read', // khớp với ACL backend đã ký trong presigned URL
          },
        });
        if (!putRes.ok) throw new Error(`S3 PUT failed: ${putRes.status} ${putRes.statusText}`);
        return res.data.fileUrl;
      }));
      // Giải phóng bộ nhớ object URL local sau khi đã upload xong
      slots.forEach(s => { if (s.kind === 'file') URL.revokeObjectURL(s.preview); });
      return urls;
    },
  }), [slots, token]);

  // Chỉ tạo preview local (object URL) — KHÔNG gọi API upload ở đây
  function handleFiles(files: FileList | File[]) {
    const incoming = Array.from(files);
    const remaining = max - slots.length;

    if (remaining <= 0) { toast.warning(`Chỉ được tối đa ${max} ảnh cho mỗi món`); return; }
    if (incoming.length > remaining) toast.warning(`Chỉ được tối đa ${max} ảnh — đã bỏ qua ${incoming.length - remaining} ảnh thừa`);
    const list = incoming.slice(0, remaining);

    for (const file of list) {
      if (!ACCEPTED_TYPES.includes(file.type)) { setError('Chỉ chấp nhận JPEG, PNG, WEBP'); return; }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) { setError(`Mỗi ảnh tối đa ${MAX_SIZE_MB}MB`); return; }
    }

    setError(null);
    const newSlots: Slot[] = list.map(file => ({ kind: 'file', file, preview: URL.createObjectURL(file) }));
    setSlots(prev => [...prev, ...newSlots]);
  }

  function removeImage(idx: number) {
    setSlots(prev => {
      const removed = prev[idx];
      if (removed?.kind === 'file') URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== idx);
    });
  }

  function makeMain(idx: number) {
    setSlots(prev => { const next = [...prev]; const [picked] = next.splice(idx, 1); next.unshift(picked); return next; });
  }

  const [main, ...rest] = slots;
  const canAddMore = slots.length < max;

  return (
    <div className="space-y-1">
      <Label>Ảnh <span className="text-xs font-normal text-muted-foreground">(tối đa {max})</span></Label>

      <div className="flex gap-2">
        {/* Ảnh chính */}
        {main ? (
          <div className="relative size-[132px] shrink-0 overflow-hidden rounded-lg border border-border bg-secondary">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={slotSrc(main)} alt="Ảnh chính" className="h-full w-full object-cover" />
            <span className="absolute bottom-1.5 left-1.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">Chính</span>
            <button type="button" onClick={() => removeImage(0)}
              className="absolute right-1.5 top-1.5 rounded-full bg-black/50 p-1 text-white hover:bg-black/70">
              <X className="size-3" />
            </button>
          </div>
        ) : (
          <div
            role="button" tabIndex={0}
            className={`relative flex size-[132px] shrink-0 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed transition-colors ${
              dragOver ? 'border-primary bg-primary/5' : 'border-border bg-secondary/40 hover:border-primary/50'
            }`}
            onClick={() => fileRef.current?.click()}
            onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files); }}
          >
            <ImageIcon className="size-5 text-muted-foreground/50" />
            <p className="px-2 text-center text-[11px] text-muted-foreground">
              Kéo thả hoặc <span className="text-primary underline">chọn ảnh</span>
            </p>
          </div>
        )}

        {/* Cột ảnh phụ */}
        <div className="flex flex-col gap-1.5">
          {rest.map((s, i) => {
            const idx = i + 1;
            return (
              <div key={s.kind === 'url' ? s.url : s.preview} className="group relative size-9 overflow-hidden rounded-md border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={slotSrc(s)} alt={`Ảnh phụ ${idx}`} className="h-full w-full cursor-pointer object-cover" onClick={() => makeMain(idx)} />
                <button type="button" onClick={() => removeImage(idx)}
                  className="absolute -right-1 -top-1 flex size-3.5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <X className="size-2" />
                </button>
              </div>
            );
          })}

          {canAddMore && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex size-9 items-center justify-center rounded-md border-2 border-dashed border-border bg-secondary/40 text-muted-foreground hover:border-primary/50"
            >
              <Plus className="size-3.5" />
            </button>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(',')}
          className="hidden"
          onChange={e => { if (e.target.files?.length) handleFiles(e.target.files); e.target.value = ''; }}
        />
      </div>
      {main && <p className="text-[11px] text-muted-foreground">Click ảnh phụ để đặt làm chính </p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
});
