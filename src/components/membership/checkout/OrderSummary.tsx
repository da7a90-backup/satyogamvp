'use client';

// Types for membership plan
interface MembershipPlan {
  id: string;
  title: string;
  monthlyPrice: number;
  yearlyPrice: number;
  tagline: string;
  features: string[];
  hasTrial?: boolean;
  trialDays?: number;
}

// Types for order summary
interface OrderSummaryData {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  discountCode?: string;
  trial?: {
    days: number;
  };
}

// Types for form data
interface FormData {
    acceptTerms: boolean;
    acceptNewsletter: boolean;
    [key: string]: string | boolean;
  }
  
  interface OrderSummaryProps {
    plan: MembershipPlan;
    isMonthly: boolean;
    orderSummary: OrderSummaryData;
    discountCode: string;
    onDiscountChange: (code: string) => void;
    onApplyDiscount: () => void;
    onRemoveDiscount: () => void;
    formData: FormData;
  }

export default function OrderSummary({
  plan,
  isMonthly,
  orderSummary,
  discountCode,
  onDiscountChange,
  onApplyDiscount,
  onRemoveDiscount,
  formData
}: OrderSummaryProps) {
  
  const price = isMonthly ? plan.monthlyPrice : plan.yearlyPrice;
  
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 sticky top-4">
      <h2 className="text-xl font-bold mb-4">{plan.title}</h2>
      
      <div className="mb-6">
        <div className="text-3xl font-bold">${orderSummary.total}<span className="text-lg font-normal text-gray-500">/mo</span></div>
        {plan.hasTrial && (
          <div className="text-sm text-gray-500 mt-1">{plan.trialDays} days free trial</div>
        )}
      </div>
      
      <div className="mb-6">
        <h3 className="font-medium mb-2">Includes:</h3>
        <ul className="space-y-2">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <svg className="h-5 w-5 text-gray-900 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
        <button className="text-purple-600 text-sm font-medium mt-3">View all details</button>
      </div>
      
      <div className="mb-6">
        <h3 className="font-medium mb-2">Discount code</h3>
        {orderSummary.discountCode ? (
          <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
            <span className="font-medium">"{orderSummary.discountCode}"</span>
            <button 
              onClick={onRemoveDiscount} 
              className="text-purple-600 font-medium"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="relative">
            <input 
              type="text" 
              value={discountCode}
              onChange={(e) => onDiscountChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter discount code"
            />
            <button 
              onClick={onApplyDiscount}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium"
            >
              Apply
            </button>
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-200 pt-4 mb-4">
        <div className="flex justify-between mb-2">
          <span>Subtotal</span>
          <span>${orderSummary.subtotal.toFixed(2)}</span>
        </div>
        {orderSummary.discount > 0 && (
          <div className="flex justify-between text-green-600 mb-2">
            <span>Discount {orderSummary.discountCode && `"${orderSummary.discountCode}"`}</span>
            <span>-${orderSummary.discount.toFixed(2)}</span>
          </div>
        )}
        {orderSummary.tax > 0 && (
          <div className="flex justify-between mb-2">
            <span>Tax</span>
            <span>${orderSummary.tax.toFixed(2)}</span>
          </div>
        )}
      </div>
      
      <div className="flex justify-between font-bold text-lg mb-6">
        <span>Total</span>
        <span>${orderSummary.total.toFixed(2)}</span>
      </div>
      
      <div className="text-sm text-gray-700 mb-4">
        Your subscription will automatically renew. After the {plan.hasTrial ? `${plan.trialDays} days free trial` : 'initial period'}, you will be charged ${price}/mo, plus applicable taxes, on each renewal until you cancel your subscription.
      </div>
      
      <div className="space-y-2">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.acceptTerms as boolean}
            readOnly
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">
            I accept the <a href="/terms" className="text-purple-600 hover:text-purple-500">Terms of Service</a> for Sat Yoga and confirm that I have reviewed the <a href="/privacy" className="text-purple-600 hover:text-purple-500">Privacy Policy</a>.
          </span>
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.acceptNewsletter as boolean}
            readOnly
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">
            I accept receiving the newsletter.
          </span>
        </label>
      </div>
      
      <div className="mt-6">
        <button
          type="button"
          className="w-full py-2 px-4 text-center text-blue-600 hover:text-blue-700 text-sm"
        >
          Need help? Chat with us!
        </button>
      </div>
    </div>
  )};