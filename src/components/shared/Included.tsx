import { Check } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface IncludedItem {
  title: string;
  description: string;
}

interface IncludedSectionData {
  sectionTitle: string;
  items: IncludedItem[];
}

// ============================================================================
// COMPONENT
// ============================================================================

const IncludedSection = ({ data }: { data: IncludedSectionData }) => {
  return (
    <section 
      className="w-full flex flex-col justify-center items-center px-4 lg:px-16 py-16 lg:py-16"
      style={{ backgroundColor: '#FAF8F1', gap: '80px' }}
    >
      <div className="w-full max-w-7xl mx-auto flex flex-col items-start" style={{ gap: '64px' }}>
        {/* Section Title */}
        <h2 
          style={{
            fontFamily: 'Optima, Georgia, serif',
            fontSize: 'clamp(28px, 4vw, 48px)',
            fontWeight: 550,
            lineHeight: '125%',
            letterSpacing: '-0.02em',
            color: '#000000'
          }}
        >
          {data.sectionTitle}
        </h2>

        {/* Three Column Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.items.map((item, index) => (
            <div key={index} className="flex items-start" style={{ gap: '16px' }}>
              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                <Check size={20} style={{ color: '#000000' }} />
              </div>
              <div className="flex flex-col" style={{ gap: '16px' }}>
                <h3 
                  style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '18px',
                    fontWeight: 600,
                    lineHeight: '28px',
                    color: '#000000'
                  }}
                >
                  {item.title}
                </h3>
                <p 
                  style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '18px',
                    fontWeight: 400,
                    lineHeight: '28px',
                    color: '#384250'
                  }}
                >
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IncludedSection;