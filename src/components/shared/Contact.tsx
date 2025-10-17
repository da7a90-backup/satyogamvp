import React, { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

// TypeScript interfaces for data structure
interface ContactInfo {
  email: string;
  phone: string;
  address: string;
}

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'select' | 'textarea' | 'checkbox';
  placeholder?: string;
  required: boolean;
  options?: string[];
  rows?: number;
  gridColumn?: '1' | '2' | '1/3'; // For grid layout
  validationRules?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    errorMessage?: string;
  };
}

interface ContactSectionData {
  tagline: string;
  heading: string;
  description: string;
  contactInfo: ContactInfo;
  formFields: FormField[];
  privacyPolicyText: string;
  privacyPolicyLink: string;
  submitButtonText: string;
  successMessage: string;
  errorMessage: string;
}

interface ContactSectionProps {
  data: ContactSectionData;
}

export default function ContactSection({ data }: ContactSectionProps) {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initialData: Record<string, any> = {};
    data.formFields.forEach(field => {
      initialData[field.id] = field.type === 'checkbox' ? false : '';
    });
    return initialData;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (field: FormField, value: any): string | null => {
    if (field.required) {
      if (field.type === 'checkbox' && !value) {
        return `You must agree to the ${field.label.toLowerCase()}`;
      }
      if (field.type !== 'checkbox' && !value.trim()) {
        return `${field.label} is required`;
      }
    }

    if (value && field.validationRules) {
      const rules = field.validationRules;

      if (rules.minLength && value.length < rules.minLength) {
        return rules.errorMessage || `${field.label} must be at least ${rules.minLength} characters`;
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        return rules.errorMessage || `${field.label} must be no more than ${rules.maxLength} characters`;
      }

      if (rules.pattern) {
        const regex = new RegExp(rules.pattern);
        if (!regex.test(value)) {
          return rules.errorMessage || `Invalid ${field.label.toLowerCase()}`;
        }
      }
    }

    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Invalid email address';
      }
    }

    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    data.formFields.forEach(field => {
      const error = validateField(field, formData[field.id]);
      if (error) {
        newErrors[field.id] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitStatus('success');
        const resetData: Record<string, any> = {};
        data.formFields.forEach(field => {
          resetData[field.id] = field.type === 'checkbox' ? false : '';
        });
        setFormData(resetData);
        setErrors({});
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }));
    }
  };

  const renderField = (field: FormField) => {
    const hasError = !!errors[field.id];
    const errorBorderColor = hasError ? '#DC2626' : '#D5D7DA';

    const gridColumnStyle = field.gridColumn === '1/3' 
      ? { gridColumn: '1 / 3' } 
      : field.gridColumn === '2' 
      ? { gridColumn: '2' } 
      : { gridColumn: '1' };

    const fieldWrapper = (
      <div style={{ ...gridColumnStyle, marginBottom: '16px' }}>
        {field.type !== 'checkbox' && (
          <label
            style={{
              display: 'block',
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              color: '#000000',
              marginBottom: '8px'
            }}
          >
            {field.label} {field.required && <span style={{ color: '#7D1A13' }}>*</span>}
          </label>
        )}

        {field.type === 'text' && (
          <input
            type="text"
            value={formData[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: `1px solid ${errorBorderColor}`,
              borderRadius: '8px',
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '16px',
              background: '#FFFFFF',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        )}

        {field.type === 'email' && (
          <input
            type="email"
            value={formData[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: `1px solid ${errorBorderColor}`,
              borderRadius: '8px',
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '16px',
              background: '#FFFFFF',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        )}

        {field.type === 'select' && (
          <select
            value={formData[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: `1px solid ${errorBorderColor}`,
              borderRadius: '8px',
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '16px',
              background: '#FFFFFF',
              outline: 'none',
              boxSizing: 'border-box',
              cursor: 'pointer'
            }}
          >
            <option value="">{field.placeholder || 'Select one...'}</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}

        {field.type === 'textarea' && (
          <textarea
            value={formData[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={field.rows || 5}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: `1px solid ${errorBorderColor}`,
              borderRadius: '8px',
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '16px',
              background: '#FFFFFF',
              outline: 'none',
              resize: 'vertical',
              boxSizing: 'border-box'
            }}
          />
        )}

        {field.type === 'checkbox' && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <input
              type="checkbox"
              checked={formData[field.id] || false}
              onChange={(e) => handleInputChange(field.id, e.target.checked)}
              style={{
                width: '20px',
                height: '20px',
                marginTop: '2px',
                cursor: 'pointer'
              }}
            />
            <label
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                color: '#384250',
                cursor: 'pointer',
                flex: 1
              }}
              dangerouslySetInnerHTML={{ __html: field.placeholder || '' }}
            />
          </div>
        )}

        {errors[field.id] && (
          <span style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px', display: 'block' }}>
            {errors[field.id]}
          </span>
        )}
      </div>
    );

    return fieldWrapper;
  };

  return (
    <div
      style={{
        background: '#FAF8F1',
        padding: '80px 64px'
      }}
    >
      <div
        style={{
          maxWidth: '1312px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '80px',
          alignItems: 'start'
        }}
      >
        {/* Left Column - Contact Info */}
        <div>
          <p
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: '#9C7E27',
              marginBottom: '16px',
              margin: 0
            }}
          >
            {data.tagline}
          </p>

          <h2
            style={{
              fontFamily: 'Optima, serif',
              fontSize: '48px',
              fontWeight: 700,
              lineHeight: '1.2',
              color: '#000000',
              marginTop: '16px',
              marginBottom: '24px'
            }}
          >
            {data.heading}
          </h2>

          <p
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '16px',
              fontWeight: 400,
              lineHeight: '24px',
              color: '#384250',
              marginBottom: '40px'
            }}
          >
            {data.description}
          </p>

          {/* Contact Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Mail size={24} color="#000000" />
              <span
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '16px',
                  fontWeight: 400,
                  color: '#000000'
                }}
              >
                {data.contactInfo.email}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Phone size={24} color="#000000" />
              <span
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '16px',
                  fontWeight: 400,
                  color: '#000000'
                }}
              >
                {data.contactInfo.phone}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <MapPin size={24} color="#000000" style={{ marginTop: '2px' }} />
              <span
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '16px',
                  fontWeight: 400,
                  color: '#000000',
                  lineHeight: '24px'
                }}
              >
                {data.contactInfo.address}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column - Contact Form */}
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {data.formFields.map(field => renderField(field))}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '16px',
              background: isSubmitting ? '#9C7E27' : '#7D1A13',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '16px',
              fontWeight: 600,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1,
              transition: 'background 0.3s ease',
              marginTop: '8px'
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.background = '#6a1610';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.background = '#7D1A13';
              }
            }}
          >
            {isSubmitting ? 'Submitting...' : data.submitButtonText}
          </button>

          {/* Success/Error Messages */}
          {submitStatus === 'success' && (
            <div
              style={{
                marginTop: '16px',
                padding: '12px 16px',
                background: '#D1FAE5',
                border: '1px solid #10B981',
                borderRadius: '8px',
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: '14px',
                color: '#065F46'
              }}
            >
              {data.successMessage}
            </div>
          )}

          {submitStatus === 'error' && (
            <div
              style={{
                marginTop: '16px',
                padding: '12px 16px',
                background: '#FEE2E2',
                border: '1px solid #DC2626',
                borderRadius: '8px',
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: '14px',
                color: '#991B1B'
              }}
            >
              {data.errorMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}