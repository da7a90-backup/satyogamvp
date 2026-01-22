'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Common Types
type DonationCategory = 'Broadcasting' | 'Solarization' | 'Greenhouse & Seedbank' | 'Off-Grid' | 'Custom';

interface DonationOption {
  id: string;
  category: DonationCategory;
  title: string;
  description: string;
  defaultAmount: number;
  imageUrl?: string;
}

export const donationOptions: DonationOption[] = [
    {
      id: 'broadcasting',
      category: 'Broadcasting',
      title: 'Raise $45,00',
      description: 'We will continue to capture, produce, archive, and disseminate this transformative wisdom that has the power to change our collective destiny. This requires improving the quality of our media and broadcasting infrastructure to ensure our long-term connectivity: upgrading our cameras, microphones, mixers and editing equipment, fiber optic cables, hard drives, and storage capacities.',
      defaultAmount: 45,
    },
    {
      id: 'solarization',
      category: 'Solarization',
      title: 'Raise $100,00',
      description: 'The solarization of our community buildings is fundamental in our transition to longer-term sustainability. It will allow us to continue broadcasting from the ashram despite any instabilities and fluctuations in the grid, and to receive visitors for as long as possible while maintaining general operations and daily activities in essential locations, such as the lodge and student housing center.',
      defaultAmount: 100,
    },
    {
      id: 'greenhouse',
      category: 'Greenhouse & Seedbank',
      title: 'Raise $55,00',
      description: 'The ashram\'s greenhouse and seed bank project is the foundation of our community\'s efforts to ensure food security into the future, so that we can continue to serve as stewards of this abundant and sacred land here in rural Costa Rica, and share this information with other communities and with those that can visit us here.',
      defaultAmount: 55,
    },
    {
      id: 'offgrid',
      category: 'Off-Grid',
      title: 'Raise $75,00',
      description: 'Support our off-grid initiatives to create a self-sustainable community model that can thrive independently of external systems. This includes developing water collection systems, sustainable energy solutions, and implementing permaculture principles throughout our campus.',
      defaultAmount: 75,
    },
    {
      id: 'custom',
      category: 'Custom',
      title: 'Donate to the general fund',
      description: 'We will continue to capture, produce, archive, and disseminate this transformative wisdom that has the power to change our collective destiny. This requires improving the quality of our media and broadcasting infrastructure to ensure our long-term connectivity: upgrading our cameras, microphones, mixers and editing equipment, fiber optic cables, hard drives, and storage capacities.',
      defaultAmount: 45,
    },
  ];

// DonationAmountInput Component
interface DonationAmountInputProps {
  value: string;
  onChange: (value: string) => void;
  currency?: string;
  presetAmounts?: number[];
  showPresets?: boolean;
  className?: string;
}

const DonationAmountInput: React.FC<DonationAmountInputProps> = ({
  value,
  onChange,
  currency = 'USD',
  presetAmounts = [45, 50, 55, 60],
  showPresets = false,
  className = '',
}) => {
  const formatAmount = (amount: string): string => {
    // Remove any non-numeric characters except decimal point
    const formattedAmount = amount.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = formattedAmount.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    
    return formattedAmount;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = formatAmount(e.target.value);
    onChange(newValue);
  };

  const handlePresetClick = (amount: number) => {
    onChange(amount.toString());
  };

  return (
    <div className={className}>
      <div className="flex">
        <div className="inline-flex items-center px-3 text-gray-500 border border-r-0 border-gray-300 rounded-l-md bg-gray-50 text-sm">
          <select 
            className="h-full bg-transparent border-none focus:outline-none py-0"
            value={currency}
          >
            <option value="USD">USD</option>
          </select>
        </div>
        <input
          type="text"
          value={value}
          onChange={handleChange}
          className="flex-grow px-3 py-3 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="0.00"
          inputMode="decimal"
        />
      </div>

      {showPresets && (
        <div className="grid grid-cols-4 gap-2 mt-4">
          {presetAmounts.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => handlePresetClick(amount)}
              className={`py-2 border rounded-md text-center text-sm font-medium transition-colors ${
                value === amount.toString()
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              ${amount.toFixed(2)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Donation Tabs Component
interface DonationTabsProps {
  options: DonationOption[];
  activeCategory: DonationCategory;
  onCategoryChange: (category: DonationCategory) => void;
}

const DonationTabs: React.FC<DonationTabsProps> = ({
  options,
  activeCategory,
  onCategoryChange,
}) => {
  // Get unique categories from options
  const categories = Array.from(
    new Set(options.map((option) => option.category))
  );

  return (
    <div className="border-b border-gray-200 mb-6">
      <div className="flex overflow-x-auto">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`whitespace-nowrap py-4 px-6 font-medium border-b-2 transition-colors ${
              activeCategory === category
                ? 'border-purple-600 text-gray-900'
                : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

// Donation Option Detail Component
interface DonationOptionDetailProps {
  option: DonationOption;
  amount: string;
  onAmountChange: (value: string) => void;
  onContinue: () => void;
}

const DonationOptionDetail: React.FC<DonationOptionDetailProps> = ({
    option,
    amount,
    onAmountChange,
    onContinue,
  }) => {
    const { category, title, description, imageUrl } = option;
    const router = useRouter();
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Instead of calling onContinue, we'll navigate to the payment page
      // with the donation details as URL parameters
      const params = new URLSearchParams({
        amount,
        category: option.category
      });
      
      router.push(`/donate/payment?${params.toString()}`);
    };
    
    return (
      <div className="grid md:grid-cols-2 gap-6 border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-200 min-h-[300px] md:min-h-full relative">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg 
                className="h-24 w-24 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1} 
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
            </div>
          )}
        </div>
  
        <div className="p-6">
          <p className="text-purple-600 font-medium mb-2">{category}</p>
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
          <p className="text-gray-700 mb-6">{description}</p>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block font-medium mb-2">Insert amount</label>
              <DonationAmountInput 
                value={amount} 
                onChange={onAmountChange} 
              />
            </div>
            
            {option.category === 'Custom' && (
              <div className="grid grid-cols-4 gap-2 mb-6">
                <button
                  type="button"
                  onClick={() => onAmountChange('45.00')}
                  className={`py-2 border rounded-md text-center text-sm font-medium transition-colors ${
                    amount === '45.00'
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  $45.00
                </button>
                <button
                  type="button"
                  onClick={() => onAmountChange('50.00')}
                  className={`py-2 border rounded-md text-center text-sm font-medium transition-colors ${
                    amount === '50.00'
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  $50.00
                </button>
                <button
                  type="button"
                  onClick={() => onAmountChange('55.00')}
                  className={`py-2 border rounded-md text-center text-sm font-medium transition-colors ${
                    amount === '55.00'
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  $55.00
                </button>
                <button
                  type="button"
                  onClick={() => onAmountChange('60.00')}
                  className={`py-2 border rounded-md text-center text-sm font-medium transition-colors ${
                    amount === '60.00'
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  $60.00
                </button>
              </div>
            )}
            
            <button
              type="submit"
              className={`w-full bg-gray-900 text-white rounded-md py-3 font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900`}
            >
              {option.category === 'Custom' ? 'Continue' : 'Accept'}
            </button>
          </form>
        </div>
      </div>
    );
  };

// Donation Payment Form Component
interface DonationPaymentFormProps {
  amount: string;
  category: DonationCategory;
  onCancel: () => void;
  onSuccess: () => void;
}

const DonationPaymentForm: React.FC<DonationPaymentFormProps> = ({
  amount,
  category,
  onCancel,
  onSuccess,
}) => {
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      // Process payment logic would go here
      await new Promise(resolve => setTimeout(resolve, 1500));
      onSuccess();
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };
  
  // Format expiry date as MM/YY
  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return v;
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="md:w-1/2">
        <h2 className="text-xl font-bold mb-4">Donate</h2>
        <p className="text-gray-700 mb-6">
          If you recognize the urgency to create a more spiritual and ecological culture, and if you want to be part of the process of human and planetary rebirth, please support this unique and vital project. Enter your donation amount:
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="amount">
              Insert amount <span className="text-red-500">*</span>
            </label>
            <DonationAmountInput
              value={amount}
              onChange={() => {}}  // Read-only in payment form
              className="mb-4"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="cardholder">
              Card holder name <span className="text-red-500">*</span>
            </label>
            <input
              id="cardholder"
              type="text"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              placeholder="Inser name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="cardnumber">
              Card number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-0 top-0 pl-3 h-full flex items-center">
                <svg className="h-5 w-8 text-gray-400" viewBox="0 0 36 24" fill="none">
                  <rect width="36" height="24" rx="4" fill="#1434CB" />
                  <path d="M18.12 10.63L16.38 17.39H14.39L16.13 10.63H18.12ZM27.25 14.75L28.37 12.04L28.93 14.75H27.25ZM29.4 17.39H31.23L29.66 10.63H27.95C27.51 10.63 27.14 10.89 27 11.31L24.17 17.39H26.18L26.55 16.37H29.08L29.4 17.39ZM23.99 15.37C24 13.5 21.22 13.38 21.24 12.47C21.25 12.18 21.53 11.87 22.13 11.79C22.43 11.75 23.29 11.72 24.27 12.17L24.64 10.58C24.06 10.37 23.33 10.17 22.42 10.17C20.52 10.17 19.16 11.2 19.15 12.7C19.14 13.81 20.12 14.42 20.86 14.79C21.62 15.17 21.87 15.42 21.87 15.76C21.86 16.29 21.25 16.52 20.69 16.53C19.7 16.54 19.13 16.27 18.67 16.06L18.29 17.7C18.75 17.91 19.62 18.1 20.52 18.11C22.53 18.11 23.98 17.09 23.99 15.37ZM15.44 10.63L12.18 17.39H10.16L8.57 11.93C8.47 11.56 8.38 11.43 8.1 11.31C7.64 11.1 6.86 10.91 6.18 10.79L6.24 10.63H9.49C9.98 10.63 10.43 10.97 10.55 11.5L11.35 15.24L13.43 10.63H15.44Z" fill="white" />
                </svg>
              </div>
              <input
                id="cardnumber"
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="Placeholder"
                className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                maxLength={19}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="expiry">
                Expiry
              </label>
              <input
                id="expiry"
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/YY"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                maxLength={5}
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="cvv">
                CVV
              </label>
              <input
                id="cvv"
                type="text"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                placeholder=""
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                maxLength={4}
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="message">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Leave us a message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 h-32"
              required
            />
          </div>
          
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-white border border-gray-300 text-gray-700 rounded-md py-3 font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gray-900 text-white rounded-md py-3 font-medium hover:bg-gray-800 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Confirm payment'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="md:w-1/2 bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Products</h3>
        <div className="flex items-center justify-between py-4 border-b">
          <div className="flex items-center">
            <div className="bg-gray-200 w-12 h-12 mr-4 flex items-center justify-center rounded">
              <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-medium">Donation</span>
          </div>
          <span className="font-medium">${parseFloat(amount).toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center py-4">
          <span className="font-medium text-lg">Subtotal</span>
          <span className="font-medium">${(parseFloat(amount) + 10).toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center pt-4 pb-6 mb-6 border-b border-gray-200">
          <h3 className="text-xl font-bold">Total</h3>
          <span className="text-xl font-bold">${parseFloat(amount).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

// Donation Hero Component
interface DonationHeroProps {
  heading?: string;
  description?: string;
  backgroundImage?: string;
  onDonateClick?: () => void;
}

export const DonationHero: React.FC<DonationHeroProps> = ({
  heading = "Help Actualize a New Way of Life",
  description = "If you recognize the urgency to create a more spiritual and ecological culture, and if you want to be part of the process of human and planetary rebirth, please support this unique and vital project.",
  backgroundImage,
  onDonateClick,
}) => {
  return (
    <section className="relative py-20 bg-gray-800 text-white">
      {backgroundImage && (
        <div className="absolute inset-0 z-0">
          <Image 
            src={backgroundImage}
            alt="Donation background"
            fill
            className="object-cover opacity-30"
          />
        </div>
      )}
      
      <div className="container mx-auto px-4 relative z-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">{heading}</h1>
        <p className="text-lg max-w-2xl mx-auto mb-8">{description}</p>
        
        <button
          onClick={onDonateClick}
          className="inline-block bg-white text-gray-900 rounded-md px-6 py-3 font-medium hover:bg-gray-100"
        >
          Donate
        </button>
      </div>
    </section>
  );
};

// Main Donation Page Component
interface DonationPageProps {
  initialCategory?: DonationCategory;
  onSuccess?: () => void;
}

export const DonationPage: React.FC<DonationPageProps> = ({
    initialCategory = 'Broadcasting',
    onSuccess,
  }) => {
    const [activeCategory, setActiveCategory] = useState<DonationCategory>(initialCategory);
    const [amount, setAmount] = useState('45.00');
    
    // Get the current selected option
    const selectedOption = donationOptions.find(option => option.category === activeCategory) || donationOptions[0];
    
    // Set amount when category changes
    useEffect(() => {
      const option = donationOptions.find(opt => opt.category === activeCategory);
      if (option) {
        setAmount(option.defaultAmount.toFixed(2));
      }
    }, [activeCategory, donationOptions]);
    
    const handleCategoryChange = (category: DonationCategory) => {
      setActiveCategory(category);
    };
    
    return (
      <div className="container mx-auto px-4 py-8">
        <DonationTabs
          options={donationOptions}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
        
        <DonationOptionDetail
          option={selectedOption}
          amount={amount}
          onAmountChange={setAmount}
          onContinue={() => {}} // This is no longer used, but kept for interface compatibility
        />
      </div>
    );
  };

// Export page components
export const FriendOfSatYogaPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <DonationHero />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Become a friend of Sat Yoga</h2>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2">
              <p className="text-gray-700 mb-4">
                By contributing financially, you join a valued group of visionary leaders who are ensuring this new model of a peaceful world can be fully realized. You enable us to offer more scholarships to needy students, to reach out to more people within Costa Rica and throughout Latin America, and to guide more people to have better lives and raise their children to be healthy, awakened, and prepared for the future.
              </p>
              <p className="text-gray-700 mb-4">
                As a Friend of Sat Yoga, you will be directly benefiting the people of Costa Rica and the world as a whole. Right now, we have an urgent need for your assistance.
              </p>
              <p className="text-gray-700">
                If you wish to lend a hand in these difficult times, please contact Jagdish on (+506) 8705-0779 or email friendsupport@satyogainstitute.org to become a Friend of Sat Yoga program. We intend to offer special retreats, seminars, and consultation gatherings with our Friends on a regular basis. We hope you will join us.
              </p>
            </div>
            <div className="md:w-1/2">
              <Image
                src="/placeholder.png"
                alt="Sat Yoga Community"
                width={500}
                height={300}
                className="w-full h-auto rounded-lg object-cover"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <DonationPage />
        </div>
      </div>
    </div>
  );
};

// Export individual components for use in other pages
export { DonationAmountInput, DonationTabs, DonationOptionDetail, DonationPaymentForm };