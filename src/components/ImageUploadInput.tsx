'use client';

import { useState, useRef } from 'react';
import {
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploadInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  helpText?: string;
  className?: string;
}

export default function ImageUploadInput({
  value,
  onChange,
  label = 'Product / Item Image',
  helpText,
  className = '',
}: ImageUploadInputProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setErrorMsg('');
    setSuccessMsg('');
    setImageError(false);

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/svg+xml',
      'image/gif',
    ];
    const fileType = file.type.toLowerCase();
    const hasAllowedExt = /\.(jpg|jpeg|png|webp|svg|gif)$/i.test(file.name);

    if (!allowedTypes.includes(fileType) && !hasAllowedExt) {
      setErrorMsg('Please select a valid JPG, PNG, or WEBP image.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      setErrorMsg('Image file size must be less than 5MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Failed to upload image');
      }

      onChange(data.url);
      setSuccessMsg('Image uploaded successfully.');
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setErrorMsg(err.message || 'Image upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleRemove = () => {
    onChange('');
    setErrorMsg('');
    setSuccessMsg('');
    setImageError(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerFileInput = () => {
    setErrorMsg('');
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-slate-300">{label}</label>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
      />

      {/* Modern Upload Area / Image Preview */}
      {value && !imageError ? (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between gap-4 group">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="relative w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
              <img
                src={value}
                alt="Uploaded Preview"
                onError={() => setImageError(true)}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-100">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">Image Ready</span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono truncate max-w-[220px] sm:max-w-xs">
                {value}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={triggerFileInput}
              disabled={isUploading}
              className="space-x-1.5 text-xs"
            >
              {isUploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>Change</span>
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              disabled={isUploading}
              className="space-x-1.5 text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove</span>
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-5 text-center transition-all flex flex-col items-center justify-center space-y-2 ${
            isDragging
              ? 'border-amber-500 bg-amber-500/10'
              : 'border-slate-800 bg-slate-950/60 hover:border-amber-500/50 hover:bg-slate-900/50'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow-inner">
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
          </div>

          <div className="space-y-0.5">
            <p className="text-xs font-bold text-slate-200">
              {isUploading ? 'Uploading Image...' : 'Click to upload image or drag & drop'}
            </p>
            <p className="text-[11px] text-slate-500">
              PNG, JPG, or WEBP (Max file size 5MB)
            </p>
          </div>
        </div>
      )}

      {/* Error & Success Messages */}
      {errorMsg && (
        <div className="flex items-center space-x-2 text-rose-400 text-xs font-medium bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl animate-in fade-in-0">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center space-x-2 text-emerald-400 text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl animate-in fade-in-0">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {helpText && <p className="text-[11px] text-slate-500">{helpText}</p>}
    </div>
  );
}
