"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  CreditCardIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { courseApi } from "@/lib/courseApi";

interface PaymentPageProps {
  courseId: string;
  courseSlug: string;
}

const PaymentPage = ({ courseId, courseSlug }: PaymentPageProps) => {
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        const response = await courseApi.getCourse(courseId);
        setCourse(response.data);
      } catch (err) {
        console.error("Error fetching course:", err);
        setError("Failed to load course details");
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // After "payment", enroll the user in the course
      await courseApi.enrollInCourse(courseId);

      // Redirect to success page or course page
      router.push(`/dashboard/user/courses/${courseSlug}?enrolled=true`);
    } catch (err) {
      console.error("Error processing payment:", err);
      setError("Payment failed. Please try again.");
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
        <div className="mt-4">
          <Link
            href="/dashboard/user/courses"
            className="text-purple-600 hover:underline flex items-center"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to courses
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="container mx-auto px-4 py-4">
        <Link
          href={`/dashboard/user/courses/${courseSlug}`}
          className="text-gray-600 hover:text-gray-900 flex items-center"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to course
        </Link>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Complete your purchase
          </h1>

          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Order Summary
              </h2>

              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">
                  {course?.attributes?.title}
                </span>
                <span className="font-medium">
                  {formatPrice(course?.attributes?.price || 0)}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                <span>Course access</span>
                <span>Lifetime</span>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(course?.attributes?.price || 0)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <CreditCardIcon className="h-5 w-5 mr-2 text-gray-600" />
                Payment Method
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label
                    htmlFor="cardName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Name on card
                  </label>
                  <input
                    type="text"
                    id="cardName"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="John Smith"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="cardNumber"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Card number
                  </label>
                  <input
                    type="text"
                    id="cardNumber"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) =>
                      setCardNumber(
                        e.target.value.replace(/\D/g, "").slice(0, 16)
                      )
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label
                      htmlFor="expiryDate"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Expiry date
                    </label>
                    <input
                      type="text"
                      id="expiryDate"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="cvv"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      CVV
                    </label>
                    <input
                      type="text"
                      id="cvv"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) =>
                        setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center text-sm text-gray-500 mb-6">
                  <LockClosedIcon className="h-4 w-4 mr-1 text-gray-400" />
                  <span>Your payment information is secure and encrypted</span>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 px-6 bg-black text-white font-medium rounded-md hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></span>
                      Processing...
                    </span>
                  ) : (
                    `Pay ${formatPrice(course?.attributes?.price || 0)}`
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
