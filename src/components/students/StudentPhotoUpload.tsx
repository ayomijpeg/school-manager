'use client';

import React, { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Loader2, Upload, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface StudentPhotoUploadProps {
  studentId: string;
  studentName: string;
  currentPhoto?: string | null;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'overlay' | 'button';
}

export default function StudentPhotoUpload({
  studentId,
  studentName,
  currentPhoto,
  size = 'md',
  variant = 'overlay',
}: StudentPhotoUploadProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(currentPhoto || null);

  const processAndResizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Standard passport dimensions (300 x 400 - 3:4 aspect ratio)
          const targetWidth = 300;
          const targetHeight = 400;

          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }

          // Calculate center crop
          const srcRatio = img.width / img.height;
          const targetRatio = targetWidth / targetHeight;

          let sx = 0;
          let sy = 0;
          let sWidth = img.width;
          let sHeight = img.height;

          if (srcRatio > targetRatio) {
            // Source is wider than target -> crop sides
            sWidth = img.height * targetRatio;
            sx = (img.width - sWidth) / 2;
          } else {
            // Source is taller than target -> crop top/bottom
            sHeight = img.width / targetRatio;
            sy = (img.height - sHeight) / 2;
          }

          ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);

          // Export as compressed JPEG
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error('Failed to load image file'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (JPEG, PNG, or WebP).');
      return;
    }

    try {
      toast.loading('Processing passport photo...', { id: 'photo-upload' });
      const resizedDataUrl = await processAndResizeImage(file);
      setPreview(resizedDataUrl);

      startTransition(async () => {
        const res = await fetch(`/api/students/${studentId}/photo`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photoUrl: resizedDataUrl }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          toast.success(`Photo updated for ${studentName}!`, { id: 'photo-upload' });
          router.refresh();
        } else {
          toast.error(data.error || 'Failed to save student photo', { id: 'photo-upload' });
          setPreview(currentPhoto || null);
        }
      });
    } catch (err: any) {
      toast.error(err.message || 'Error processing photo', { id: 'photo-upload' });
      setPreview(currentPhoto || null);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to remove the photo for ${studentName}?`)) return;

    startTransition(async () => {
      toast.loading('Removing photo...', { id: 'photo-upload' });
      const res = await fetch(`/api/students/${studentId}/photo`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setPreview(null);
        toast.success(`Photo removed for ${studentName}!`, { id: 'photo-upload' });
        router.refresh();
      } else {
        toast.error('Failed to remove photo', { id: 'photo-upload' });
      }
    });
  };

  return (
    <div className="print:hidden">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {variant === 'overlay' ? (
        <div
          onClick={() => !isPending && fileInputRef.current?.click()}
          title="Click to upload or change passport photo"
          className="absolute inset-0 bg-slate-900/60 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer z-20 backdrop-blur-[1px] group"
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin text-white" />
          ) : (
            <>
              <Camera className="w-4 h-4 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-[8px] font-bold uppercase tracking-wider">
                {preview ? 'Change' : 'Upload'}
              </span>
              {preview && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  title="Remove Photo"
                  className="mt-1 p-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white transition-colors"
                >
                  <Trash2 size={10} />
                </button>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Camera className="w-3.5 h-3.5 text-emerald-700" />
            )}
            <span>{preview ? 'Change Photo' : 'Upload Photo'}</span>
          </button>
          {preview && (
            <button
              type="button"
              disabled={isPending}
              onClick={handleRemovePhoto}
              title="Remove Photo"
              className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold transition-colors"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
