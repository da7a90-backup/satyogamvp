'use client';

interface DonationSectionProps {
  donationAmount: string;
  onChange: (amount: string) => void;
}

export default function DonationSection({
  donationAmount,
  onChange
}: DonationSectionProps) {
  // Predefined donation amounts
  const predefinedAmounts = ['45.00', '50.00', '55.00', '60.00'];
  
  // For custom amount input
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove any non-numeric characters except decimal point
    const formattedAmount = e.target.value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = formattedAmount.split('.');
    if (parts.length > 2) {
      const sanitizedAmount = parts[0] + '.' + parts.slice(1).join('');
      onChange(sanitizedAmount);
      return;
    }
    
    onChange(formattedAmount);
  };
  
  // For predefined amount selection
  const handlePredefinedAmount = (amount: string) => {
    onChange(amount);
  };
  
  // Format currency for display
  const formatCurrency = (value: string) => {
    if (!value) return '$0.00';
    
    try {
      const numericValue = parseFloat(value);
      return `$${numericValue.toFixed(2)}`;
    } catch {
      return '$0.00';
    }
  };
  
  return (
    <div className="mb-8">
      <h2 className="text-purple-600 text-lg font-medium mb-4">5. Donate to the general fund</h2>
      
      <p className="text-gray-700 mb-4">
        We will continue to capture, produce, archive, and disseminate this transformative wisdom 
        that has the power to change our collective destiny. This requires improving the quality of our 
        media and broadcasting infrastructure to ensure our long-term connectivity: upgrading our 
        cameras, microphones, mixers and editing equipment, fiber optic cables, hard drives, and 
        storage capacities.
      </p>
      
      {/* Predefined amounts */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {predefinedAmounts.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => handlePredefinedAmount(amount)}
            className={`py-2 border rounded-md text-center text-sm font-medium transition-colors ${
              donationAmount === amount
                ? 'bg-gray-900 text-white border-gray-900'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            ${amount}
          </button>
        ))}
      </div>
      
      {/* Custom amount */}
      <div className="flex items-center mb-4">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="px-4 text-sm text-gray-500">Or</span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>
      
      <div className="flex items-center">
        <div className="relative flex-grow">
          <select 
            className="absolute left-0 top-0 h-full py-0 pl-3 pr-7 bg-transparent border-none focus:outline-none text-gray-700"
            defaultValue="USD"
          >
            <option value="USD">USD</option>
          </select>
          <input
            type="text"
            value={donationAmount}
            onChange={handleAmountChange}
            className="w-full pl-16 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
            placeholder="Type your amount"
            inputMode="decimal"
          />
        </div>
        
        <select 
          className="ml-2 px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
          defaultValue="one-time"
        >
          <option value="one-time">One time</option>
        </select>
        
        <button
          type="button"
          onClick={() => onChange(donationAmount || '0')}
          className="ml-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Accept
        </button>
      </div>
    </div>
  );
}