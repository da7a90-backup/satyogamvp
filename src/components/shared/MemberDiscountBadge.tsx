'use client';

interface MemberDiscountBadgeProps {
  membershipTier?: string | null;
  discountPercentage?: number;
}

/**
 * Badge component to show member discount information
 * Displays discount percentage based on membership tier
 */
export default function MemberDiscountBadge({
  membershipTier,
  discountPercentage
}: MemberDiscountBadgeProps) {
  // Determine discount percentage based on tier if not provided
  const getDiscountPercentage = () => {
    if (discountPercentage) return discountPercentage;

    switch(membershipTier?.toUpperCase()) {
      case 'GYANI':
        return 10;
      case 'PRAGYANI':
        return 15;
      case 'PRAGYANI_PLUS':
        return 20;
      default:
        return 0;
    }
  };

  const discount = getDiscountPercentage();

  // Don't show for free members
  if (!membershipTier || membershipTier === 'FREE' || discount === 0) {
    return null;
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
      <div className="flex items-center gap-2">
        <svg
          className="w-5 h-5 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div className="flex-1">
          <p className="text-sm font-semibold text-green-900">
            Member Discount Applied
          </p>
          <p className="text-xs text-green-700">
            You save {discount}% as a {membershipTier} member
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Calculate discounted price
 */
export function calculateDiscountedPrice(
  originalPrice: number,
  membershipTier?: string | null
): { originalPrice: number; discountedPrice: number; savings: number; discountPercentage: number } {
  let discountPercentage = 0;

  switch(membershipTier?.toUpperCase()) {
    case 'GYANI':
      discountPercentage = 10;
      break;
    case 'PRAGYANI':
      discountPercentage = 15;
      break;
    case 'PRAGYANI_PLUS':
      discountPercentage = 20;
      break;
    default:
      discountPercentage = 0;
  }

  const discountedPrice = originalPrice * (1 - discountPercentage / 100);
  const savings = originalPrice - discountedPrice;

  return {
    originalPrice,
    discountedPrice,
    savings,
    discountPercentage
  };
}
