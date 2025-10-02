const ScheduleSection = ({data}:{data: any}) => {

    return (
      <section 
        className="w-full flex flex-col justify-center items-center px-4 lg:px-16 py-16 lg:py-16"
        style={{ backgroundColor: '#FAF8F1' }}
      >
        <div 
          className="w-full max-w-3xl bg-white rounded-2xl shadow-sm"
          style={{ padding: 'clamp(32px, 5vw, 64px)' }}
        >
          {/* Title Section */}
          <div className="flex flex-col items-start mb-8" style={{ gap: '4px' }}>
            {/* Tagline */}
            <div className="flex items-center">
              <span 
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  lineHeight: '24px',
                  color: '#B8860B',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}
              >
                {data.tagline}
              </span>
            </div>
  
            {/* Title */}
            <h2 
              style={{
                fontFamily: 'Optima, Georgia, serif',
                fontSize: 'clamp(20px, 3vw, 24px)',
                fontWeight: 550,
                lineHeight: '32px',
                color: '#000000'
              }}
            >
              {data.title}
            </h2>
          </div>
  
          {/* Schedule Items */}
          <div className="flex flex-col">
            {data.items.map((item:any, index: number) => (
              <div key={index}>
                {/* Row */}
                <div 
                  className="flex flex-col sm:flex-row sm:items-start py-6"
                  style={{ gap: '24px' }}
                >
                  {/* Time Label */}
                  <div 
                    className="flex-shrink-0"
                    style={{ 
                      width: 'auto',
                      minWidth: '140px'
                    }}
                  >
                    <span 
                      style={{
                        fontFamily: 'Avenir Next, sans-serif',
                        fontSize: '16px',
                        fontWeight: 600,
                        lineHeight: '24px',
                        color: '#000000'
                      }}
                    >
                      {item.time}
                    </span>
                  </div>
  
                  {/* Activity Description */}
                  <div className="flex-1">
                    <span 
                      style={{
                        fontFamily: 'Avenir Next, sans-serif',
                        fontSize: '16px',
                        fontWeight: 500,
                        lineHeight: '24px',
                        color: '#384250'
                      }}
                    >
                      {item.activity}
                    </span>
                  </div>
                </div>
  
                {/* Divider Line - don't show after last item */}
                {index < data.items.length - 1 && (
                  <div 
                    style={{
                      width: '100%',
                      height: '1px',
                      backgroundColor: '#D2D6DB'
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };
  
  export default ScheduleSection;