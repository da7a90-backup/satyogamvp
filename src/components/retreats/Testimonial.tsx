'use client';

import { useState } from 'react';

const TestimonialSection = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      quote: "I've received so much in my month here; my cup overfloweth. It was like the nectar that I needed to heal. This is priceless, and I am so overjoyed that I've been here.",
      author: 'Mandy',
      location: 'UK',
      video: '/testimonial.png'
    },
    {
        id: 2,
        quote: "I've so much in my month here; my cup overfloweth. It was like the nectar that I needed to heal. This is priceless, and I am so overjoyed that I've been here.",
        author: 'Mandy',
        location: 'UK',
        video: '/testimonial.png'
      }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section 
      className="relative w-full flex flex-col items-center py-16 lg:py-28 px-4 lg:px-16"
      style={{ backgroundColor: '#FAF8F1' }}
    >
      <div className="w-full flex flex-col lg:flex-row items-center" style={{ maxWidth: '1312px', gap: '80px' }}>
        {/* Testimonial Text */}
        <div className="flex-1 flex flex-col gap-6" style={{ maxWidth: '500px' }}>
          <span 
            className="text-sm font-medium uppercase tracking-wider"
            style={{ fontFamily: 'Avenir Next, sans-serif', color: '#B8860B' }}
          >
            TESTIMONIAL CARROUSEL
          </span>
          
          <p 
            className="text-xl italic"
            style={{
              fontFamily: 'Optima, sans-serif',
              fontSize: '24px',
              lineHeight: '36px',
              color: '#000000'
            }}
          >
            "{testimonials[currentTestimonial].quote}"
          </p>
          
          <div>
            <p style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '16px', fontWeight: 600, color: '#000000' }}>
              {testimonials[currentTestimonial].author}
            </p>
            <p style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '14px', color: '#6B7280' }}>
              {testimonials[currentTestimonial].location}
            </p>
          </div>
        </div>

        {/* Video Testimonial */}
        <div className="flex-1 w-full" style={{ maxWidth: '616px' }}>
          <div 
            className="relative w-full overflow-hidden cursor-pointer"
            style={{
              aspectRatio: '16/10',
              borderRadius: '16px',
              backgroundImage: `url(${testimonials[currentTestimonial].video})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center justify-center w-20 h-20 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-300">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M8 5v14l11-7L8 5z" fill="#7D1A13"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div 
        className="flex justify-between items-center mt-8"
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0px',
          gap: '40px',
          width: '1312px',
          height: '48px'
        }}
      >
        {/* Slider Dots */}
        <div 
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            padding: '0px',
            gap: '8px',
            margin: '0 auto',
            marginLeft: '0',
            width: '24px',
            height: '8px'
          }}
        >
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTestimonial(index)}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                currentTestimonial === index ? 'bg-gray-800' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        
        {/* Slider Buttons */}
        <div 
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            padding: '0px',
            marginRight: '10%',
            gap: '15px',
            margin: '0 auto',
            width: '111px',
            height: '48px'
          }}
        >
          <button 
            onClick={prevTestimonial}
            className="flex items-center justify-center w-12 h-12 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors duration-300"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15l-5-5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button 
            onClick={nextTestimonial}
            className="flex items-center justify-center w-12 h-12 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors duration-300"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7.5 15l5-5-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;