import Image from "next/image";

interface FeaturedQuoteProps {
  quoteText: string;
  authorName: string;
  authorImageUrl: string | null;
}

const FeaturedQuote = ({
  quoteText,
  authorName,
  authorImageUrl,
}: FeaturedQuoteProps) => {
  return (
    <blockquote className="relative p-6 border-l-4 border-purple-500 bg-purple-50 rounded-r-lg">
      <div className="relative z-10">
        <p className="text-xl italic text-gray-800 mb-4">"{quoteText}"</p>

        <footer className="flex items-center">
          {authorImageUrl && (
            <div className="mr-4 flex-shrink-0">
              <div className="relative h-14 w-14 rounded-full overflow-hidden">
                <Image
                  src={authorImageUrl}
                  alt={authorName}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
            </div>
          )}

          <cite className="font-medium text-purple-900 not-italic">
            {authorName}
          </cite>
        </footer>
      </div>

      {/* Decorative quote mark */}
      <svg
        className="absolute top-0 left-0 transform -translate-x-6 -translate-y-8 h-16 w-16 text-purple-200"
        fill="currentColor"
        viewBox="0 0 32 32"
        aria-hidden="true"
      >
        <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
      </svg>
    </blockquote>
  );
};

export default FeaturedQuote;
