import React, { useState } from 'react';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000';

interface BunnyVideoUploadProps {
  onSuccess: (videoData: {
    videoId: string;
    embedUrl: string;
    hlsUrl: string;
    thumbnailUrl: string;
    title: string;
  }) => void;
  onError?: (error: any) => void;
  className?: string;
  label?: string;
}

export default function BunnyVideoUpload({
  onSuccess,
  onError,
  className = '',
  label = 'Upload Walkaround Video to Bunny Stream'
}: BunnyVideoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('title', file.name.replace(/\.[^/.]+$/, ''));

      const response = await fetch(`${API_URL}/api/admin/videos/upload-bunny`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const result = await response.json();
      setProgress(100);
      onSuccess(result);
    } catch (err: any) {
      console.error('Bunny Video Upload Error:', err);
      if (onError) onError(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`p-4 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50/50 ${className}`}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <input
        type="file"
        accept="video/mp4,video/quicktime,video/webm,video/x-matroska"
        disabled={uploading}
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-rose-600 file:text-white hover:file:bg-rose-700 cursor-pointer disabled:opacity-50"
      />
      {uploading && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Uploading & transcoding on Bunny Stream...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-rose-600 h-2 rounded-full transition-all duration-300 animate-pulse"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
