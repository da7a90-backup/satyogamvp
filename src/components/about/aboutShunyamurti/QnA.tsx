'use client';

const QuestionsAnswersSection = () => {
  return (
    <section 
      className="relative w-full flex flex-col items-center overflow-hidden py-16 lg:py-28 px-8 lg:px-16"
      style={{
        backgroundColor: '#FAF8F1',
        gap: '80px'
      }}
    >
      {/* Content Container */}
      <div 
        className="w-full flex flex-col items-start"
        style={{
          maxWidth: '1312px',
          gap: '80px'
        }}
      >
        {/* Top Row - Title and Description */}
        <div 
          className="w-full flex flex-col lg:flex-row items-start"
          style={{
            gap: '80px'
          }}
        >
          {/* Left Column - Title */}
          <div 
            className="flex-1"
            style={{
              maxWidth: '616px'
            }}
          >
            <h2 
              className="text-black"
              style={{
                fontFamily: 'Optima, Georgia, serif',
                fontWeight: 550,
                fontSize: 'clamp(28px, 4vw, 48px)',
                lineHeight: '125%',
                letterSpacing: '-0.02em'
              }}
            >
              Questions and Answers with Shunyamurti
            </h2>
          </div>

          {/* Right Column - Description */}
          <div 
            className="flex-1"
            style={{
              maxWidth: '616px'
            }}
          >
            <p 
              className="text-gray-700"
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: '18px',
                lineHeight: '28px',
                color: '#384250'
              }}
            >
              One of the greatest joys of ashram life is gathering for sacred satsangs with Shunyamurti. These intimate meetings offer a rare opportunity to ask the deepest questions of the heart and receive precious guidance and Darshan.
            </p>
          </div>
        </div>

        {/* Video Container - Full Width */}
        <div 
          className="w-full"
          style={{
            maxWidth: '1312px'
          }}
        >
          <div 
            className="relative w-full overflow-hidden cursor-pointer"
            style={{
              aspectRatio: '1312/738',
              borderRadius: '16px',
              background: 'linear-gradient(61.31deg, rgba(0, 0, 0, 0.2) 14.27%, rgba(0, 0, 0, 0.18) 36.53%, rgba(0, 0, 0, 0) 56.93%), url(/qna.jpg), #CCCCCC',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Play Button */}
            <div 
              className="absolute inset-0 flex items-center justify-center"
            >
              <div 
                className="flex items-center justify-center w-20 h-20 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-300"
                style={{
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M8 5v14l11-7L8 5z" fill="#7D1A13"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuestionsAnswersSection;