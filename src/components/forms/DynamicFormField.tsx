'use client';

import React, { useState } from 'react';
import { FormField } from '@/types/dynamic-form';
import Image from 'next/image';
import { validatePhotoHasOneFace } from '@/lib/face-detection';

interface DynamicFormFieldProps {
  field: FormField;
  value: any;
  onChange: (fieldId: string, value: any) => void;
  error?: string;
}

export function DynamicFormField({ field, value, onChange, error }: DynamicFormFieldProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isValidatingFace, setIsValidatingFace] = useState(false);
  const [faceValidationError, setFaceValidationError] = useState<string | null>(null);

  const baseInputClasses = `
    w-full h-[44px] px-[14px] py-[10px]
    bg-white border border-[#D5D7DA] rounded-[8px]
    font-sans text-[16px] leading-[24px] text-[#717680]
    placeholder:text-[#717680]
    focus:outline-none focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent
    shadow-[0px_1px_2px_rgba(10,13,18,0.05)]
  `;

  const textareaClasses = `
    w-full min-h-[120px] px-[14px] py-[10px]
    bg-white border border-[#D5D7DA] rounded-[8px]
    font-sans text-[16px] leading-[24px] text-[#717680]
    placeholder:text-[#717680]
    focus:outline-none focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent
    shadow-[0px_1px_2px_rgba(10,13,18,0.05)]
    resize-vertical
  `;

  const labelClasses = `
    block font-sans font-medium text-[14px] leading-[20px] text-[#414651] mb-[6px]
  `;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For photo fields, validate face detection
      if (field.field_type === 'PHOTO') {
        setIsValidatingFace(true);
        setFaceValidationError(null);

        try {
          // Validate that photo has exactly one face
          const validation = await validatePhotoHasOneFace(file);

          if (!validation.valid) {
            // Face validation failed
            setFaceValidationError(validation.message);
            setPhotoPreview(null);
            setIsValidatingFace(false);
            // Clear the file input
            e.target.value = '';
            return;
          }

          // Validation successful - show preview
          const reader = new FileReader();
          reader.onloadend = () => {
            setPhotoPreview(reader.result as string);
            setIsValidatingFace(false);
          };
          reader.readAsDataURL(file);

          // Pass the file to parent
          onChange(field.id, file);
        } catch (error) {
          console.error('Face validation error:', error);
          setFaceValidationError('Error validating photo. Please try again.');
          setPhotoPreview(null);
          setIsValidatingFace(false);
          e.target.value = '';
        }
      } else {
        // For non-photo file uploads, just pass the file
        onChange(field.id, file);
      }
    }
  };

  const renderField = () => {
    switch (field.field_type) {
      case 'TEXT':
        return (
          <input
            type="text"
            className={baseInputClasses}
            placeholder={field.placeholder || ''}
            value={value || ''}
            onChange={(e) => onChange(field.id, e.target.value)}
            required={field.is_required}
          />
        );

      case 'EMAIL':
        return (
          <input
            type="email"
            className={baseInputClasses}
            placeholder={field.placeholder || ''}
            value={value || ''}
            onChange={(e) => onChange(field.id, e.target.value)}
            required={field.is_required}
          />
        );

      case 'PHONE':
        return (
          <input
            type="tel"
            className={baseInputClasses}
            placeholder={field.placeholder || ''}
            value={value || ''}
            onChange={(e) => onChange(field.id, e.target.value)}
            required={field.is_required}
          />
        );

      case 'DATE':
        return (
          <input
            type="date"
            className={baseInputClasses}
            placeholder={field.placeholder || ''}
            value={value || ''}
            onChange={(e) => onChange(field.id, e.target.value)}
            required={field.is_required}
          />
        );

      case 'NUMBER':
        return (
          <input
            type="number"
            className={baseInputClasses}
            placeholder={field.placeholder || ''}
            value={value || ''}
            onChange={(e) => onChange(field.id, e.target.value)}
            required={field.is_required}
          />
        );

      case 'TEXTAREA':
        return (
          <textarea
            className={textareaClasses}
            placeholder={field.placeholder || ''}
            value={value || ''}
            onChange={(e) => onChange(field.id, e.target.value)}
            required={field.is_required}
            rows={5}
          />
        );

      case 'SELECT':
        return (
          <select
            className={baseInputClasses}
            value={value || ''}
            onChange={(e) => onChange(field.id, e.target.value)}
            required={field.is_required}
          >
            <option value="">{field.placeholder || 'Select an option...'}</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'RADIO':
        return (
          <div className="space-y-3">
            {field.options?.map((option) => (
              <label
                key={option}
                className="flex items-center space-x-3 cursor-pointer group"
              >
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => onChange(field.id, e.target.value)}
                  required={field.is_required}
                  className="w-4 h-4 text-[#7D1A13] border-[#D5D7DA] focus:ring-[#7D1A13] focus:ring-2"
                />
                <span className="text-[16px] text-[#414651] group-hover:text-[#7D1A13] transition-colors">
                  {option}
                </span>
              </label>
            ))}
          </div>
        );

      case 'CHECKBOX':
        return (
          <div className="space-y-3">
            {field.options?.map((option) => (
              <label
                key={option}
                className="flex items-center space-x-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  value={option}
                  checked={Array.isArray(value) && value.includes(option)}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    const newValues = e.target.checked
                      ? [...currentValues, option]
                      : currentValues.filter((v) => v !== option);
                    onChange(field.id, newValues);
                  }}
                  className="w-4 h-4 text-[#7D1A13] border-[#D5D7DA] rounded focus:ring-[#7D1A13] focus:ring-2"
                />
                <span className="text-[16px] text-[#414651] group-hover:text-[#7D1A13] transition-colors">
                  {option}
                </span>
              </label>
            ))}
          </div>
        );

      case 'PHOTO':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor={`photo-${field.id}`}
                className={`flex flex-col items-center justify-center w-full h-[200px] border-2 border-dashed rounded-[8px] cursor-pointer transition-colors ${
                  faceValidationError
                    ? 'border-[#942017] bg-red-50'
                    : 'border-[#D5D7DA] bg-white hover:bg-gray-50'
                }`}
              >
                {isValidatingFace ? (
                  <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#7D1A13] mb-3"></div>
                    <p className="text-sm text-[#717680] font-sans">Validating photo...</p>
                  </div>
                ) : photoPreview ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={photoPreview}
                      alt="Preview"
                      fill
                      className="object-contain p-4 rounded-[8px]"
                    />
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-sans px-2 py-1 rounded">
                      ✓ Face detected
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-10 h-10 mb-3 text-[#717680]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="mb-2 text-sm text-[#717680] font-sans">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    {field.help_text && (
                      <p className="text-xs text-[#717680] font-sans">
                        {field.help_text}
                      </p>
                    )}
                    <p className="text-xs text-[#717680] font-sans mt-2">
                      Photo must contain exactly one face
                    </p>
                  </div>
                )}
                <input
                  id={`photo-${field.id}`}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                  required={field.is_required}
                  disabled={isValidatingFace}
                />
              </label>
            </div>
            {faceValidationError && (
              <div className="p-3 bg-red-50 border border-[#942017] rounded-[8px]">
                <p className="text-sm text-[#942017] font-sans">{faceValidationError}</p>
              </div>
            )}
          </div>
        );

      case 'FILE':
        return (
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor={`file-${field.id}`}
              className="flex flex-col items-center justify-center w-full h-[120px] border-2 border-dashed border-[#D5D7DA] rounded-[8px] cursor-pointer bg-white hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-8 h-8 mb-2 text-[#717680]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-sm text-[#717680] font-sans">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                {field.help_text && (
                  <p className="text-xs text-[#717680] font-sans mt-1">
                    {field.help_text}
                  </p>
                )}
                {value && (
                  <p className="text-xs text-[#7D1A13] font-sans mt-2">
                    Selected: {value.name || 'File uploaded'}
                  </p>
                )}
              </div>
              <input
                id={`file-${field.id}`}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                required={field.is_required}
              />
            </label>
          </div>
        );

      default:
        return <div className="text-red-500">Unsupported field type: {field.field_type}</div>;
    }
  };

  return (
    <div className={field.width === 'half' ? 'w-full' : 'w-full'}>
      <label className={labelClasses}>
        {field.label}
        {field.is_required && <span className="text-[#942017] ml-1">*</span>}
      </label>
      {renderField()}
      {field.help_text && field.field_type !== 'PHOTO' && field.field_type !== 'FILE' && (
        <p className="mt-1 text-xs text-[#717680] font-sans">{field.help_text}</p>
      )}
      {error && <p className="mt-1 text-xs text-[#942017] font-sans">{error}</p>}
    </div>
  );
}
