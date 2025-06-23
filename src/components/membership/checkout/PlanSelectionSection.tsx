'use client';

// Types for membership plans
interface MembershipPlan {
  id: string;
  title: string;
  monthlyPrice: number;
  yearlyPrice: number;
  annualSavings: number;
  tagline: string;
  features: string[];
  hasTrial?: boolean;
  trialDays?: number;
  popular?: boolean;
}

interface PlanSelectionSectionProps {
  plans: MembershipPlan[];
  selectedPlan: string;
  isMonthly: boolean;
  onSelectPlan: (planId: string) => void;
  onToggleBilling: () => void;
}

export default function PlanSelectionSection({
  plans,
  selectedPlan,
  isMonthly,
  onSelectPlan,
  onToggleBilling
}: PlanSelectionSectionProps) {
  return (
    <div className="mb-8">
      <h2 className="text-purple-600 text-lg font-medium mb-4">2. Choose your plan</h2>
      <p className="text-gray-700 mb-4">Select a membership plan that best suits your spiritual journey.</p>
      
      {/* Billing toggle */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex items-center bg-gray-100 rounded-full p-1">
          <button
            type="button"
            onClick={() => isMonthly ? null : onToggleBilling()}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              isMonthly ? 'bg-white shadow' : 'text-gray-700'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => isMonthly ? onToggleBilling() : null}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              !isMonthly ? 'bg-white shadow' : 'text-gray-700'
            }`}
          >
            Yearly (save 25%)
          </button>
        </div>
      </div>
      
      {/* Plan options */}
      <div className="space-y-4">
        {plans.map((plan) => {
          const price = isMonthly ? plan.monthlyPrice : plan.yearlyPrice;
          const billingLabel = isMonthly 
            ? 'Billed Monthly' 
            : `Billed Annually (Save ${plan.annualSavings}$)`;
          
          return (
            <div
              key={plan.id}
              className={`border rounded-lg p-4 ${
                selectedPlan === plan.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${plan.popular ? 'relative' : ''}`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-purple-100 text-purple-600 text-xs font-medium px-2 py-1 rounded-bl-lg">
                  Most recommended
                </div>
              )}
              
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  className="form-radio h-5 w-5 text-purple-600 focus:ring-purple-500"
                  checked={selectedPlan === plan.id}
                  onChange={() => onSelectPlan(plan.id)}
                />
                
                <div className="ml-4 flex-grow">
                  <div className="flex flex-wrap items-baseline">
                    <h3 className="text-lg font-medium mr-2">{plan.title}</h3>
                    <div className="flex items-center">
                      <span className="text-2xl font-bold">${price}</span>
                      <span className="text-gray-500 ml-1">/mo</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-1">{billingLabel}</p>
                  
                  {plan.hasTrial && (
                    <div className="text-sm text-gray-700 mb-2">
                      {plan.trialDays} days free trial
                    </div>
                  )}
                  
                  <p className="text-gray-700 font-medium mt-2">{plan.tagline}</p>
                </div>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}