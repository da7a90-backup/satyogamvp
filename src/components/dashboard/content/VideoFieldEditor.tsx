'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, RefreshCw, Eye, X, Film } from 'lucide-react';

interface VideoFieldEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onUpload: (file: File) => Promise<void>;
  isUploading?: boolean;
  helperText?: string;
  required?: boolean;
}

export default function VideoFieldEditor({
  label,
  value,
  onChange,
  onUpload,
  isUploading = false,
  helperText,
  required = false
}: VideoFieldEditorProps) {
  const [showPreview, setShowPreview] = useState(!!value);
  const [videoError, setVideoError] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 500MB)
      const maxSize = 500 * 1024 * 1024; // 500MB
      if (file.size > maxSize) {
        alert('Video file is too large. Maximum size is 500MB.');
        e.target.value = '';
        return;
      }

      // Validate file type
      if (!file.type.startsWith('video/')) {
        alert('Please select a valid video file.');
        e.target.value = '';
        return;
      }

      try {
        await onUpload(file);
        setShowPreview(true);
        setVideoError(false);
      } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to upload video. Please try again.');
      }
    }
    // Reset input
    e.target.value = '';
  };

  const handleClearVideo = () => {
    onChange('');
    setShowPreview(false);
    setVideoError(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-3">
      {/* Label */}
      <Label className="text-sm font-medium flex items-center gap-2">
        <Film className="h-4 w-4 text-gray-500" />
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>

      {/* Helper Text */}
      {helperText && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}

      {/* Input and Upload Controls */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => {
              onChange(e.target.value);
              setShowPreview(!!e.target.value);
              setVideoError(false);
            }}
            placeholder="Enter video URL or upload below"
            className="w-full"
          />
        </div>

        <div className="flex gap-2">
          {/* Upload Button */}
          <div className="relative">
            <input
              type="file"
              accept="video/*"
              className="hidden"
              id={`upload-video-${label.replace(/\s+/g, '-')}`}
              onChange={handleFileSelect}
              disabled={isUploading}
            />
            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={() => document.getElementById(`upload-video-${label.replace(/\s+/g, '-')}`)?.click()}
              disabled={isUploading}
              className="whitespace-nowrap"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </div>

          {/* Toggle Preview Button */}
          {value && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setShowPreview(!showPreview)}
              title={showPreview ? 'Hide preview' : 'Show preview'}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}

          {/* Clear Button */}
          {value && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleClearVideo}
              title="Clear video"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && uploadProgress > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Video Preview */}
      {showPreview && value && (
        <div className="relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
          {videoError ? (
            <div className="flex flex-col items-center justify-center p-8 text-gray-400">
              <Film className="h-12 w-12 mb-2" />
              <p className="text-sm">Failed to load video</p>
              <p className="text-xs mt-1 break-all max-w-full px-4">URL: {value}</p>
            </div>
          ) : (
            <>
              <video
                src={value}
                controls
                className="w-full h-auto max-h-96"
                onError={() => setVideoError(true)}
                onLoadedMetadata={() => setVideoError(false)}
                preload="metadata"
              >
                Your browser does not support the video tag.
              </video>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 pointer-events-none">
                <p className="text-xs text-white truncate" title={value}>
                  {value}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* File Size Info */}
      <p className="text-xs text-gray-500">
        Maximum file size: 500MB. Supported formats: MP4, WebM, MOV
      </p>
    </div>
  );
}
