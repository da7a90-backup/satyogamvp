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

// Donation Tabs Component
interface DonationTabsProps {
  activeCategory: DonationCategory;
  onCategoryChange: (category: DonationCategory) => void;
}

const DonationTabs: React.FC<DonationTabsProps> = ({
  activeCategory,
  onCategoryChange,
}) => {
  // Get unique categories from options
  const categories: DonationCategory[] = ['Broadcasting', 'Solarization', 'Greenhouse & Seedbank', 'Off-Grid', 'Custom'];

  return (
    <div className="flex justify-center border-b border-gray-200">
      <div className="flex overflow-x-auto">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`whitespace-nowrap py-4 px-6 text-sm font-medium ${
              activeCategory === category
                ? 'border-b-2 border-indigo-600 text-gray-900'
                : 'border-b-2 border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
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
}

const DonationOptionDetail: React.FC<DonationOptionDetailProps> = ({
    option,
    amount,
    onAmountChange,
}) => {
    const { category, title, description } = option;
    const router = useRouter();
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Navigate to the payment page with donation details as URL parameters
      const params = new URLSearchParams({
        amount,
        category: option.category
      });
      
      router.push(`/donate/payment?${params.toString()}`);
    };
    
    // Format amount for display
    const formatAmount = (value: string): string => {
      // Remove any non-numeric characters except decimal point
      let formattedAmount = value.replace(/[^0-9.]/g, '');
      
      // Ensure only one decimal point
      const parts = formattedAmount.split('.');
      if (parts.length > 2) {
        formattedAmount = parts[0] + '.' + parts.slice(1).join('');
      }
      
      return formattedAmount;
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = formatAmount(e.target.value);
      onAmountChange(newValue);
    };
    
    return (
      <div className="grid md:grid-cols-2 gap-0 border border-gray-200 rounded-lg overflow-hidden">
        {/* Left side - Gray placeholder */}
        <div className="bg-gray-200 min-h-[300px] md:min-h-full relative">
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
        </div>
  
        {/* Right side - Content */}
        <div className="p-6">
          <div className="text-purple-600 font-medium mb-1">{category}</div>
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
          <p className="text-gray-700 mb-6">{description}</p>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Insert amount</label>
              <div className="flex">
                <div className="inline-flex items-center px-3 text-gray-500 border border-r-0 border-gray-300 rounded-l-md bg-gray-50">
                  <select 
                    className="h-full bg-transparent border-none focus:outline-none py-0 text-sm"
                    defaultValue="USD"
                  >
                    <option value="USD">USD</option>
                  </select>
                </div>
                <input
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  className="flex-grow px-3 py-3 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0.00"
                  inputMode="decimal"
                />
              </div>
            </div>
            
            {/* Preset amount buttons for Custom category */}
            {option.category === 'Custom' && (
              <div className="grid grid-cols-4 gap-2 mb-6">
                {[45, 50, 55, 60].map((presetAmount) => (
                  <button
                    key={presetAmount}
                    type="button"
                    onClick={() => onAmountChange(presetAmount.toFixed(2))}
                    className={`py-2 border rounded-md text-center text-sm font-medium transition-colors ${
                      parseFloat(amount) === presetAmount
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    ${presetAmount.toFixed(2)}
                  </button>
                ))}
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-gray-900 text-white rounded-md py-3 font-medium hover:bg-gray-800"
            >
              {option.category === 'Custom' ? 'Continue' : 'Accept'}
            </button>
          </form>
        </div>
      </div>
    );
};

// Donation Hero Component
interface DonationHeroProps {
  heading?: string;
  description?: string;
  onDonateClick?: () => void;
}

export const DonationHero: React.FC<DonationHeroProps> = ({
  heading = "Help Actualize a New Way of Life",
  description = "If you recognize the urgency to create a more spiritual and ecological culture, and if you want to be part of the process of human and planetary rebirth, please support this unique and vital project.",
  onDonateClick,
}) => {
  return (
    <section className="relative py-20 bg-gray-700 text-white text-center">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">{heading}</h1>
          <p className="mb-8">{description}</p>
          
          <button
            onClick={onDonateClick}
            className="inline-block bg-white text-gray-900 rounded-md px-6 py-2 font-medium hover:bg-gray-100"
          >
            Donate
          </button>
        </div>
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
    const [amount, setAmount] = useState('');
    
    // Get the current selected option
    const selectedOption = donationOptions.find(option => option.category === activeCategory) || donationOptions[0];
    
    // Set amount when category changes
    useEffect(() => {
      const option = donationOptions.find(opt => opt.category === activeCategory);
      if (option) {
        setAmount(option.defaultAmount.toFixed(2));
      }
    }, [activeCategory]);
    
    const handleCategoryChange = (category: DonationCategory) => {
      setActiveCategory(category);
    };
    
    return (
      <div>
        <h2 className="text-center text-2xl font-bold my-8">Title here</h2>
        <p className="text-center text-gray-600 mb-6 max-w-3xl mx-auto">
          Lorem ipsum dolor sit amet consectetur. Sagittis sapien et faucibus diam netus. Facilisis ac iaculis hendrerit cras molestiae elementis. Faucibus viae metus exsuciabo
          nunc sequum tempus pellentesque. Morbi comodo molestiae compreshen vel laorectus.
        </p>
        
        <DonationTabs
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
        
        <div className="max-w-5xl mx-auto mt-8 px-4">
          <DonationOptionDetail
            option={selectedOption}
            amount={amount}
            onAmountChange={setAmount}
          />
        </div>
        
        {/* Custom option as shown in wireframe */}
        {activeCategory === 'Custom' && (
          <div className="max-w-5xl mx-auto mt-16 px-4 text-center pb-8">
            <h3 className="text-center text-sm text-gray-500 mb-2">Custom</h3>
            <h2 className="text-3xl font-bold mb-4">Donate to the general fund</h2>
            <p className="max-w-3xl mx-auto mb-8 text-gray-600">
              We will continue to capture, produce, archive, and disseminate this transformative wisdom that has the power to change our collective destiny. This requires improving the quality of our media and broadcasting infrastructure to ensure our long-term connectivity: upgrading our cameras, microphones, mixers and editing equipment, fiber optic cables, hard drives, and storage capacities.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              {[45, 50, 55, 60].map((presetAmount) => (
                <button
                  key={presetAmount}
                  type="button"
                  className="py-2 px-4 border rounded-md text-center text-sm font-medium transition-colors border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  ${presetAmount.toFixed(2)}
                </button>
              ))}
            </div>
            
            <div className="flex justify-center items-center gap-4 max-w-sm mx-auto">
              <select className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm">
                <option value="USD">USD</option>
              </select>
              <input 
                type="text" 
                placeholder="Type your amount"
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
              />
              <div className="whitespace-nowrap text-sm">One time</div>
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium">
                Accept
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

// Export page components
export const FriendOfSatYogaPage: React.FC = () => {
  const router = useRouter();
  
  const handleDonateClick = () => {
    // Scroll to donation form
    const donationSection = document.getElementById('donation-section');
    if (donationSection) {
      donationSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  return (
    <div className="min-h-screen">
      <DonationHero onDonateClick={handleDonateClick} />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Become a friend of Sat Yoga</h2>
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
      </div>
      
      <div id="donation-section" className="bg-white py-16">
        <DonationPage />
      </div>
      
      {/* Quote at bottom of page */}
      <div className="bg-gray-700 text-white text-center py-12">
        <div className="container mx-auto px-4">
          <p className="max-w-3xl mx-auto italic">
            The joy of sharing and serving, living in simplicity, brings abundance. Help us demonstrate solutions that can be emulated globally as we restore our harmony with Nature.
          </p>
        </div>
      </div>
    </div>)
  };