import Image from "next/image";
import EnrollButton from "./EnrollButton";

interface CourseHeaderProps {
  title: string;
  isFree: boolean;
  price: number;
  startDate: string | null;
  endDate: string | null;
  featuredImageUrl: string;
}

const CourseHeader = ({
  title,
  isFree,
  price,
  startDate,
  endDate,
  featuredImageUrl,
}: CourseHeaderProps) => {
  return (
    <div className="relative">
      {/* Featured Image with overlay */}
      <div className="relative h-96 w-full overflow-hidden rounded-xl">
        <Image
          src={featuredImageUrl}
          alt={title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
      </div>

      {/* Course title and basic info */}
      <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>

        <div className="flex flex-wrap items-center gap-4 mb-4">
          {/* Price */}
          <div className="bg-purple-700 rounded-full px-4 py-1 text-white font-bold">
            {isFree ? "Free" : `$${price.toFixed(2)}`}
          </div>

          {/* Dates */}
          {(startDate || endDate) && (
            <div className="text-white text-sm">
              {startDate && endDate ? (
                <>
                  {startDate} - {endDate}
                </>
              ) : (
                <>
                  {startDate && <span>Starts: {startDate}</span>}
                  {endDate && <span>Ends: {endDate}</span>}
                </>
              )}
            </div>
          )}
        </div>

        {/* Mobile-only Enroll Button */}
        <div className="md:hidden mt-4">
          <EnrollButton courseId="" isFree={isFree} price={price} />
        </div>
      </div>
    </div>
  );
};

export default CourseHeader;
