'use client';

// Types for form data
interface FormData {
    firstName: string;
    lastName: string;
    country: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    acceptTerms: boolean;
    acceptNewsletter: boolean;
    [key: string]: string | boolean;
  }
  
  interface Errors {
    firstName?: string;
    lastName?: string;
    acceptTerms?: string;
    [key: string]: string | undefined;
  }
  
  interface InvoiceInfoSectionProps {
    formData: FormData;
    errors: Errors;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }

// List of countries for dropdown
const countries = [
  { code: 'CR', name: 'Costa Rica' },
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'MX', name: 'Mexico' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'ES', name: 'Spain' },
  { code: 'BR', name: 'Brazil' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'PE', name: 'Peru' },
];

export default function InvoiceInfoSection({
  formData,
  errors,
  onChange
}: InvoiceInfoSectionProps) {
  
  // Handle country selection
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const syntheticEvent = {
      target: {
        name: 'country',
        value: e.target.value,
        type: 'select'
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(syntheticEvent);
  };
  
  return (
    <div className="mb-8">
      <h2 className="text-purple-600 text-lg font-medium mb-4">4. Invoice information</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First name <span className="text-red-500">*</span>
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={onChange}
            className={`w-full px-3 py-2 border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500`}
            placeholder="First name"
          />
          {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>}
        </div>
        
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last name <span className="text-red-500">*</span>
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={onChange}
            className={`w-full px-3 py-2 border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500`}
            placeholder="Last name"
          />
          {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>}
        </div>
      </div>
      
      <div className="mb-4">
        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
          Country
        </label>
        <select
          id="country"
          value={formData.country}
          onChange={handleCountryChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 appearance-none"
        >
          <option value="">Select one...</option>
          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="mb-4">
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
          Street address
        </label>
        <input
          id="address"
          name="address"
          type="text"
          value={formData.address}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
          placeholder="Insert address"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
          City
        </label>
        <input
          id="city"
          name="city"
          type="text"
          value={formData.city}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
          placeholder="Insert city"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
            State / Province
          </label>
          <input
            id="state"
            name="state"
            type="text"
            value={formData.state}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
            placeholder="Insert state"
          />
        </div>
        
        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
            ZIP / Postal code
          </label>
          <input
            id="postalCode"
            name="postalCode"
            type="text"
            value={formData.postalCode}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
            placeholder="Insert postal code"
          />
        </div>
      </div>
      
      <div className="mt-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            name="acceptTerms"
            checked={formData.acceptTerms as boolean}
            onChange={onChange}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">
            I accept the <a href="/terms" className="text-purple-600 hover:text-purple-500">Terms of Service</a> for Sat Yoga and confirm that I have reviewed the <a href="/privacy" className="text-purple-600 hover:text-purple-500">Privacy Policy</a>.
          </span>
        </label>
        {errors.acceptTerms && <p className="mt-1 text-sm text-red-500">{errors.acceptTerms}</p>}
      </div>
      
      <div className="mt-2">
        <label className="flex items-center">
          <input
            type="checkbox"
            name="acceptNewsletter"
            checked={formData.acceptNewsletter as boolean}
            onChange={onChange}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">
            I accept receiving the newsletter.
          </span>
        </label>
      </div>
    </div>
  );
}