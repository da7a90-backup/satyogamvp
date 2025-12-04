'use client';

import { useState, useEffect } from 'react';
import MembershipHero from "./MembershipHero";
import Pricing from "./Pricing";
import NotReadySection from "./NotReadySection";
import TwoPaneComponent from "@/components/shared/TwoPaneComponent";

// Main Membership Page Client Component
export default function MembershipPageClient() {
  const [benefitsData, setBenefitsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBenefits = async () => {
      try {
        setLoading(true);
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${API_URL}/api/membership/benefits`, {
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch benefits: ${response.statusText}`);
        }

        const data = await response.json();
        setBenefitsData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching membership benefits:', err);
        setError(err instanceof Error ? err.message : 'Failed to load benefits');
      } finally {
        setLoading(false);
      }
    };

    fetchBenefits();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <MembershipHero />

      {/* Membership Plans Section */}
      <Pricing/>

      {/* Not Ready Section */}
      <NotReadySection />

      {/* Membership Benefits Details Section */}
      {loading ? (
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '20px', color: '#414651' }}>
            Loading membership benefits...
          </p>
        </div>
      ) : error || !benefitsData ? (
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '20px', color: '#ef4444', marginBottom: '16px' }}>
            Error loading benefits
          </p>
          <p style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '16px', color: '#414651' }}>
            {error || 'Please try again later.'}
          </p>
        </div>
      ) : (
        <TwoPaneComponent data={benefitsData} />
      )}
    </>
  );
}