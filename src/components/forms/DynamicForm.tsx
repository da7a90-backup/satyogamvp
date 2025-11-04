'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FormTemplate, FormQuestion, getFormBySlug, submitForm, groupQuestionsByPage, getTotalPages } from '@/lib/form-api';

interface DynamicFormProps {
  formSlug: string;
}

export function DynamicForm({ formSlug }: DynamicFormProps) {
  const router = useRouter();

  const [formTemplate, setFormTemplate] = useState<FormTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    async function loadForm() {
      try {
        const form = await getFormBySlug(formSlug);
        setFormTemplate(form);
      } catch (error: any) {
        console.error('Failed to load form:', error);
        alert(error.message || 'Failed to load form');
      } finally {
        setLoading(false);
      }
    }

    loadForm();
  }, [formSlug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (!formTemplate) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Form not found</h2>
          <p className="mt-2 text-gray-600">The requested form could not be loaded.</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (successMessage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-green-600 text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
          <p className="text-gray-600">{successMessage}</p>
        </div>
      </div>
    );
  }

  const questionsByPage = groupQuestionsByPage(formTemplate.questions);
  const totalPages = getTotalPages(formTemplate.questions);
  const currentQuestions = questionsByPage[currentPage] || [];

  const validatePage = (): boolean => {
    const newErrors: Record<string, string> = {};

    currentQuestions.forEach(question => {
      if (question.is_required && !answers[question.id]) {
        newErrors[question.id] = 'This field is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validatePage()) {
      setCurrentPage(prev => Math.min(prev + 1, totalPages));
    }
  };

  const handlePrevious = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validatePage()) return;

    setSubmitting(true);
    try {
      await submitForm({
        form_template_id: formTemplate.id,
        answers,
      });

      setSuccessMessage(formTemplate.success_message || 'Form submitted successfully');

      if (formTemplate.success_redirect) {
        setTimeout(() => router.push(formTemplate.success_redirect!), 2000);
      }
    } catch (error: any) {
      alert(error.message || 'Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question: FormQuestion) => {
    const value = answers[question.id] || '';
    const error = errors[question.id];

    const updateAnswer = (newValue: any) => {
      setAnswers(prev => ({ ...prev, [question.id]: newValue }));
      if (error) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[question.id];
          return newErrors;
        });
      }
    };

    // Section heading
    if (question.section_heading) {
      return (
        <div key={`section-${question.id}`} className="col-span-full mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{question.section_heading}</h3>
        </div>
      );
    }

    // Heading (not a question)
    if (question.question_type === 'heading') {
      return (
        <div key={question.id} className="col-span-full">
          <h3 className="text-xl font-bold text-gray-900">{question.question_text}</h3>
          {question.description && (
            <p className="mt-2 text-sm text-gray-600">{question.description}</p>
          )}
        </div>
      );
    }

    // Paragraph (informational text)
    if (question.question_type === 'paragraph') {
      return (
        <div key={question.id} className="col-span-full">
          <p className="text-gray-700">{question.question_text}</p>
        </div>
      );
    }

    const inputClass = `w-full px-[14px] py-[10px] border border-[#D5D7DA] bg-white rounded-lg shadow-[0px_1px_2px_rgba(10,13,18,0.05)] text-base leading-6 text-[#717680] placeholder:text-[#717680] focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent ${error ? 'border-red-500' : ''}`;
    const labelClass = "block text-sm font-medium leading-5 text-[#414651]";
    const descriptionClass = "text-sm leading-5 text-[#535862] mt-1.5";

    return (
      <div key={question.id} className="space-y-1.5">
        <div className="flex items-start gap-0.5">
          <label htmlFor={question.id} className={labelClass}>
            {question.question_text}
          </label>
          {question.is_required && <span className="text-[#942017] text-sm font-medium">*</span>}
        </div>
        {question.description && (
          <p className={descriptionClass}>{question.description}</p>
        )}

        {/* Text Input */}
        {question.question_type === 'text' && (
          <input
            id={question.id}
            type="text"
            value={value}
            onChange={(e) => updateAnswer(e.target.value)}
            placeholder={question.placeholder}
            className={inputClass}
          />
        )}

        {/* Email Input */}
        {question.question_type === 'email' && (
          <input
            id={question.id}
            type="email"
            value={value}
            onChange={(e) => updateAnswer(e.target.value)}
            placeholder={question.placeholder || 'email@example.com'}
            className={inputClass}
          />
        )}

        {/* Tel Input */}
        {question.question_type === 'tel' && (
          <input
            id={question.id}
            type="tel"
            value={value}
            onChange={(e) => updateAnswer(e.target.value)}
            placeholder={question.placeholder || '+1234567890'}
            className={inputClass}
          />
        )}

        {/* Date Input */}
        {question.question_type === 'date' && (
          <input
            id={question.id}
            type="date"
            value={value}
            onChange={(e) => updateAnswer(e.target.value)}
            className={inputClass}
          />
        )}

        {/* Number Input */}
        {question.question_type === 'number' && (
          <input
            id={question.id}
            type="number"
            value={value}
            onChange={(e) => updateAnswer(e.target.value)}
            placeholder={question.placeholder}
            className={inputClass}
          />
        )}

        {/* Textarea */}
        {question.question_type === 'textarea' && (
          <textarea
            id={question.id}
            value={value}
            onChange={(e) => updateAnswer(e.target.value)}
            placeholder={question.placeholder}
            rows={5}
            className={`${inputClass} resize-y`}
          />
        )}

        {/* Radio Buttons */}
        {question.question_type === 'radio' && question.options && (
          <div className="space-y-3 mt-2">
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="radio"
                  id={`${question.id}-${index}`}
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => updateAnswer(e.target.value)}
                  className="w-4 h-4 text-[#7D1A13] border-[#D5D7DA] focus:ring-[#7D1A13]"
                />
                <label htmlFor={`${question.id}-${index}`} className="text-sm leading-5 text-[#414651]">
                  {option}
                </label>
              </div>
            ))}
          </div>
        )}

        {/* Checkboxes */}
        {question.question_type === 'checkbox' && question.options && (
          <div className="space-y-3 mt-2">
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={`${question.id}-${index}`}
                  checked={Array.isArray(value) && value.includes(option)}
                  onChange={(e) => {
                    const current = Array.isArray(value) ? value : [];
                    if (e.target.checked) {
                      updateAnswer([...current, option]);
                    } else {
                      updateAnswer(current.filter((v: string) => v !== option));
                    }
                  }}
                  className="w-4 h-4 text-[#7D1A13] border-[#D5D7DA] rounded focus:ring-[#7D1A13]"
                />
                <label htmlFor={`${question.id}-${index}`} className="text-sm leading-5 text-[#414651]">
                  {option}
                </label>
              </div>
            ))}
          </div>
        )}

        {/* Dropdown */}
        {question.question_type === 'dropdown' && question.options && (
          <select
            id={question.id}
            value={value}
            onChange={(e) => updateAnswer(e.target.value)}
            className={inputClass}
          >
            <option value="">Select an option</option>
            {question.options.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        )}

        {/* File Upload */}
        {question.question_type === 'file' && (
          <input
            id={question.id}
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                // TODO: Handle file upload to storage
                updateAnswer(file.name);
              }
            }}
            accept={question.allowed_file_types?.join(',')}
            className={inputClass}
          />
        )}

        {error && <p className="text-sm leading-5 text-red-600 mt-1.5">{error}</p>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-16 px-16">
      <div className="max-w-[1312px] mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-16 text-black font-bold"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>

        {/* Two Column Layout */}
        <div className="flex gap-8">
          {/* Left Column - Progress Sidebar */}
          <div className="w-[640px] flex flex-col gap-2">
            {/* Progress Card */}
            <div className="bg-white border border-[#D4D4D4] p-8">
              <div className="space-y-8">
                <div className="space-y-2">
                  <h2 className="text-[22px] font-bold leading-[130%] text-black">
                    {formTemplate.title}
                  </h2>
                  <div className="w-full h-1 bg-[#EEEEEE] relative">
                    <div
                      className="absolute left-0 top-0 h-full bg-black transition-all duration-300"
                      style={{ width: `${(currentPage / totalPages) * 100}%` }}
                    />
                  </div>
                  <p className="text-base leading-[150%] text-black">
                    Step {currentPage} of {totalPages}
                  </p>
                </div>
              </div>
            </div>

            {/* Form Information Card */}
            <div className="bg-white border border-[#D1CFC9] p-6">
              <div className="space-y-12">
                <div className="space-y-2">
                  <p className="text-xs font-bold leading-[130%] tracking-[0.04em] uppercase text-[#767676]">
                    APPLICATION FORM
                  </p>
                  <h3 className="text-[32px] font-bold leading-[130%] text-black">
                    {formTemplate.name}
                  </h3>
                </div>
                <div className="space-y-6">
                  {formTemplate.description && (
                    <p className="text-gray-700">{formTemplate.description}</p>
                  )}
                  {formTemplate.introduction && (
                    <p className="text-gray-700">{formTemplate.introduction}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form Content */}
          <div className="flex-1">
            <div className="bg-white border border-[#D4D4D4] p-8">
              <div className="space-y-8">
                {/* Section Title */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-black">
                    {currentQuestions[0]?.section_heading || `Page ${currentPage}`}
                  </h3>
                </div>

                {/* Form Fields */}
                <div className="space-y-6">
                  {currentQuestions.map(renderQuestion)}
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-end mt-4 gap-4">
              {currentPage > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-[18px] py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-[6px] font-semibold"
                >
                  Previous
                </button>
              )}

              {currentPage < totalPages ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-[18px] py-3 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6B150F] shadow-[0px_1px_2px_rgba(16,24,40,0.05),inset_0px_0px_0px_1px_rgba(10,13,18,0.18),inset_0px_-2px_0px_rgba(10,13,18,0.05)] flex items-center gap-[6px] font-semibold"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-[18px] py-3 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6B150F] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0px_1px_2px_rgba(16,24,40,0.05),inset_0px_0px_0px_1px_rgba(10,13,18,0.18),inset_0px_-2px_0px_rgba(10,13,18,0.05)] font-semibold"
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
