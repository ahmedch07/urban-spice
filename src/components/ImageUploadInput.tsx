'use client';

import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, X, RefreshCw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

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
  label = 'Image',
  placeholder = 'https://images.unsplash.com/...',
  helpText,
  className = '',
}: ImageUploadInputProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>(value && !value.startsWith('/uploads') && value.startsWith('http') ? 'url' : 'upload');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset feedback
    setErrorMsg('');
    setSuccessMsg('');
    setImageError(false);

    // Frontend validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setErrorMsg('Please select a valid JPG, PNG, or WEBP image.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      setErrorMsg('Image size must be less than 5MB.');
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
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setErrorMsg(err.message || 'Image upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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
      {label && <label className="block text-xs font-semibold text-slate-300">{label}</label>}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
      />

      {/* Upload Box Card */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
        {/* Mode Selector Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'upload'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Option A — Upload from Device</span>
          </button>

          <span className="text-slate-600 text-xs font-bold px-1">OR</span>

          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'url'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Option B — Use Image URL</span>
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'upload' ? (
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={triggerFileInput}
              disabled={isUploading}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-slate-100 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Uploading...</span>
                </>
              ) : value ? (
                <>
                  <RefreshCw className="w-4 h-4 text-amber-400" />
                  <span>Replace / Change File</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>Choose File / Upload Image</span>
                </>
              )}
            </button>
            <span className="text-[11px] text-slate-500">Supported: JPG, PNG, WEBP (Max 5MB)</span>
          </div>
        ) : (
          <div>
            <div className="relative">
              <input
                type="text"
                value={value}
                onChange={(e) => {
                  onChange(e.target.value);
                  setImageError(false);
                }}
                placeholder={placeholder}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        )}

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="flex items-center space-x-2 text-rose-400 text-xs font-medium bg-rose-500/10 border border-rose-500/20 p-2 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Image Preview Box */}
        <div className="mt-2 pt-2 border-t border-slate-800/60">
          <div className="flex items-start space-x-3">
            <div className="relative group w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
              {value && !imageError ? (
                <img
                  src={value}
                  alt="Preview"
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-2 text-slate-600 text-center">
                  <ImageIcon className="w-6 h-6 mb-1 text-slate-500" />
                  <span className="text-[10px]">No Image Preview</span>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <div className="text-xs">
                <span className="font-semibold text-slate-300 block">Image Preview</span>
                {value ? (
                  <p className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-xs font-mono">
                    {value}
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500">No image selected or uploaded yet.</p>
                )}
              </div>

              {value && (
                <div className="flex items-center space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-slate-100 rounded-lg text-[11px] font-medium border border-slate-800 flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3 h-3 text-amber-400" />
                    <span>Replace</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-[11px] font-medium border border-rose-500/20 flex items-center space-x-1"
                  >
                    <X className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {helpText && <p className="text-[11px] text-slate-500">{helpText}</p>}
    </div>
  );
}
