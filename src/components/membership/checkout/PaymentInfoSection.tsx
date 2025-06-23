'use client';

// Types for form data
interface FormData {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    [key: string]: string | boolean;
  }
  
  interface Errors {
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
    [key: string]: string | undefined;
  }
  
  interface PaymentInfoSectionProps {
    formData: FormData;
    errors: Errors;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    processing: boolean;
  }
export default function PaymentInfoSection({
  formData,
  errors,
  onChange,
  processing
}: PaymentInfoSectionProps) {
  
  // Format card number with spaces after every 4 digits
  const formatCardNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: 'cardNumber',
        value: formattedValue
      }
    };
    
    onChange(syntheticEvent);
  };
  
  // Format expiry date as MM/YY
  const formatExpiryDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let formattedValue = value;
    
    if (value.length > 2) {
      formattedValue = `${value.substring(0, 2)}/${value.substring(2, 4)}`;
    }
    
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: 'expiryDate',
        value: formattedValue
      }
    };
    
    onChange(syntheticEvent);
  };
  
  // Allow only numbers for CVV
  const formatCVV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: 'cvv',
        value
      }
    };
    
    onChange(syntheticEvent);
  };
  
  return (
    <div className="mb-8">
      <h2 className="text-purple-600 text-lg font-medium mb-4">3. Payment information</h2>
      
      <div className="mb-4">
        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
          Card number <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <input
            id="cardNumber"
            type="text"
            value={formData.cardNumber}
            onChange={formatCardNumber}
            disabled={processing}
            className={`w-full pl-10 pr-3 py-2 border ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500`}
            placeholder="0000 0000 0000 0000"
            maxLength={19}
          />
        </div>
        {errors.cardNumber && <p className="mt-1 text-sm text-red-500">{errors.cardNumber}</p>}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
            Expiry <span className="text-red-500">*</span>
          </label>
          <input
            id="expiryDate"
            type="text"
            value={formData.expiryDate}
            onChange={formatExpiryDate}
            disabled={processing}
            className={`w-full px-3 py-2 border ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500`}
            placeholder="MM/YY"
            maxLength={5}
          />
          {errors.expiryDate && <p className="mt-1 text-sm text-red-500">{errors.expiryDate}</p>}
        </div>
        
        <div>
          <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
            CVV <span className="text-red-500">*</span>
          </label>
          <input
            id="cvv"
            type="text"
            value={formData.cvv}
            onChange={formatCVV}
            disabled={processing}
            className={`w-full px-3 py-2 border ${errors.cvv ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500`}
            placeholder="000"
            maxLength={4}
          />
          {errors.cvv && <p className="mt-1 text-sm text-red-500">{errors.cvv}</p>}
        </div>
      </div>
      
      <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              For this demo, you can enter any card details. No actual payment will be processed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}