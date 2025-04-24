"use client";

import { useState } from "react";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";

interface EnrollButtonProps {
  courseId: string | number;
  isFree: boolean;
  price: number;
}

const EnrollButton = ({ courseId, isFree, price }: EnrollButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleEnroll = async () => {
    setIsLoading(true);

    try {
      // If free, enroll directly
      if (isFree) {
        // Call your enrollment API here
        console.log(`Enrolling in free course ${courseId}`);
        // await enrollInCourse(courseId);

        // Show success message or redirect
        alert("Successfully enrolled in course!");
      } else {
        // Add to cart or redirect to checkout
        console.log(`Adding course ${courseId} to cart with price $${price}`);
        // await addToCart(courseId);

        // Redirect to cart/checkout
        // router.push('/cart');
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      alert("There was an error processing your request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleEnroll}
      disabled={isLoading}
      className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        <>
          {isFree ? (
            "Enroll Now - Free"
          ) : (
            <>
              <ShoppingCartIcon className="h-5 w-5 mr-2" />
              {`Enroll Now - $${price.toFixed(2)}`}
            </>
          )}
        </>
      )}
    </button>
  );
};

export default EnrollButton;
