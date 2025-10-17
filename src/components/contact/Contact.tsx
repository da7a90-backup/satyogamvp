'use client'


import React from "react"
import ContactSection from "../shared/Contact"
import StandardHeroSection from "../shared/Hero";

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
  

export function Contact({data}:any){

    const contactData: ContactSectionData = {
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
      };
      const heroData = {tagline:"", background: "/contactusbanner.jpg", heading: "Contact Us", subtext: ""}

    return (
        <>
        <StandardHeroSection data={heroData}/>
        <ContactSection data={contactData}/>
        </>
    )
}