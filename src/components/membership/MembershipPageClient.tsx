'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Components
import Hero from '@/components/sections/Hero';
import ContentSection from '@/components/sections/ContentSection';
import CtaSection from '@/components/sections/CtaSection';

// Types for membership plans
interface MembershipPlan {
  title: string;
  price: string;
  period: string;
  popular?: boolean;
  features: string[];
  ctaText?: string;
  ctaLink?: string;
}

// Types for testimonials
interface Testimonial {
  quote: string;
  author: string;
  role: string;
  imageUrl?: string;
}

// Types for FAQs
interface FAQ {
  question: string;
  answer: string;
}

// Membership Plan Card Component
const MembershipPlanCard: React.FC<MembershipPlan> = ({ 
  title, 
  price, 
  period, 
  popular = false,
  features = [], 
  ctaText = "Choose plan",
  ctaLink = "/membership/checkout"
}) => {
  return (
    <div className={`bg-white rounded-lg border ${popular ? 'border-purple-200 shadow-lg' : 'border-gray-200'} overflow-hidden flex flex-col h-full`}>
      {popular && (
        <div className="bg-purple-100 text-purple-600 text-center text-sm font-medium py-1">
          Most popular
        </div>
      )}
      
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <div className="mb-4">
          <span className="text-3xl font-bold">${price}</span>
          <span className="text-gray-500">/{period}</span>
        </div>
        
        <div className="space-y-4 mb-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-auto">
          <Link 
            href={ctaLink}
            className="block w-full bg-gray-900 text-white text-center rounded-md py-3 font-medium hover:bg-gray-800"
          >
            {ctaText}
          </Link>
        </div>
      </div>
    </div>
  );
};

// Testimonial Component
const TestimonialCard: React.FC<Testimonial> = ({ quote, author, role, imageUrl }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden mr-4">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={author}
              width={48}
              height={48}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-purple-100 text-purple-600 font-bold">
              {author.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <p className="font-medium">{author}</p>
          <p className="text-sm text-gray-500">{role}</p>
        </div>
      </div>
      <p className="text-gray-700 italic">"{quote}"</p>
    </div>
  );
};

// FAQ Component
const FAQItem: React.FC<FAQ & { isOpen: boolean; toggleOpen: () => void }> = ({ 
  question, 
  answer, 
  isOpen, 
  toggleOpen 
}) => {
  return (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={toggleOpen}
        className="flex justify-between items-center w-full text-left focus:outline-none"
      >
        <h3 className="text-lg font-medium text-gray-900">{question}</h3>
        <span className="ml-6 flex-shrink-0">
          <svg
            className={`w-5 h-5 transform ${isOpen ? 'rotate-180' : ''}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </button>
      
      {isOpen && (
        <div className="mt-2 text-gray-600">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};

// Main Membership Page Client Component
export default function MembershipPageClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };
  
  // Sample membership plans data
  const membershipPlans: MembershipPlan[] = [
    {
      title: "Gyani (Free Member)",
      price: "0",
      period: "mo",
      features: [
        "Basic access to weekly teachings",
        "Selected video content from our library",
        "Discounts on Sat Yoga events",
        "Join our community forums",
        "Weekly newsletters"
      ],
      ctaText: "Sign up free",
      ctaLink: "/signup?plan=free"
    },
    {
      title: "Vigyani (Premium Member)",
      price: "66",
      period: "mo",
      popular: true,
      features: [
        "All Free benefits plus:",
        "Full access to video library",
        "Monthly online retreats with Shunyamurti",
        "Private Facebook community",
        "Live weekly Q&A sessions",
        "Exclusive meditations and practices",
        "Digital spiritual guidebooks",
        "Priority retreat registration",
        "Personalized spiritual guidance"
      ],
      ctaText: "Choose Vigyani",
      ctaLink: "/membership/checkout?plan=vigyani"
    },
    {
      title: "Pragyani (Elite Member)",
      price: "142",
      period: "mo",
      features: [
        "All Premium benefits plus:",
        "Access to advanced teachings",
        "One-on-one virtual sessions with teachers",
        "Custom meditation programs",
        "Quarterly private retreats",
        "Full access to all historical content",
        "Personalized spiritual readings",
        "Exclusive workshops and seminars",
        "Priority support and guidance"
      ],
      ctaText: "Choose Pragyani",
      ctaLink: "/membership/checkout?plan=pragyani"
    }
  ];
  
  // Sample testimonials data
  const testimonials: Testimonial[] = [
    {
      quote: "The Sat Yoga teachings have completely transformed my life. The membership is worth every penny for the depth of wisdom and guidance I've received.",
      author: "Sarah Wilson",
      role: "Vigyani Member, 2 years",
      imageUrl: ""
    },
    {
      quote: "I've been on a spiritual journey for decades, but nothing has provided the clarity and peace that I've found through the Sat Yoga community and teachings.",
      author: "Michael Johnson",
      role: "Pragyani Member, 3 years",
      imageUrl: ""
    },
    {
      quote: "Even as a free member, I've gained so much from the weekly teachings. This community is truly special and I'm grateful to be a part of it.",
      author: "Elena Rodriguez",
      role: "Gyani Member, 6 months",
      imageUrl: ""
    }
  ];
  
  // Sample FAQs data
  const faqs: FAQ[] = [
    {
      question: "What is included in the membership?",
      answer: "Our membership includes access to a vast library of teachings, guided meditations, online retreats, and community forums. Different membership tiers provide varying levels of access and personalized guidance."
    },
    {
      question: "Can I change or cancel my membership?",
      answer: "Yes, you can upgrade, downgrade, or cancel your membership at any time. Changes to your membership will take effect at the beginning of your next billing cycle."
    },
    {
      question: "Is there a free trial period?",
      answer: "Yes, all paid memberships come with a 10-day free trial period. You won't be charged until after the trial period ends."
    },
    {
      question: "How do I access member content?",
      answer: "After signing up, you'll receive login credentials to access our member dashboard where all content is organized by category and easily searchable."
    },
    {
      question: "Are there any discounts for annual subscriptions?",
      answer: "Yes, we offer a 15% discount when you choose annual billing for any membership tier."
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <Hero
        heading="Become a member today!"
        content="Join our thriving spiritual community and gain access to transformative teachings, retreats, and resources designed to support your journey toward self-realization and inner peace."
        buttonText="View membership options"
        buttonLink="#membership-plans"
        darkMode={true}
        backgroundImage="/placeholder.png"
        alignContent="center"
        size="medium"
      />
      
      {/* Membership Plans Section */}
      <section id="membership-plans" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-purple-600 font-medium mb-2">Membership plans</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose your journey</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Select a membership plan that best suits your spiritual journey. Each tier offers unique benefits to support your growth and transformation.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {membershipPlans.map((plan, index) => (
              <MembershipPlanCard key={index} {...plan} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Member Benefits Section */}
      <ContentSection
        eyebrow="Member benefits"
        heading="Transform your life with premium spiritual content"
        content="Our memberships provide access to a wealth of transformative teachings, practices, and community support to help you on your spiritual journey."
        bulletPoints={[
          "Exclusive access to Shunyamurti's profound teachings and meditations",
          "Join a global community of like-minded spiritual seekers",
          "Structured guidance for your personal transformation"
        ]}
        buttons={[
          { label: "View all benefits", url: "/membership/benefits", primary: true }
        ]}
        imagePosition="right"
        imageUrl="/placeholder.png"
      />
      
      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-purple-600 font-medium mb-2">What members are saying</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Member testimonials</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hear from our community members about how Sat Yoga membership has transformed their lives.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-purple-600 font-medium mb-2">Frequently Asked Questions</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Common questions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about our membership programs.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <FAQItem 
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFaq === index}
                toggleOpen={() => toggleFaq(index)}
              />
            ))}
          </div>
          
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Still have questions?{' '}
              <Link href="/contact" className="text-purple-600 font-medium hover:text-purple-700">
                Contact us
              </Link>
            </p>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <CtaSection
        eyebrow="Ready to begin?"
        heading="Start your spiritual journey today"
        description="Join our community and unlock access to transformative teachings, practices, and support."
        primaryButtonText="Become a member"
        primaryButtonLink="#membership-plans"
        secondaryButtonText="Learn more"
        secondaryButtonLink="/about"
        centered={true}
        backgroundClass="bg-gray-100"
      />
    </>
  );
}