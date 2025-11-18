'use client';

import React, { useEffect, useState } from 'react';

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

export default function MembershipHero() {
  const [heroData, setHeroData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${FASTAPI_URL}/api/membership/hero`)
      .then(res => res.json())
      .then(data => {
        setHeroData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load membership hero:', err);
        setLoading(false);
      });
  }, []);

  if (loading || !heroData) {
    return (
      <div className="bg-[#FAF8F1] py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#942017]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F1] py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-avenir text-[#9C7520] uppercase tracking-wider text-base font-semibold mb-4">
            {heroData.tagline}
          </p>
          <h2 className="font-optima text-4xl md:text-5xl font-medium text-black mb-6 tracking-tight" style={{ letterSpacing: '-0.02em' }}>
            {heroData.heading}
          </h2>
          <p className="font-avenir text-[#384250] text-lg max-w-3xl mx-auto leading-[28px]">
            {heroData.description}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 mb-16">
          {heroData.benefits.map((benefit: any, index: number) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-6">
                <div
                  className="w-[100px] h-[100px] rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(180deg, #FFFFFF 0%, #FAF8F1 100%)',
                    boxShadow: '-11px 50px 20px rgba(181, 85, 33, 0.01), -6px 28px 17px rgba(181, 85, 33, 0.05), -3px 12px 13px rgba(181, 85, 33, 0.09), -1px 3px 7px rgba(181, 85, 33, 0.1), -11px 50px 20px rgba(181, 85, 33, 0.01), -6px 28px 17px rgba(181, 85, 33, 0.05), -3px 12px 13px rgba(181, 85, 33, 0.09), -1px 3px 7px rgba(181, 85, 33, 0.1)'
                  }}
                >
                  <img
                    src={benefit.iconPath}
                    alt={`${benefit.title} icon`}
                    className="w-[98px] h-[98px] object-contain"
                  />
                </div>
              </div>
              <h3 className="font-optima text-xl font-semibold text-black mb-4">
                {benefit.title}
              </h3>
              <p className="font-avenir text-[#384250] leading-relaxed text-sm">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-b from-[#E5E0D5] to-[#D5CFC0] rounded-2xl p-8 md:p-16 overflow-hidden">
          <div className="relative max-w-6xl mx-auto">
            <img
              src={heroData.mockupImage}
              alt="Sat Yoga platform across devices"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}