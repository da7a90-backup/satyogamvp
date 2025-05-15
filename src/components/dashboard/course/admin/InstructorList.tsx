import Image from "next/image";
import Link from "next/link";
import { UserIcon } from "@heroicons/react/24/solid";

interface Instructor {
  id: number;
  attributes: {
    name: string;
    title?: string;
    bio?: string;
    avatar?: {
      data?: {
        attributes: {
          url: string;
        };
      };
    };
    slug?: string;
  };
}

interface InstructorListProps {
  instructors: Instructor[];
}

const InstructorList = ({ instructors }: InstructorListProps) => {
  return (
    <div className="space-y-8">
      {instructors.map((instructor) => {
        const { id, attributes } = instructor;

        // Get avatar URL if available
        const avatarUrl = attributes.avatar?.data
          ? `${process.env.NEXT_PUBLIC_STRAPI_URL}${attributes.avatar.data.attributes.url}`
          : null;

        return (
          <div
            key={id}
            className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 bg-gray-50 rounded-lg"
          >
            {/* Avatar */}
            <div className="flex-shrink-0">
              {avatarUrl ? (
                <div className="relative h-16 w-16 rounded-full overflow-hidden">
                  <Image
                    src={avatarUrl}
                    alt={attributes.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center">
                  <UserIcon className="h-8 w-8 text-purple-700" />
                </div>
              )}
            </div>

            {/* Instructor details */}
            <div className="flex-1">
              <h3 className="text-lg font-bold">
                {attributes.slug ? (
                  <Link
                    href={`/instructor/${attributes.slug}`}
                    className="text-purple-700 hover:text-purple-900"
                  >
                    {attributes.name}
                  </Link>
                ) : (
                  attributes.name
                )}
              </h3>

              {attributes.title && (
                <p className="text-gray-600 text-sm mb-2">{attributes.title}</p>
              )}

              {attributes.bio && (
                <p className="text-gray-800 line-clamp-3">{attributes.bio}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InstructorList;
