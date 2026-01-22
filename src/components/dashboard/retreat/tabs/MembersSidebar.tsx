'use client';

import { useState, useEffect } from 'react';
import { getRetreatMembers, RetreatsAPIError } from '@/lib/retreats-api';

interface Member {
  id: string;
  name: string;
  avatar_url: string | null;
  registered_at: string;
}

interface MembersSidebarProps {
  retreatSlug: string;
}

export default function MembersSidebar({ retreatSlug }: MembersSidebarProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMembers();
  }, [retreatSlug]);

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getRetreatMembers(retreatSlug);
      setMembers(response.members);
    } catch (err: any) {
      console.error('[MembersSidebar] Error fetching members:', err);
      if (err instanceof RetreatsAPIError) {
        setError(err.message);
      } else {
        setError('Failed to load members');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 w-[372px]">
        <h3 className="text-xl font-bold text-black font-avenir">
          Members
        </h3>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7D1A13]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return null; // Silently fail if user doesn't have access
  }

  return (
    <div className="flex flex-col gap-6 w-[372px]">
      {/* Title */}
      <h3 className="text-xl font-bold text-black font-avenir">
        Members
      </h3>

      {/* Members Card */}
      <div className="flex flex-col bg-white border border-[#D2D6DB] rounded-lg p-4 gap-2 max-h-[400px] overflow-y-auto">
        {members.length === 0 ? (
          <p className="text-center text-gray-600 py-8 font-avenir">
            No members yet
          </p>
        ) : (
          members.map((member, index) => (
            <div key={member.id}>
              {/* Member Item */}
              <div className="flex flex-col gap-2">
                {/* Avatar and Name Row */}
                <div className="flex items-center gap-2">
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    {member.avatar_url ? (
                      <img
                        src={member.avatar_url}
                        alt={member.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-600 font-semibold font-inter">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <span className="font-bold text-[19px] leading-[140%] text-black font-inter flex-1">
                    {member.name}
                  </span>
                </div>

                {/* Registration Date */}
                <div className="pl-12">
                  <span className="text-base text-[#384250] font-avenir">
                    {formatDate(member.registered_at)}
                  </span>
                </div>
              </div>

              {/* Divider (not for last item) */}
              {index < members.length - 1 && (
                <div className="h-px bg-[#D2D6DB] my-2" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
