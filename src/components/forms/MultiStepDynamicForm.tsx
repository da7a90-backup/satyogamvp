'use client';

import React, { useState } from 'react';
import { FormTemplate, FormAnswer } from '@/types/dynamic-form';
import { DynamicFormField } from './DynamicFormField';
import { submitForm } from '@/lib/dynamic-forms-api';
import { useRouter } from 'next/navigation';

interface MultiStepDynamicFormProps {
  formData: FormTemplate;
  memberDiscountEligible?: boolean;
  retreatId?: string;
}

export function MultiStepDynamicForm({ formData, memberDiscountEligible, retreatId }: MultiStepDynamicFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const sortedSections = [...formData.sections].sort((a, b) => a.order - b.order);
  const currentSection = sortedSections[currentStep];
  const totalSteps = sortedSections.length;

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
    // Clear error for this field
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    const sortedFields = [...currentSection.fields].sort((a, b) => a.order - b.order);

    sortedFields.forEach((field) => {
      if (field.is_required) {
        const value = formValues[field.id];
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          newErrors[field.id] = 'This field is required';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps - 1) {
        setCurrentStep((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCurrentStep()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Get token from localStorage (optional for non-authenticated submissions)
      const token = localStorage.getItem('token');

      // Convert form values to answers array
      const answers: FormAnswer[] = Object.entries(formValues).map(([fieldId, value]) => ({
        field_id: fieldId,
        value: typeof value === 'object' && value instanceof File ? undefined : value,
        // TODO: Handle file uploads properly (need to upload to storage first)
      }));

      const submissionData = {
        form_template_id: formData.id,
        answers,
        ...(memberDiscountEligible !== undefined && { member_discount_eligible: memberDiscountEligible }),
        ...(retreatId && { retreat_id: retreatId }),
      };

      await submitForm(formData.slug, submissionData, token || undefined);

      // Redirect to success page or dashboard
      router.push('/dashboard/user?message=Form submitted successfully');
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit form');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group fields by group_id
  const groupFields = () => {
    const sortedFields = [...currentSection.fields].sort((a, b) => a.order - b.order);
    const grouped: Array<typeof sortedFields> = [];
    let currentGroup: typeof sortedFields = [];
    let lastGroupId: string | null = null;

    sortedFields.forEach((field) => {
      if (field.group_id && field.group_id === lastGroupId) {
        currentGroup.push(field);
      } else {
        if (currentGroup.length > 0) {
          grouped.push(currentGroup);
        }
        currentGroup = [field];
        lastGroupId = field.group_id || null;
      }
    });

    if (currentGroup.length > 0) {
      grouped.push(currentGroup);
    }

    return grouped;
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-16 px-16">
      <div className="max-w-[1312px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-sans text-[32px] font-bold leading-[48px] text-black">
            {formData.title}
          </h1>
          {formData.subtitle && (
            <p className="font-sans text-[18px] leading-[27px] text-[#414651] mt-2">
              {formData.subtitle}
            </p>
          )}
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="font-sans text-[14px] text-[#717680]">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span className="font-sans text-[14px] text-[#717680]">
              {Math.round(((currentStep + 1) / totalSteps) * 100)}% complete
            </span>
          </div>
          <div className="w-full h-[8px] bg-[#E0E0E0] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#7D1A13] transition-all duration-300"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Two-column layout */}
        <div className="flex gap-8">
          {/* Left column: Form */}
          <div className="w-[640px]">
            <div className="bg-white border border-[#CBCBCB] rounded-[8px] p-8">
              <form onSubmit={handleSubmit}>
                {/* Section title */}
                <h2 className="font-sans text-[18px] font-bold leading-[27px] text-black mb-6">
                  {currentSection.title}
                </h2>

                {currentSection.description && (
                  <p className="font-sans text-[14px] leading-[21px] text-[#717680] mb-6">
                    {currentSection.description}
                  </p>
                )}

                {/* Fields */}
                <div className="space-y-6">
                  {groupFields().map((group, groupIndex) => {
                    if (group.length === 1) {
                      const field = group[0];
                      return (
                        <DynamicFormField
                          key={field.id}
                          field={field}
                          value={formValues[field.id]}
                          onChange={handleFieldChange}
                          error={errors[field.id]}
                        />
                      );
                    } else {
                      // Render grouped fields in same row
                      return (
                        <div key={`group-${groupIndex}`} className="flex gap-4">
                          {group.map((field) => (
                            <DynamicFormField
                              key={field.id}
                              field={field}
                              value={formValues[field.id]}
                              onChange={handleFieldChange}
                              error={errors[field.id]}
                            />
                          ))}
                        </div>
                      );
                    }
                  })}
                </div>

                {/* Error message */}
                {submitError && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-[8px]">
                    <p className="font-sans text-[14px] text-[#942017]">{submitError}</p>
                  </div>
                )}

                {/* Navigation buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t border-[#CBCBCB]">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className={`
                      px-6 py-3 rounded-[8px] font-sans font-semibold text-[16px]
                      ${
                        currentStep === 0
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-white border border-[#CBCBCB] text-[#414651] hover:bg-gray-50'
                      }
                      transition-colors
                    `}
                  >
                    Back
                  </button>

                  {currentStep < totalSteps - 1 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-6 py-3 bg-[#7D1A13] text-white rounded-[8px] font-sans font-semibold text-[16px] hover:bg-[#6a1610] transition-colors"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`
                        px-6 py-3 rounded-[8px] font-sans font-semibold text-[16px] text-white
                        ${
                          isSubmitting
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-[#7D1A13] hover:bg-[#6a1610]'
                        }
                        transition-colors
                      `}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Right column: Info/Image */}
          <div className="w-[640px]">
            <div className="bg-white border border-[#CBCBCB] rounded-[8px] p-8 sticky top-8">
              {currentSection.tagline && (
                <p className="font-sans text-[12px] font-semibold tracking-[0.1em] text-[#7D1A13] uppercase mb-4">
                  {currentSection.tagline}
                </p>
              )}

              {currentSection.image_url ? (
                <div className="w-full h-[400px] relative rounded-[8px] overflow-hidden bg-gray-100">
                  <img
                    src={currentSection.image_url}
                    alt={currentSection.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-sans text-[24px] font-bold leading-[36px] text-black">
                    {formData.title}
                  </h3>
                  {formData.description && (
                    <p className="font-sans text-[16px] leading-[24px] text-[#717680]">
                      {formData.description}
                    </p>
                  )}
                  <div className="pt-4 border-t border-[#CBCBCB]">
                    <p className="font-sans text-[14px] leading-[21px] text-[#717680]">
                      Complete all steps to submit your application. All required fields are marked with an asterisk (*).
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
