'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, RefreshCw, Eye, X, ImageIcon } from 'lucide-react';

interface ImageFieldEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onUpload: (file: File) => Promise<void>;
  isUploading?: boolean;
  helperText?: string;
  required?: boolean;
  gravity?: string | null;
  onGravityChange?: (gravity: string) => void;
  showGravitySelector?: boolean;
}

export default function ImageFieldEditor({
  label,
  value,
  onChange,
  onUpload,
  isUploading = false,
  helperText,
  required = false,
  gravity,
  onGravityChange,
  showGravitySelector = false
}: ImageFieldEditorProps) {
  const [showPreview, setShowPreview] = useState(!!value);
  const [imageError, setImageError] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await onUpload(file);
        setShowPreview(true);
        setImageError(false);
      } catch (error) {
        console.error('Upload error:', error);
      }
    }
    // Reset input
    e.target.value = '';
  };

  const handleClearImage = () => {
    onChange('');
    setShowPreview(false);
    setImageError(false);
  };

  return (
    <div className="space-y-3">
      {/* Label */}
      <Label className="text-sm font-medium flex items-center gap-2">
        <ImageIcon className="h-4 w-4 text-gray-500" />
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
              setImageError(false);
            }}
            placeholder="Enter image URL or upload below"
            className="w-full"
          />
        </div>

        <div className="flex gap-2">
          {/* Upload Button */}
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id={`upload-${label.replace(/\s+/g, '-')}`}
              onChange={handleFileSelect}
              disabled={isUploading}
            />
            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={() => document.getElementById(`upload-${label.replace(/\s+/g, '-')}`)?.click()}
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
              onClick={handleClearImage}
              title="Clear image"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Image Preview */}
      {showPreview && value && (
        <div className="relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
          {imageError ? (
            <div className="flex flex-col items-center justify-center p-8 text-gray-400">
              <ImageIcon className="h-12 w-12 mb-2" />
              <p className="text-sm">Failed to load image</p>
              <p className="text-xs mt-1">URL: {value}</p>
            </div>
          ) : (
            <>
              <img
                src={value}
                alt={label}
                className="w-full h-auto max-h-96 object-contain"
                onError={() => setImageError(true)}
                onLoad={() => setImageError(false)}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <p className="text-xs text-white truncate" title={value}>
                  {value}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Gravity Selector */}
      {showGravitySelector && value && onGravityChange && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Image Position (Gravity)
          </Label>
          <p className="text-xs text-gray-500">
            Choose how the image should be positioned when cropped or resized
          </p>
          <div className="grid grid-cols-3 gap-2 w-fit">
            {[
              { value: 'top-left', label: '↖ Top Left' },
              { value: 'top-center', label: '↑ Top Center' },
              { value: 'top-right', label: '↗ Top Right' },
              { value: 'center-left', label: '← Center Left' },
              { value: 'center', label: '• Center' },
              { value: 'center-right', label: '→ Center Right' },
              { value: 'bottom-left', label: '↙ Bottom Left' },
              { value: 'bottom-center', label: '↓ Bottom Center' },
              { value: 'bottom-right', label: '↘ Bottom Right' }
            ].map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={gravity === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onGravityChange(option.value)}
                className={`text-xs whitespace-nowrap ${
                  gravity === option.value
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'hover:bg-gray-100'
                }`}
                title={option.label}
              >
                {option.label}
              </Button>
            ))}
          </div>
          {gravity && (
            <p className="text-xs text-gray-600">
              Current position: <span className="font-medium">{gravity}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
