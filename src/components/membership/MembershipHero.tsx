import React from 'react';

export default function MembershipHero({
  mockupImage = "/FrameDevices.png"
}) {
  const benefits = [
    {
      iconPath: "/vector.png",
      title: "Online Community",
      description: "Become a true spiritual pioneer by engaging in this innovative, interactive spiritual community of free thinkers from around the world. Wherever in this dream field your body may be, welcome back to your heart's ancient home."
    },
    {
      iconPath: "/vector1.png",
      title: "Transformational Wisdom",
      description: "The teachings of Shunyamurti transmit more than information—they are packed with power! These awesome transmissions will free your soul and make your heart sing! These ego-exploding discourses, guided meditations, and intimate encounters will rip away the veil between you and God."
    },
    {
      iconPath: "/vector2.png",
      title: "Support the Mission",
      description: "Sat Yoga depends on the generous love offerings of our global sangha. Your membership sustains the Sat Yoga Ashram and helps us fulfill the sacred mission to bring healing and liberating Truth to our suffering world."
    }
  ];

  return (
    <div className="bg-[#FAF8F1] py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[#B8860B] uppercase tracking-wider text-sm font-semibold mb-4">
            MEMBERSHIP
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            A Revolutionary Approach to Living!
          </h2>
          <p className="text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Attain Freedom from anxiety, confusion, and weakness of will! With the support of our global 
            spiritual community, and our life-changing information, you can complete your journey to 
            Ultimate Liberation!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 mb-16">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-6">
                <img 
                  src={benefit.iconPath} 
                  alt={`${benefit.title} icon`}
                  className="w-16 h-16 object-contain"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {benefit.title}
              </h3>
              <p className="text-gray-700 leading-relaxed text-sm">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-b from-[#E5E0D5] to-[#D5CFC0] rounded-2xl p-8 md:p-16 overflow-hidden">
          <div className="relative max-w-6xl mx-auto">
            <img 
              src={mockupImage} 
              alt="Sat Yoga platform across devices"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}