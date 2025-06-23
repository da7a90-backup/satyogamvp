'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

// Types for membership plans
interface MembershipPlan {
  id: string;
  title: string;
  monthlyPrice: number;
  yearlyPrice: number;
  annualSavings: number;
  tagline: string;
  popular?: boolean;
  features: string[];
  specialFeatures?: Array<{
    text: string;
    bullets?: string[];
  }>;
  valueAddedFeature?: {
    text: string;
    value: string;
  };
  ctaText?: string;
  hasTrial?: boolean;
  trialDays?: number;
}

// Types for benefit
interface Benefit {
  icon: string;
  title: string;
  description: string;
}

// Types for feature details
interface FeatureDetail {
  id: string;
  title: string;
  description: string;
}

// Membership Plan Card Component
const MembershipPlanCard: React.FC<{
  plan: MembershipPlan;
  isMonthly: boolean;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}> = ({ plan, isMonthly, isSelected, onSelect }) => {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  
  const price = isMonthly ? plan.monthlyPrice : plan.yearlyPrice;
  const billingPeriod = isMonthly ? 'mo' : 'mo';
  const billingLabel = isMonthly 
    ? 'Billed Monthly' 
    : `Billed Annually (Save ${plan.annualSavings}$)`;
  
  const handleClick = () => {
    if (onSelect) {
      onSelect(plan.id);
    }
  };
  
  return (
    <div className={`bg-white rounded-lg border ${plan.popular ? 'border-purple-200' : 'border-gray-200'} overflow-hidden flex flex-col h-full relative ${isSelected ? 'ring-2 ring-purple-500' : ''}`}>
      {plan.popular && (
        <div className="bg-purple-100 text-purple-600 text-center text-sm font-medium py-1">
          Most recommended
        </div>
      )}
      
      {plan.hasTrial && (
        <div className="absolute top-2 right-2 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
          {plan.trialDays} days free trial
        </div>
      )}
      
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-lg font-medium text-purple-600 mb-1">{plan.title}</h3>
        <div className="mb-1">
          <span className="text-4xl font-bold">${price}</span>
          <span className="text-gray-500">/{billingPeriod}</span>
        </div>
        <div className="text-sm text-gray-500 mb-4">{billingLabel}</div>
        
        <div className="border-t border-gray-100 pt-4 mb-4">
          <p className="font-medium mb-2">{plan.tagline}</p>
        </div>
        
        <div className="mb-4">
          <p className="font-medium mb-2">Includes:</p>
          <div className="space-y-3">
            {plan.features.map((feature, index) => (
              <div key={index} className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
            
            {plan.specialFeatures && plan.specialFeatures.map((feature, index) => (
              <div key={`special-${index}`} className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <span className="text-sm text-gray-700">{feature.text}</span>
                  {feature.bullets && (
                    <ul className="ml-6 mt-1">
                      {feature.bullets.map((bullet, i) => (
                        <li key={i} className="text-xs text-gray-600 list-disc">
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
            
            {plan.valueAddedFeature && (
              <div className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <span className="text-sm text-purple-600 font-medium">{plan.valueAddedFeature.text}</span>
                  <span className="text-xs text-purple-500 block">{plan.valueAddedFeature.value}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-auto">
          <Link 
            href={isLoggedIn ? `/membership/checkout?plan=${plan.id}${isMonthly ? '&billing=monthly' : '&billing=yearly'}` : `/membership/register?plan=${plan.id}${isMonthly ? '&billing=monthly' : '&billing=yearly'}`}
            className="block w-full bg-purple-600 text-white text-center rounded-md py-3 font-medium hover:bg-purple-700"
            onClick={handleClick}
          >
            {plan.hasTrial ? 'Start free trial' : 'Sign up'}
          </Link>
          
          <button className="w-full text-sm text-gray-600 mt-3 hover:text-purple-600">
            More details
          </button>
        </div>
      </div>
    </div>
  );
};

// Feature Accordion Component
const FeatureAccordion: React.FC<{
  features: FeatureDetail[];
}> = ({ features }) => {
  const [openFeature, setOpenFeature] = useState<string | null>(null);
  
  const toggleFeature = (id: string) => {
    setOpenFeature(openFeature === id ? null : id);
  };
  
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-6">Details</h2>
      
      <div className="space-y-1">
        {features.map((feature) => (
          <div key={feature.id} className="border-b border-gray-100">
            <button
              className="w-full py-4 flex justify-between items-center text-left"
              onClick={() => toggleFeature(feature.id)}
            >
              <h3 className="text-lg font-medium">{feature.title}</h3>
              <svg
                className={`w-5 h-5 transform transition-transform ${openFeature === feature.id ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {openFeature === feature.id && (
              <div className="pb-4 text-gray-700">
                <p>{feature.description}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Not Ready Section Component
const NotReadySection: React.FC = () => {
  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h2 className="text-3xl font-bold mb-4">Not ready for membership?</h2>
            <p className="text-gray-700 mb-6">
              Sign up to explore our Free Library and gain access to exclusive content and a free meditation course.
            </p>
            <Link 
              href="/signup"
              className="inline-block bg-purple-600 text-white rounded-md px-6 py-3 font-medium hover:bg-purple-700"
            >
              Sign up for free
            </Link>
          </div>
          <div className="md:w-1/2">
            <div className="bg-gray-200 rounded-lg aspect-video relative">
              {/* Placeholder for image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Benefits Section Component
const BenefitsSection: React.FC<{
  benefits: Benefit[];
}> = ({ benefits }) => {
  return (
    <div className="bg-white py-16 border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-purple-600 text-sm font-medium mb-2">Membership</p>
          <h2 className="text-3xl font-bold mb-8">Join our online Wisdom School</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="bg-gray-200 w-16 h-16 mx-auto mb-4 rounded-md flex items-center justify-center">
                  {/* Placeholder for icon */}
                </div>
                <h3 className="font-bold mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Main image placeholder */}
        <div className="bg-gray-200 rounded-lg aspect-video w-full max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-full">
            <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Membership Page Client Component
export default function MembershipPageClient() {
  const [isMonthly, setIsMonthly] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  
  // Sample membership plans data
  const membershipPlans: MembershipPlan[] = [
    {
      id: 'gyani',
      title: 'Gyani',
      monthlyPrice: 20,
      yearlyPrice: 15,
      annualSavings: 60,
      tagline: 'Key to the Treasure House: Deep Teachings, Meditations & Community Connection',
      features: [
        'Custom dashboard available on your phone, tablet and desktop',
        'Exclusive Wisdom Library with 1,000+ publications',
        'New Weekly Teachings',
        'Shunyamurti Book Study',
        'Shunyamurti Recommendations to Deepen Your Knowledge',
        'Community Forum',
        'Live Sunday Group Meditation',
      ],
      specialFeatures: [
        {
          text: 'Exclusive Gyani Discounts',
          bullets: [
            '5% off Onsite Retreats',
            '10% off all Digital Products'
          ]
        }
      ],
      hasTrial: true,
      trialDays: 10,
      ctaText: 'Start free trial'
    },
    {
      id: 'pragyani',
      title: 'Pragyani',
      monthlyPrice: 100,
      yearlyPrice: 83,
      annualSavings: 200,
      tagline: 'Virtual Ashram Experience: Exclusive Teachings, Livestream Gatherings & Community Support',
      popular: true,
      features: [
        'Custom dashboard available on your phone, tablet and desktop',
        'Exclusive Wisdom Library with 1,000+ publications',
        'New Weekly Teachings',
        'Shunyamurti Book Study',
        'Shunyamurti Recommendations to Deepen Your Knowledge',
        'Community Forum',
        'Live Sunday Group Meditation',
        'Live Surprise Satsangs with Shunyamurti',
        'Live Sunday Study Group with Radha Ma',
        'Live Monthly Teaching Discussions',
        'Book Groups',
        'Pragyani Exclusive Teachings',
        'Study Group Review',
        'Ask Shunyamurti',
      ],
      specialFeatures: [
        {
          text: 'Your Questions Prioritized during ALL live events with Shunyamurti'
        },
        {
          text: 'Exclusive Pragyani Discounts',
          bullets: [
            '30% off all Digital Products',
            '10% off Onsite Retreats'
          ]
        }
      ],
      ctaText: 'Sign up'
    },
    {
      id: 'pragyani-plus',
      title: 'Pragyani+',
      monthlyPrice: 142,
      yearlyPrice: 142,
      annualSavings: 1170,
      tagline: 'Unlock the Ultimate Experience: Lifetime Retreats & Direct Access to Shunyamurti',
      features: [
        'Custom dashboard available on your phone, tablet and desktop',
        'Exclusive Wisdom Library with 1,000+ publications',
        'New Weekly Teachings',
        'Shunyamurti Book Study',
        'Shunyamurti Recommendations to Deepen Your Knowledge',
        'Community Forum',
        'Live Sunday Group Meditation',
        'Live Surprise Satsangs with Shunyamurti',
        'Live Sunday Study Group with Radha Ma',
        'Live Monthly Teaching Discussions',
        'Book Groups',
        'Pragyani Exclusive Teachings',
        'Study Group Review',
        'Ask Shunyamurti',
      ],
      specialFeatures: [
        {
          text: 'Your Questions Prioritized during ALL live events with Shunyamurti'
        },
        {
          text: 'Exclusive Pragyani Discounts',
          bullets: [
            '30% off all Digital Products',
            '10% off Onsite Retreats'
          ]
        }
      ],
      valueAddedFeature: {
        text: 'Lifetime Access to All Online Retreats',
        value: '(Valued at $1,970 per year)'
      },
      ctaText: 'Sign up'
    }
  ];
  
  // Sample feature details data
  const featureDetails: FeatureDetail[] = [
    {
      id: 'wisdom-library',
      title: 'Exclusive Wisdom Library with 1,000+ Publications',
      description: 'Gain access to an exclusive collection of full-length teachings not available on YouTube, guided meditations, Q&A sessions with Shunyamurti, and profound essays—specially selected and easily searchable to accelerate your spiritual awakening.'
    },
    {
      id: 'new-publications',
      title: 'New Publications Added Weekly',
      description: 'Stay engaged with fresh content added to the Wisdom Library every week, including full-length video teachings, audio recordings, transcripts, guided meditations, and insightful Q&A sessions with Shunyamurti.'
    },
    {
      id: 'book-study',
      title: 'Shunyamurti Book Study',
      description: 'Study Shunyamurti\'s books alongside the author himself, unraveling the intricate layers of meaning in The Dao of the Final Days. Further your exploration of the psychological dimensions of his teachings with Radha Ma, who leads an in-depth study of Coming Full Circle: The Secret of the Singularity, revealing its transformative insights.'
    },
    {
      id: 'recommendations',
      title: 'Recommendations to Deepen Your Knowledge',
      description: 'Take a peek into Shunyamurti\'s personal library and get recommendations on books to deepen your knowledge across a vast variety of topics. Follow along with the Ashram\'s studies and explore documentary films screened with the Sangha—each chosen to support your journey of higher knowledge and spiritual realization.'
    },
    {
      id: 'community-forum',
      title: 'Community Forum',
      description: 'Engage in deep, meaningful discussions with a global community of truth seekers. Share insights, ask questions, and express your creative spirit in an uplifting space dedicated to spiritual growth and exploration.'
    },
    {
      id: 'sunday-meditation',
      title: 'Live Sunday Group Meditation',
      description: 'Join the Sat Yoga Ashram Sangha every Sunday for a collective meditation that amplifies your energy field, deepens your inner stillness, and aligns your consciousness with the divine presence.'
    },
    {
      id: 'surprise-satsangs',
      title: 'Live Surprise Satsangs with Shunyamurti',
      description: 'Be present for spontaneous, live transmissions from Shunyamurti! You\'ll have the opportunity to join live teachings and Q&A sessions, receiving wisdom directly from the source.'
    },
    {
      id: 'study-group',
      title: 'Live Sunday Study Group with Radha Ma',
      description: 'Deepen your understanding of Shunyamurti\'s teachings with Radha Ma, who offers advanced explanations and guidance on integrating these profound insights into your spiritual practice.'
    },
    {
      id: 'teaching-discussions',
      title: 'Live Monthly Teaching Discussions',
      description: 'Join the Sat Yoga Teaching Team for an in-depth exploration of Shunyamurti\'s teachings. Each session begins with a selected video teaching or essay, serving as a springboard for profound study and discussion. Engage in meaningful dialogue and expand your understanding in a supportive group setting.'
    },
    {
      id: 'book-groups',
      title: 'Book Groups',
      description: 'Join Shunyamurti for fourteen transformative classes (each over 90 minutes long) as he unpacks and expands upon The Flight of the Garuda, a profound series of Dzogchen poems. Or explore the psychological and spiritual dimensions of Overcoming Narcissism in an illuminating 11-class series led by Radha Ma, offering deep insights and powerful tools for transformation.'
    },
    {
      id: 'exclusive-teachings',
      title: 'Pragyani Exclusive Teachings',
      description: 'Gain access to rare and advanced teachings designed for the most dedicated seekers. Immerse yourself in profound transmissions and become part of the spiritual renaissance unfolding at the Ashram.'
    },
    {
      id: 'study-review',
      title: 'Study Group Review',
      description: 'Embark on a profound journey through some of Shunyamurti\'s most essential yet rarely explored teachings. Radha Ma carefully revisits and unpacks these classical transmissions. With over 22 classes, this series delves into four key units: Transforming the Imaginary, Cultivating the Will, Potencies, and The Structure of Experience.'
    },
    {
      id: 'ask-shunyamurti',
      title: 'Ask Shunyamurti',
      description: 'A dedicated space for Pragyani and Pragyani+ members to submit personal questions via email and receive direct, insightful responses from Shunyamurti, offering guidance and clarity on the spiritual path.'
    }
  ];
  
  // Sample benefits data
  const benefits: Benefit[] = [
    {
      icon: 'globe',
      title: 'Join a Global Community',
      description: 'Take part in this global alliance of spiritual revolutionaries, bringing clarity to a world clouded with disinformation. Sat Yoga is more than a school—it is a family of seekers committed to the restoration of divine order.'
    },
    {
      icon: 'wisdom',
      title: 'Transformational Wisdom',
      description: 'Take part in this global alliance of spiritual revolutionaries, bringing clarity to a world clouded with disinformation. Sat Yoga is more than a school—it is a family of seekers committed to the restoration of divine order.'
    },
    {
      icon: 'support',
      title: 'Support the Mission!',
      description: 'Take part in this global alliance of spiritual revolutionaries, bringing clarity to a world clouded with disinformation. Sat Yoga is more than a school—it is a family of seekers committed to the restoration of divine order.'
    }
  ];
  
  // Handle billing period toggle
  const handleBillingToggle = () => {
    setIsMonthly(!isMonthly);
  };
  
  // Handle plan selection
  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  return (
    <div>
      {/* Benefits Section */}
      <BenefitsSection benefits={benefits} />
      
      {/* Pricing Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setIsMonthly(true)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  isMonthly ? 'bg-white shadow' : 'text-gray-700'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsMonthly(false)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  !isMonthly ? 'bg-white shadow' : 'text-gray-700'
                }`}
              >
                Yearly (save 25%)
              </button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {membershipPlans.map((plan) => (
              <MembershipPlanCard
                key={plan.id}
                plan={plan}
                isMonthly={isMonthly}
                isSelected={selectedPlan === plan.id}
                onSelect={handleSelectPlan}
              />
            ))}
          </div>
               {/* Not Ready Section */}
      <NotReadySection />
          {/* Feature Details */}
          <div className="max-w-3xl mx-auto mt-16">
            <FeatureAccordion features={featureDetails} />
          </div>
        </div>
      </div>
      
 
    </div>
  );
}