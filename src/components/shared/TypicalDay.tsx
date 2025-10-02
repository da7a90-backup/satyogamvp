const ShaktiScheduleSection = () => {
    // Schedule data structure - ready for CMS migration
    const scheduleData = {
      tagline: "A TYPICAL ASHRAM DAY",
      title: "Sample Daily Schedule",
      items: [
        {
          time: "4:00 - 4:45am",
          activity: "Morning meditation"
        },
        {
          time: "5:00 - 8:00am",
          activity: "Personal Time, Asanas, or Optional Outdoor Service"
        },
        {
          time: "8:45 - 11:45 am",
          activity: "Class, Optional Service, or Atmanology Session"
        },
        {
          time: "12:15 - 12:50 pm",
          activity: "Midday Meditation"
        },
        {
          time: "1:00 - 1:45 pm",
          activity: "Lunch"
        },
        {
          time: "2:30 - 5:30 pm",
          activity: "Personal Time"
        },
        {
          time: "5:30 - 7:00 pm",
          activity: "Evening Class / Meditation"
        },
        {
          time: "7:00 - 7:30 pm",
          activity: "Evening Meal"
        }
      ]
    };
  
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
                {scheduleData.tagline}
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
              {scheduleData.title}
            </h2>
          </div>
  
          {/* Schedule Items */}
          <div className="flex flex-col">
            {scheduleData.items.map((item, index) => (
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
                {index < scheduleData.items.length - 1 && (
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
  
  export default ShaktiScheduleSection;