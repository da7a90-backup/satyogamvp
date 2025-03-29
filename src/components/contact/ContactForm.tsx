'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  topic: string;
  message: string;
  privacyPolicy: boolean;
}

interface FormDataErr {
  firstName: string;
  lastName: string;
  email: string;
  topic: string;
  message: string;
  privacyPolicy: string;
}

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    topic: '',
    message: '',
    privacyPolicy: false,
  });
  
  const [errors, setErrors] = useState<Partial<FormDataErr>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  // List of topic options for the dropdown
  const topicOptions = [
    'General Inquiry',
    'Retreats',
    'Membership',
    'Online Courses',
    'Donation',
    'Other',
  ];
  
  const validateForm = (): boolean => {
    const newErrors: Partial<FormDataErr> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    
    if (!formData.privacyPolicy) {
      newErrors.privacyPolicy = 'You must agree to our privacy policy';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // In a real implementation, you would send the form data to your API
      // const response = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(formData),
      // });
      
      // if (!response.ok) {
      //   throw new Error('Failed to submit form');
      // }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form after successful submission
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        topic: '',
        message: '',
        privacyPolicy: false,
      });
      
      setSubmitSuccess(true);
    } catch (error) {
      setSubmitError('There was an error submitting your message. Please try again later.');
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (submitSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <svg className="w-12 h-12 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <h3 className="text-xl font-bold mb-2">Thank You!</h3>
        <p className="text-gray-700 mb-4">
          Your message has been sent successfully. We'll get back to you as soon as possible.
        </p>
        <button
          onClick={() => setSubmitSuccess(false)}
          className="text-purple-600 font-medium hover:text-purple-800"
        >
          Send another message
        </button>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form error message */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {submitError}
        </div>
      )}
      
      {/* First name and Last name (side by side) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              errors.firstName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="First name"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              errors.lastName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Last name"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
          )}
        </div>
      </div>
      
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="you@company.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email}</p>
        )}
      </div>
      
      {/* Topic */}
      <div>
        <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
          Choose a topic
        </label>
        <div className="relative">
          <select
            id="topic"
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md appearance-none bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="" disabled>Select one...</option>
            {topicOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={6}
          className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
            errors.message ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Leave us a message..."
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-500">{errors.message}</p>
        )}
      </div>
      
      {/* Privacy Policy */}
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="privacyPolicy"
            name="privacyPolicy"
            type="checkbox"
            checked={formData.privacyPolicy}
            onChange={handleCheckboxChange}
            className={`h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded ${
              errors.privacyPolicy ? 'border-red-500' : ''
            }`}
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="privacyPolicy" className="text-gray-700">
            You agree to our friendly <Link href="/privacy-policy" className="text-purple-600 hover:text-purple-800">privacy policy</Link>.
          </label>
          {errors.privacyPolicy && (
            <p className="mt-1 text-sm text-red-500">{errors.privacyPolicy}</p>
          )}
        </div>
      </div>
      
      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full bg-gray-900 text-white py-3 px-4 rounded-md font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 ${
            isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  );
};

export default ContactForm;