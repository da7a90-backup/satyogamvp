'use client';

const BooksSection = () => {
  const books = [
    {
      id: 1,
      title: "The seven veils of Maya",
      category: "Shunyamurti Reads",
      price: "$20.00",
      type: "Text",
      image: "/bookcover1.jpg",
      description: "Lorem ipsum dolor sit amet consectetur. Gravida nunc magna ac non tincidunt cras odio egestas leo. Lorem ipsum dolor sit amet consectetur. Gravida nunc magna ac non tincidunt cras odio egestas leo."
    },
    {
      id: 2,
      title: "The secret of singularity",
      category: "Guided meditation",
      price: "$20.00", 
      type: "Audio",
      image: "/bookcover2.png",
      description: "Lorem ipsum dolor sit amet consectetur. Gravida nunc magna ac non tincidunt cras odio egestas leo. Lorem ipsum dolor sit amet consectetur. Gravida nunc magna ac non tincidunt cras odio egestas leo."
    },
    {
      id: 3,
      title: "Tibetan Zen",
      category: "Shunyamurti Reads",
      price: "$20.00",
      type: "Text", 
      image: "/bookcover3.jpg",
      description: "Lorem ipsum dolor sit amet consectetur. Gravida nunc magna ac non tincidunt cras odio egestas leo. Lorem ipsum dolor sit amet consectetur. Gravida nunc magna ac non tincidunt cras odio egestas leo."
    }
  ];

  return (
    <section 
      className="relative w-full flex flex-col items-start py-16 lg:py-28 px-4 lg:px-16"
      style={{
        backgroundColor: '#FAF8F1'
      }}
    >
      {/* Content Container */}
      <div 
        className="w-full flex flex-col items-start"
        style={{
          maxWidth: '1312px',
          margin: '0 auto',
          gap: '32px'
        }}
      >
        {/* Section Title */}
        <div 
          className="w-full flex flex-col justify-center items-center mx-auto"
          style={{
            maxWidth: '768px',
            gap: '16px'
          }}
        >
          {/* Tagline */}
          <div className="flex items-center">
            <span 
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                lineHeight: '24px',
                color: '#B8860B',
                letterSpacing: '0.1em',
                textTransform: 'uppercase'
              }}
            >
              STORE
            </span>
          </div>

          {/* Main Title */}
          <h2 
            className="text-black text-center w-full"
            style={{
              fontFamily: 'Optima, Georgia, serif',
              fontWeight: 550,
              fontSize: 'clamp(28px, 4vw, 48px)',
              lineHeight: '125%',
              letterSpacing: '-0.02em'
            }}
          >
            Books by Shunyamurti
          </h2>

          {/* Description */}
          <p 
            className="text-center w-full"
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '16px',
              fontWeight: 500,
              lineHeight: '24px',
              color: '#384250'
            }}
          >
            Shunyamurti's books convey the knowledge needed to gain mastery over the ego mind and attain complete liberation from illusion and anxiety—in fact, to transcend every kind of suffering. This is the great value of understanding these teachings. Four mind-expanding and heart-opening volumes have been published:
          </p>
        </div>

        {/* Book Count and View All */}
        <div 
          className="w-full flex flex-row justify-between items-end"
          style={{
            gap: '40px'
          }}
        >
          {/* Book Count */}
          <span 
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '18px',
              fontWeight: 600,
              lineHeight: '28px',
              color: '#111927'
            }}
          >
            2423 items
          </span>

          {/* View All Button */}
          <button
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '10px 16px',
              gap: '6px',
              width: '94px',
              height: '44px',
              background: '#7D1A13',
              boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05), inset 0px 0px 0px 1px rgba(10, 13, 18, 0.18), inset 0px -2px 0px rgba(10, 13, 18, 0.05)',
              borderRadius: '8px',
              border: 'none',
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              lineHeight: '20px',
              color: '#FFFFFF',
              cursor: 'pointer'
            }}
          >
            View all
          </button>
        </div>

        {/* Books Grid - 3 Cards */}
        <div 
          className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          style={{
            gap: '32px'
          }}
        >
          {books.map((book) => (
            <div 
              key={book.id} 
              className="flex flex-col items-start"
              style={{
                width: '421px',
                height: '583px',
                gap: '8px',
                isolation: 'isolate'
              }}
            >
              {/* Book Image Container */}
              <div 
                className="relative w-full"
                style={{
                  width: '421px',
                  height: '356px',
                  background: '#E4DBCD',
                  borderRadius: '8px'
                }}
              >
                {/* Heart/Bookmark Icon */}
                <div 
                  className="absolute flex justify-center items-center"
                  style={{
                    width: '80px',
                    height: '80px',
                    right: '0px',
                    top: '0px',
                    padding: '16px'
                  }}
                >
                  <div 
                    className="flex justify-center items-center"
                    style={{
                      width: '48px',
                      height: '48px',
                      background: 'rgba(0, 0, 0, 0.1)',
                      borderRadius: '80px'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.6665 11.9869V6.47136C2.6665 4.04912 2.6665 2.838 3.44755 2.0855C4.2286 1.33301 5.48568 1.33301 7.99984 1.33301C10.514 1.33301 11.7711 1.33301 12.5521 2.0855C13.3332 2.838 13.3332 4.04912 13.3332 6.47136V11.9869C13.3332 13.5241 13.3332 14.2927 12.8179 14.5679C11.8202 15.1006 9.94864 13.3231 9.05984 12.7879C8.54437 12.4776 8.28663 12.3224 7.99984 12.3224C7.71304 12.3224 7.45531 12.4776 6.93984 12.7879C6.05104 13.3231 4.17948 15.1006 3.18174 14.5679C2.6665 14.2927 2.6665 13.5241 2.6665 11.9869Z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2.6665 4.66602H13.3332" stroke="black" strokeWidth="1.5"/>
                    </svg>
                  </div>
                </div>

                {/* Book Cover Image */}
                <div
                  className="absolute"
                  style={{
                    width: '169.24px',
                    height: '269px',
                    left: '126px',
                    top: '48px'
                  }}
                >
                  <img
                    src={book.image}
                    alt={book.title}
                    className="w-full h-full object-cover"
                    style={{
                      borderRadius: '2.37536px',
                      boxShadow: '4.27565px 4.27565px 9.50144px rgba(0, 0, 0, 0.25)'
                    }}
                    onError={(e: any) => {
                      e.target.style.backgroundColor = '#D4C5B3';
                      e.target.style.display = 'flex';
                      e.target.style.alignItems = 'center';
                      e.target.style.justifyContent = 'center';
                      e.target.innerHTML = `<span style="color: #6b7280; font-size: 14px; text-align: center;">${book.title}</span>`;
                    }}
                  />
                </div>

                {/* Type Badge */}
                <div 
                  className="absolute flex items-center"
                  style={{
                    width: '34.47px',
                    height: '21.56px',
                    left: '13px',
                    bottom: '12.44px'
                  }}
                >
                  <div
                    className="flex justify-center items-center"
                    style={{
                      width: '34.47px',
                      height: '21.56px',
                      background: 'rgba(82, 82, 82, 0.4)',
                      backdropFilter: 'blur(4px)',
                      borderRadius: '5.38947px',
                      padding: '1.34737px 8.08421px 1.34737px 5.38947px'
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '10px',
                        fontWeight: 500,
                        lineHeight: '18px',
                        color: '#F3F4F6'
                      }}
                    >
                      {book.type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content Bottom */}
              <div 
                className="flex flex-col items-start"
                style={{
                  width: '421px',
                  height: '219px',
                  gap: '16px'
                }}
              >
                {/* Header with Category, Title, and Price */}
                <div 
                  className="flex flex-row items-start w-full"
                  style={{
                    gap: '16px',
                    height: '51px'
                  }}
                >
                  {/* Category and Title */}
                  <div 
                    className="flex flex-col items-start flex-1"
                    style={{
                      gap: '8px',
                      height: '51px'
                    }}
                  >
                    {/* Category */}
                    <span 
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 700,
                        fontSize: '14px',
                        lineHeight: '150%',
                        color: '#942017'
                      }}
                    >
                      {book.category}
                    </span>

                    {/* Title */}
                    <h3 
                      style={{
                        fontFamily: 'Avenir Next, sans-serif',
                        fontWeight: 600,
                        fontSize: '20px',
                        lineHeight: '30px',
                        color: '#000000'
                      }}
                    >
                      {book.title}
                    </h3>
                  </div>

                  {/* Price */}
                  <div 
                    style={{
                      width: '62px',
                      height: '30px'
                    }}
                  >
                    <span 
                      style={{
                        fontFamily: 'Roboto, sans-serif',
                        fontWeight: 600,
                        fontSize: '20px',
                        lineHeight: '150%',
                        color: '#000000'
                      }}
                    >
                      {book.price}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p 
                  style={{
                    width: '421px',
                    height: '96px',
                    fontFamily: 'Avenir Next, sans-serif',
                    fontWeight: 400,
                    fontSize: '16px',
                    lineHeight: '24px',
                    color: '#384250'
                  }}
                >
                  {book.description}
                </p>

                {/* Add to Cart Button */}
                <button
                  style={{
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '10px 14px',
                    gap: '4px',
                    width: '421px',
                    height: '40px',
                    background: '#FFFFFF',
                    border: '1px solid #D5D7DA',
                    boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05), inset 0px 0px 0px 1px rgba(10, 13, 18, 0.18), inset 0px -2px 0px rgba(10, 13, 18, 0.05)',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <div 
                    className="flex justify-center items-center"
                    style={{
                      padding: '0px 2px',
                      width: '77px',
                      height: '20px'
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'Avenir Next, sans-serif',
                        fontWeight: 600,
                        fontSize: '14px',
                        lineHeight: '20px',
                        color: '#414651'
                      }}
                    >
                      Add to cart
                    </span>
                  </div>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BooksSection;