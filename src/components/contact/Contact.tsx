'use client'

import React, { useEffect, useState } from "react"
import ContactSection from "../shared/Contact"
import StandardHeroSection from "../shared/Hero";
import Image from "next/image";

// TypeScript interfaces for data structure
interface ContactInfo {
    email: string;
    phone: string;
    address: string;
  }

  interface FormField {
    id: string;
    label: string;
    type: 'text' | 'email' | 'select' | 'textarea' | 'checkbox';
    placeholder?: string;
    required: boolean;
    options?: string[];
    rows?: number;
    gridColumn?: '1' | '2' | '1/3'; // For grid layout
    validationRules?: {
      minLength?: number;
      maxLength?: number;
      pattern?: string;
      errorMessage?: string;
    };
  }

  interface ContactSectionData {
    tagline: string;
    heading: string;
    description: string;
    contactInfo: ContactInfo;
    formFields: FormField[];
    privacyPolicyText: string;
    privacyPolicyLink: string;
    submitButtonText: string;
    successMessage: string;
    errorMessage: string;
  }

  interface ContactApiData {
    tagline: string;
    heading: string;
    description: string;
    email: string;
    phone: string;
    address: string;
    heroImage: string | null;
    mapImage: string | null;
    formFields: FormField[];
    privacyPolicyText: string;
    privacyPolicyLink: string;
    submitButtonText: string;
    successMessage: string;
    errorMessage: string;
  }


export function Contact({data}:any){
    const [contactData, setContactData] = useState<ContactSectionData | null>(null);
    const [heroImage, setHeroImage] = useState<string>("/contactusbanner.jpg");
    const [mapImage, setMapImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [initialTopic, setInitialTopic] = useState<string>('');
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    useEffect(() => {
      // Read queryType from URL parameter
      const urlParams = new URLSearchParams(window.location.search);
      const queryType = urlParams.get('queryType');

      // Map queryType to topic options
      const topicMapping: Record<string, string> = {
        'retreat': 'Retreat Information',
        'online_retreat': 'Retreat Information',
        'membership': 'Membership Questions',
        'technical': 'Technical Support',
        'general': 'General Inquiry',
        'other': 'Other'
      };

      if (queryType && topicMapping[queryType]) {
        setInitialTopic(topicMapping[queryType]);
      }
    }, []);

    useEffect(() => {
      const fetchContactData = async () => {
        try {
          const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
          const response = await fetch(`${FASTAPI_URL}/api/contact/info`);

          if (response.ok) {
            const apiData: ContactApiData = await response.json();

            // Transform API data to ContactSectionData format
            setContactData({
              tagline: apiData.tagline,
              heading: apiData.heading,
              description: apiData.description,
              contactInfo: {
                email: apiData.email,
                phone: apiData.phone,
                address: apiData.address
              },
              formFields: apiData.formFields,
              privacyPolicyText: apiData.privacyPolicyText,
              privacyPolicyLink: apiData.privacyPolicyLink,
              submitButtonText: apiData.submitButtonText,
              successMessage: apiData.successMessage,
              errorMessage: apiData.errorMessage
            });

            // Set images
            if (apiData.heroImage) setHeroImage(apiData.heroImage);
            if (apiData.mapImage) setMapImage(apiData.mapImage);
          } else {
            console.error('Failed to fetch contact data');
            // Fallback to hardcoded data
            useFallbackData();
          }
        } catch (error) {
          console.error('Error fetching contact data:', error);
          // Fallback to hardcoded data
          useFallbackData();
        } finally {
          setLoading(false);
        }
      };

      const useFallbackData = () => {
        setContactData({
          tagline: "NEED ASSISTANCE OR MORE INFORMATION?",
          heading: "Contact us",
          description: "We're here to help. If you have questions about the website, upcoming retreats (online or onsite), or need assistance, please select the topic in the form below and submit your query.",
          contactInfo: {
            email: "hello@satyoga.com",
            phone: "+1 (000) 000-0000",
            address: "Fila San Marcos, Rio Nuevo, Perez Zeledon, Costa Rica"
          },
          formFields: [
            {
              id: "firstName",
              label: "First name",
              type: "text",
              placeholder: "First name",
              required: true,
              gridColumn: "1"
            },
            {
              id: "lastName",
              label: "Last name",
              type: "text",
              placeholder: "Last name",
              required: true,
              gridColumn: "2"
            },
            {
              id: "email",
              label: "Email",
              type: "email",
              placeholder: "you@company.com",
              required: true,
              gridColumn: "1/3"
            },
            {
              id: "topic",
              label: "Choose a topic",
              type: "select",
              placeholder: "Select one...",
              required: true,
              gridColumn: "1/3",
              options: [
                "General Inquiry",
                "Retreat Information",
                "Membership Questions",
                "Technical Support",
                "Other"
              ]
            },
            {
              id: "message",
              label: "Message",
              type: "textarea",
              placeholder: "Leave us a message...",
              required: true,
              rows: 5,
              gridColumn: "1/3"
            },
            {
              id: "agreeToPrivacy",
              label: "Privacy Policy",
              type: "checkbox",
              placeholder: 'You agree to our friendly <a href="/privacy" style="color: #384250; text-decoration: underline;">privacy policy</a>.',
              required: true,
              gridColumn: "1/3"
            }
          ],
          privacyPolicyText: "You agree to our friendly",
          privacyPolicyLink: "/privacy",
          submitButtonText: "Submit",
          successMessage: "Thank you! Your message has been sent successfully.",
          errorMessage: "Something went wrong. Please try again."
        });
      };

      fetchContactData();
    }, []);

    // Drag handlers for map image
    const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y
      });
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      if (!isDragging) return;
      const touch = e.touches[0];

      // Calculate new position
      let newX = touch.clientX - dragStart.x;
      let newY = touch.clientY - dragStart.y;

      // The image is 200% size, centered at -50%, so it extends 50% beyond container on each side
      // Maximum drag distance is 50% of container size in each direction
      const maxDragX = window.innerWidth * 0.25; // 50% of container width / 2
      const maxDragY = 250; // Approximately 50% of mobile container height

      // Clamp the position within bounds
      newX = Math.max(-maxDragX, Math.min(maxDragX, newX));
      newY = Math.max(-maxDragY, Math.min(maxDragY, newY));

      setPosition({ x: newX, y: newY });
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    const heroData = {tagline:"", background: heroImage, heading: "Contact Us", subtext: ""}

    // Don't block rendering - show default data while loading
    const displayData = contactData || {
      tagline: "NEED ASSISTANCE OR MORE INFORMATION?",
      heading: "Contact us",
      description: "We're here to help. If you have questions about the website, upcoming retreats (online or onsite), or need assistance, please select the topic in the form below and submit your query.",
      contactInfo: {
        email: "hello@satyoga.com",
        phone: "+506 2100 7777",
        address: "Fila San Marcos, Rio Nuevo, Perez Zeledon, Costa Rica"
      },
      formFields: [
        {
          id: "firstName",
          label: "First name",
          type: "text",
          placeholder: "First name",
          required: true,
          gridColumn: "1"
        },
        {
          id: "lastName",
          label: "Last name",
          type: "text",
          placeholder: "Last name",
          required: true,
          gridColumn: "2"
        },
        {
          id: "email",
          label: "Email",
          type: "email",
          placeholder: "you@company.com",
          required: true,
          gridColumn: "1/3"
        },
        {
          id: "topic",
          label: "Choose a topic",
          type: "select",
          placeholder: "Select one...",
          required: true,
          gridColumn: "1/3",
          options: [
            "General Inquiry",
            "Retreat Information",
            "Membership Questions",
            "Technical Support",
            "Other"
          ]
        },
        {
          id: "message",
          label: "Message",
          type: "textarea",
          placeholder: "Leave us a message...",
          required: true,
          rows: 5,
          gridColumn: "1/3"
        },
        {
          id: "subscribeNewsletter",
          label: "Newsletter Subscription",
          type: "checkbox",
          placeholder: 'Would you like to join our newsletter?',
          required: false,
          gridColumn: "1/3"
        }
      ],
      privacyPolicyText: "You agree to our friendly",
      privacyPolicyLink: "/privacy",
      submitButtonText: "Submit",
      successMessage: "Thank you! Your message has been sent successfully.",
      errorMessage: "Something went wrong. Please try again."
    };

    return (
        <>
        <StandardHeroSection data={heroData}/>
        <ContactSection data={displayData} initialTopic={initialTopic}/>
        {mapImage && (
          <div className="w-full flex justify-center items-center px-4 md:px-8 lg:px-16 pb-12 md:pb-32 lg:pb-[220px]" style={{ background: '#FAF8F1' }}>
            {/* Mobile: Draggable map */}
            <div
              className="relative w-full max-w-[1312px] h-[400px] md:h-[500px] rounded-lg overflow-hidden select-none lg:hidden"
              style={{
                border: '1px solid #AFA7A7',
                cursor: isDragging ? 'grabbing' : 'grab'
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                style={{
                  position: 'absolute',
                  width: '200%',
                  height: '200%',
                  left: '-50%',
                  top: '-50%',
                  transform: `translate(${position.x}px, ${position.y}px)`,
                  transition: isDragging ? 'none' : 'transform 0.3s ease-out'
                }}
              >
                <Image
                  src={mapImage}
                  alt="Location map showing Sat Yoga Institute in Costa Rica - Drag to explore"
                  fill
                  className="object-contain pointer-events-none"
                  unoptimized
                  draggable={false}
                />
              </div>

              {/* Hint indicator */}
              {!isDragging && position.x === 0 && position.y === 0 && (
                <div
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white px-4 py-2 rounded-full text-sm"
                  style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    pointerEvents: 'none'
                  }}
                >
                  👆 Drag to explore the map
                </div>
              )}
            </div>

            {/* Desktop: Static map */}
            <div className="relative w-full max-w-[1312px] h-[657px] rounded-lg overflow-hidden hidden lg:block" style={{ border: '1px solid #AFA7A7' }}>
              <Image
                src={mapImage}
                alt="Location map showing Sat Yoga Institute in Costa Rica"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        )}
        </>
    )
}