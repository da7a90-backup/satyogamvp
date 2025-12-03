'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StandardHeroSection from '@/components/shared/Hero';
import TwoPaneComponent from '@/components/shared/TwoPaneComponent';
import QuoteSection from '@/components/shared/Quote';

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

// ============================================================================
// TYPES
// ============================================================================

interface DonationProject {
  id: string;
  name: string;
  title: string;
  description: string;
  image: string;
}

interface HeroData {
  heroBackground: string;
}

// ============================================================================
// COMPONENTS
// ============================================================================

// Tabbed Projects Section
const DonationProjectsSection = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [donationAmount, setDonationAmount] = useState('45.00');
  const [donationProjects, setDonationProjects] = useState<DonationProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${FASTAPI_URL}/api/donations/projects`)
      .then(res => res.json())
      .then(data => {
        setDonationProjects(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load donation projects:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="w-full bg-[#FAF8F1] py-20 px-4 lg:px-16">
        <div className="max-w-[1312px] mx-auto flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#942017]"></div>
        </div>
      </section>
    );
  }

  if (!donationProjects.length) {
    return null;
  }

  const activeProject = donationProjects[activeTab];

  const handleAccept = () => {
    const amount = parseFloat(donationAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid donation amount');
      return;
    }

    // Navigate to checkout page with donation details
    const params = new URLSearchParams({
      amount: amount.toString(),
      category: activeProject.id,
      projectName: activeProject.name
    });
    router.push(`/donate/checkout?${params.toString()}`);
  };

  return (
    <section className="w-full bg-[#FAF8F1] py-20 px-4 lg:px-16">
      <div className="max-w-[1312px] mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 mb-12">
          <span
            className="uppercase tracking-wider text-[#9C7520] font-semibold text-sm"
            style={{ fontFamily: 'Avenir Next, sans-serif' }}
          >
            A NEW AGE OF BEAUTY, TRUTH, AND DIVINE LOVE IS BEING BORN
          </span>
          <h2
            className="text-4xl lg:text-5xl font-medium text-center"
            style={{ fontFamily: 'Optima, Georgia, serif' }}
          >
            Many Projects, One Vision
          </h2>
          <p
            className="text-center text-gray-700 max-w-[1292px]"
            style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '16px', lineHeight: '24px' }}
          >
            We are building a sustainable spiritual refuge—here at the ashram and across the world—offering transmissions of wisdom and love to souls ready to awaken their highest potential.
            <br />
            <br />
            Each project below serves this vision: to sustain and expand our sacred work, to nurture this sanctuary, and to radiate light into a world in need. Your generosity makes it possible.
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8 overflow-x-auto">
          <div className="flex gap-3 min-w-max">
            {donationProjects.map((project, index) => (
              <button
                key={project.id}
                onClick={() => setActiveTab(index)}
                className={`px-4 py-3 font-semibold text-sm whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === index
                    ? 'border-[#7D1A13] text-[#7D1A13]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {project.name}
              </button>
            ))}
          </div>
        </div>

        {/* Project Content Card */}
        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden grid md:grid-cols-2">
          {/* Image */}
          <div
            className="h-[400px] md:h-[640px] bg-gray-200"
            style={{
              backgroundImage: `url(${activeProject.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />

          {/* Content */}
          <div className="p-12 flex flex-col justify-center gap-8">
            <div className="flex flex-col gap-6">
              <h3
                className="text-5xl font-bold"
                style={{ fontFamily: 'Optima, Georgia, serif' }}
              >
                {activeProject.title}
              </h3>
              <p
                className="text-gray-700 leading-relaxed"
                style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '16px', lineHeight: '24px' }}
              >
                {activeProject.description}
              </p>
            </div>

            {/* Donation Amount Input */}
            <div className="flex flex-col gap-3">
              <label
                className="font-bold text-lg"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                Insert amount
              </label>
              <div className="flex gap-2">
                {/* Currency + Amount Input */}
                <div className="flex-1 flex border border-gray-300 rounded-lg overflow-hidden">
                  <select
                    className="px-4 py-3 border-r border-gray-300 bg-white focus:outline-none"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    <option value="USD">USD</option>
                  </select>
                  <input
                    type="text"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    placeholder="$45.00"
                    className="flex-1 px-4 py-3 focus:outline-none"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                </div>

                {/* Accept Button */}
                <button
                  onClick={handleAccept}
                  className="px-6 py-3 bg-white border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 shadow-sm"
                  style={{ fontFamily: 'Avenir Next, sans-serif' }}
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// General Fund Donation Section
const GeneralFundSection = () => {
  const router = useRouter();
  const [donationAmount, setDonationAmount] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [donationType, setDonationType] = useState('one-time');

  const presetAmounts = [25, 77, 108, 250, 500, 1000];

  const handlePresetClick = (amount: number) => {
    setSelectedPreset(amount);
    setDonationAmount(amount.toString());
  };

  const handleAccept = () => {
    const amount = parseFloat(donationAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid donation amount');
      return;
    }

    // Navigate to checkout page with donation details
    const params = new URLSearchParams({
      amount: amount.toString(),
      category: 'general-fund',
      projectName: 'General Fund'
    });
    router.push(`/donate/checkout?${params.toString()}`);
  };

  return (
    <section className="w-full bg-[#FAF8F1] py-20 px-4 lg:px-16">
      <div className="max-w-[1312px] mx-auto">
        {/* Card */}
        <div className="bg-white border border-gray-300 rounded-lg p-12 shadow-lg">
          <div className="max-w-[836px] mx-auto flex flex-col items-center gap-8">
            {/* Header */}
            <div className="flex flex-col gap-3 text-center">
              <span
                className="text-[#942017] font-bold"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px' }}
              >
                Custom
              </span>
              <h2
                className="text-5xl font-medium"
                style={{ fontFamily: 'Optima, Georgia, serif' }}
              >
                Donate to the general fund
              </h2>
              <p
                className="text-gray-700 max-w-[836px]"
                style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '16px', lineHeight: '24px' }}
              >
                Your contribution to the General Fund supports the lifeblood of the Ashram—helping us meet immediate needs, sustain daily operations, and remain responsive and resilient in these times of rapid change. This fund ensures that the whole organism of our community can continue to thrive, serve, and radiate peace to the world.
                <br /><br />
                We thank you for your generosity, and we know that it will bring you many blessings.
              </p>
            </div>

            {/* Donation Form */}
            <div className="w-full max-w-[800px] flex flex-col gap-6">
              {/* Suggested Amounts Label */}
              <p
                className="text-center text-gray-700"
                style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '16px' }}
              >
                Suggested donations:
              </p>

              {/* Preset Amount Buttons */}
              <div className="flex justify-center gap-2">
                {presetAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handlePresetClick(amount)}
                    className={`px-6 py-2 rounded-lg font-semibold border transition-colors ${
                      selectedPreset === amount
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                    style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '16px' }}
                  >
                    ${amount.toFixed(2)}
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-gray-300" />
                <span
                  className="text-gray-700"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px' }}
                >
                  Or
                </span>
                <div className="flex-1 h-px bg-gray-300" />
              </div>

              {/* Supporting Text */}
              <p
                className="text-center text-gray-700"
                style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '16px', lineHeight: '24px' }}
              >
                Or become a sustaining supporter. Set up a monthly donation of any amount and help us build lasting strength and stability.
              </p>

              {/* Custom Amount Input */}
              <div className="flex gap-2">
                {/* Currency + Amount Input */}
                <div className="flex-1 flex border border-gray-300 rounded-lg overflow-hidden">
                  <select
                    className="px-4 py-3 border-r border-gray-300 bg-white focus:outline-none"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    <option value="USD">USD</option>
                  </select>
                  <input
                    type="text"
                    value={donationAmount}
                    onChange={(e) => {
                      setDonationAmount(e.target.value);
                      setSelectedPreset(null);
                    }}
                    placeholder="Type your amount"
                    className="flex-1 px-4 py-3 focus:outline-none"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                </div>

                {/* Donation Type Selector */}
                <select
                  value={donationType}
                  onChange={(e) => setDonationType(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <option value="one-time">One time</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>

                {/* Accept Button */}
                <button
                  onClick={handleAccept}
                  className="px-6 py-3 bg-white border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 shadow-sm"
                  style={{ fontFamily: 'Avenir Next, sans-serif' }}
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Main Donate Page Component
const DonatePage = () => {
  const [heroBackground, setHeroBackground] = useState<string>('');
  const [heroLoading, setHeroLoading] = useState(true);

  useEffect(() => {
    fetch(`${FASTAPI_URL}/api/donations/hero`)
      .then(res => res.json())
      .then(data => {
        setHeroBackground(data.heroBackground);
        setHeroLoading(false);
      })
      .catch(err => {
        console.error('Failed to load hero background:', err);
        setHeroLoading(false);
      });
  }, []);

  if (heroLoading) {
    return (
      <main className="w-full flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#942017]"></div>
      </main>
    );
  }

  return (
    <main className="w-full">
      {/* Hero Section */}
      <StandardHeroSection
        data={{
          tagline: 'SUPPORT THE SAT YOGA MISSION',
          heading: 'Help Bring a New World into Being',
          subtext: 'If you recognize the urgency to create a more spiritual and ecological culture, and if you want to be part of the process of human and planetary rebirth, please support this unique and vital project.',
          background: heroBackground
        }}
      />

      {/* Giving from the Heart Section */}
      <TwoPaneComponent
        data={{
          backgroundColor: '#FAF8F1',
          leftPane: {
            tagline: 'A SPIRITUAL TITHE',
            taglineColor: '#9C7520',
            title: 'Giving from the Heart: Supporting a Spiritual Community & Serving a New World',
            description: 'If you recognize the urgency to create a more spiritual and ecological culture, and if you want to be part of the process of human and planetary rebirth, please support this unique and vital project.'
          },
          rightPane: {
            type: 'paragraphs',
            content: [
              'By contributing financially, you join a valued group of visionary leaders who are ensuring this new model of a peaceful world can be fully realized. You enable us to offer more scholarships to needy students, to reach out to more people within Costa Rica and throughout Latin America, and to guide more people to have better lives and raise their children to be healthy, awakened, and prepared for the future.',
              'As a Friend of Sat Yoga, you will be directly benefiting the people of Costa Rica and the world as a whole. Right now, we have an urgent need for your assistance. Your generosity makes all the difference in creating a sustainable spiritual refuge that can weather these uncertain times and continue offering transformative teachings to all who seek them.'
            ]
          }
        }}
      />

      {/* Donation Projects Section */}
      <DonationProjectsSection />

      {/* General Fund Section */}
      <GeneralFundSection />

      {/* Quote Section */}
      <QuoteSection
        data="The joy of sharing and serving, living on simplicity, brings abundance. Help us demonstrate solutions that can be emulated globally to co-create our harmony with Nature."
      />
    </main>
  );
};

export default DonatePage;
