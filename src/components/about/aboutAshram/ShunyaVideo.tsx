'use client';

const ShunyamurtiVideoSection = () => {
  return (
    <section 
      className="relative w-full flex flex-col items-center py-16 lg:py-28 px-4 lg:px-16"
      style={{
        backgroundColor: '#FAF8F1'
      }}
    >
      {/* Content Container */}
      <div 
        className="w-full flex flex-col items-center"
        style={{
          maxWidth: '1312px',
          gap: '40px'
        }}
      >
        {/* Video Container */}
        <div 
          className="w-full"
          style={{
            maxWidth: '1168px'
          }}
        >
          <div 
            className="relative w-full overflow-hidden cursor-pointer"
            style={{
              aspectRatio: '16/9',
              borderRadius: '16px',
              background: 'url(/shunyavideo.png)',
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

            {/* Video progress indicator (optional) */}
            <div 
              className="absolute bottom-4 left-4 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded"
              style={{
                fontFamily: 'Inter, sans-serif'
              }}
            >
              (k)
            </div>
          </div>
        </div>

        {/* Video Description */}
        <div 
          className="w-full flex justify-center"
          style={{
            maxWidth: '1168px'
          }}
        >
          <p 
            className="text-center"
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '16px',
              lineHeight: '24px',
              color: '#384250',
              fontWeight: 400
            }}
          >
            In this short video, recorded during a recent satsang, Shunyamurti explains some of the work of the community, and the vision for a network of flourishing self-sustaining, spiritual communities.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ShunyamurtiVideoSection;