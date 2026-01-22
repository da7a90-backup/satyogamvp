# Membership Upgrade Flow - Implementation Status

## ✅ COMPLETED Backend Implementation

### 1. Database Schema Updates
- ✅ Updated `Subscription` model with new fields:
  - `trial_end_date`: Tracks when trial ends and charging should begin
  - `frequency`: Stores "monthly" or "annual"
  - `tilopay_subscription_id`: Stores Tilopay subscription ID for recurring payments
  - Added `TRIAL` status to `SubscriptionStatus` enum
- ✅ Created migration: `backend/migrations/022_add_subscription_trial_fields.sql`
- ✅ Migration applied successfully to database

### 2. Trial Management System
- ✅ Created `backend/app/services/subscription_manager.py`
  - `get_expiring_trials()`: Queries subscriptions with trials ending today
  - `charge_trial_subscription()`: Charges user after trial ends (partial - needs Tilopay API)
  - `handle_failed_trial_charge()`: Downgrades user to FREE on failed charge
  - `update_subscription_after_charge()`: Updates subscription to ACTIVE after successful charge
  - `process_all_expiring_trials()`: Main cron job function

### 3. Cron Job System
- ✅ Created `backend/app/routers/cron.py`
  - `POST /api/cron/process-trials`: Main endpoint for trial processing
  - `POST /api/cron/test-trial-processing`: Test endpoint
  - Protected with `X-Cron-Secret` header authentication
- ✅ Registered cron router in `main.py`
- ✅ Added `CRON_SECRET_KEY` to `config.py`

### 4. Payment Logic Updates
- ✅ Updated `grant_access_after_payment()` in `payments.py`
  - Properly handles trial subscriptions with `SubscriptionStatus.TRIAL`
  - Sets `trial_end_date` for Gyani trials (10 days from signup)
  - Grants immediate access during trial period
  - Stores frequency in Subscription record

### 5. Existing Functional Backend
- ✅ `POST /api/payments/membership`: Creates membership payment
- ✅ `POST /api/payments/webhook`: Processes Tilopay webhooks
- ✅ `GET /api/payments/subscription/current`: Gets user's subscription
- ✅ `POST /api/payments/subscription/cancel`: Cancels subscription (needs Tilopay API integration)

---

## 🚧 REMAINING WORK

### Phase 1: Frontend - Pricing Page (30 minutes)

**File:** `src/components/membership/Pricing.tsx`

**Changes needed:**
1. Add imports:
```typescript
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
```

2. In the `Pricing` component, add:
```typescript
const router = useRouter();
const { data: session } = useSession();
```

3. Pass router to `PricingCard`:
```typescript
const PricingCard = ({
  tier,
  tierData,
  router,
  session
}: {
  tier: string;
  tierData: PricingTierData;
  router: any;
  session: any;
})
```

4. Replace the disabled button (line 630-650):
```typescript
<button
  onClick={() => {
    // Check if user is logged in
    if (!session) {
      router.push('/login?redirect=/membership/checkout');
      return;
    }

    // Determine if this is Gyani with trial
    const trial = tier === 'gyani' ? 'true' : 'false';
    const frequency = isYearly ? 'annual' : 'monthly';

    // Navigate to checkout with params
    router.push(`/membership/checkout?tier=${tier}&frequency=${frequency}&trial=${trial}`);
  }}
  style={{
    background: '#7D1A13',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    fontFamily: 'Avenir Next, sans-serif',
    fontSize: '16px',
    fontWeight: 600,
    lineHeight: '24px',
    height: '44px',
    boxShadow:
      '0px 1px 2px rgba(16, 24, 40, 0.05), inset 0px 0px 0px 1px rgba(10, 13, 18, 0.18), inset 0px -2px 0px rgba(10, 13, 18, 0.05)',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
  }}
  onMouseEnter={(e) => e.currentTarget.style.background = '#5D0A0D'}
  onMouseLeave={(e) => e.currentTarget.style.background = '#7D1A13'}
>
  {tier === 'gyani' ? data.startTrialButton : data.signUpButton}
</button>
```

---

### Phase 2: Frontend - Checkout Page Route (1 hour)

**Create:** `src/app/membership/checkout/page.tsx`

```typescript
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import MembershipCheckoutClient from '@/components/membership/MembershipCheckoutClient';

export default async function MembershipCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string; frequency?: string; trial?: string }>;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect('/login?redirect=/membership/checkout');
  }

  const params = await searchParams;
  const { tier, frequency, trial } = params;

  // Validate required params
  if (!tier || !frequency) {
    redirect('/membership');
  }

  // Validate tier
  const validTiers = ['gyani', 'pragyani', 'pragyani_plus'];
  if (!validTiers.includes(tier)) {
    redirect('/membership');
  }

  // Validate frequency
  if (frequency !== 'monthly' && frequency !== 'annual') {
    redirect('/membership');
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MembershipCheckoutClient
        tier={tier}
        frequency={frequency}
        trial={trial === 'true'}
        session={session}
      />
    </Suspense>
  );
}
```

---

### Phase 3: Frontend - Checkout Client Component (2-3 hours)

**Update:** `src/components/membership/MembershipCheckoutClient.tsx`

**Pattern to Follow:** Use `src/components/courses/CoursePaymentClient.tsx` as the template

**Key Implementation Points:**

1. **State Management:**
```typescript
const [sdkInitialized, setSdkInitialized] = useState(false);
const [processing, setProcessing] = useState(false);
const [error, setError] = useState<string | null>(null);
```

2. **Billing Form:** (Same as course payment)
```typescript
const [formData, setFormData] = useState({
  firstName: session.user?.name?.split(' ')[0] || '',
  lastName: session.user?.name?.split(' ').slice(1).join(' ') || '',
  email: session.user?.email || '',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  telephone: '',
});
```

3. **Tilopay SDK Integration:**
```typescript
const initializeTilopaySDK = async () => {
  try {
    setProcessing(true);
    setError(null);

    // Call backend to create payment
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/payments/membership`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify({
          tier,
          frequency,
          trial: trial && tier === 'gyani',
        }),
      }
    );

    if (!response.ok) throw new Error('Failed to create payment');

    const data = await response.json();

    // Initialize Tilopay SDK V2
    const initialize = await window.Tilopay.Init({
      token: data.tilopay_key,
      currency: data.currency,
      amount: data.amount,
      orderNumber: data.order_number,
      capture: '1',
      redirect: `${window.location.origin}/dashboard/user?upgrade=success`,
      subscription: data.is_subscription ? 1 : 0,  // IMPORTANT: 1 for monthly, 0 for annual
      billToFirstName: data.first_name,
      billToLastName: data.last_name,
      billToEmail: data.customer_email,
      billToAddress: formData.address,
      billToAddress2: '',
      billToCity: formData.city,
      billToState: formData.state,
      billToZipPostCode: formData.postalCode,
      billToCountry: formData.country,
      billToTelephone: formData.telephone || '',
    });

    if (!initialize || initialize.message !== 'Success') {
      throw new Error(initialize?.message || 'SDK initialization failed');
    }

    setSdkInitialized(true);
    setProcessing(false);
  } catch (err: any) {
    setError(err.message || 'Failed to initialize payment');
    setProcessing(false);
  }
};
```

4. **Payment Submission:**
```typescript
const handlePayment = async () => {
  if (!sdkInitialized) {
    alert('Please click "Proceed to Payment" first');
    return;
  }

  // Validate payment form fields
  const paymentMethod = (document.getElementById('tlpy_payment_method') as HTMLSelectElement)?.value;
  if (!paymentMethod) {
    alert('Please select a payment method');
    return;
  }

  try {
    setProcessing(true);
    await window.Tilopay.startPayment();
    // Tilopay will redirect to success URL or webhook will process
  } catch (err: any) {
    setError(err.message || 'Payment failed');
    setProcessing(false);
  }
};
```

5. **UI Structure:**
```tsx
return (
  <div>
    {/* Header */}
    <h1>Complete Your {tier.toUpperCase()} Membership</h1>

    {/* Order Summary */}
    <div>
      <h2>Order Summary</h2>
      <p>Tier: {tier}</p>
      <p>Billing: {frequency}</p>
      {trial && <p>🎉 Includes 10-day free trial!</p>}
      <p>Amount: ${amount}</p>
    </div>

    {/* Billing Form */}
    <form>
      {/* All billing fields */}
    </form>

    {/* Proceed to Payment Button */}
    {!sdkInitialized && (
      <button onClick={handleProceedToPayment} disabled={processing}>
        {processing ? 'Loading...' : 'Proceed to Payment'}
      </button>
    )}

    {/* Payment Form (injected by Tilopay SDK) */}
    {sdkInitialized && (
      <div>
        <div id="tlpy_payment_method"></div>
        <div id="tlpy_cc_number"></div>
        <div id="tlpy_cc_expiration_date"></div>
        <div id="tlpy_cvv"></div>
        <div id="responseTilopay"></div>

        <button onClick={handlePayment} disabled={processing}>
          {processing ? 'Processing...' : `Pay $${amount}`}
        </button>
      </div>
    )}

    {error && <div style={{ color: 'red' }}>{error}</div>}
  </div>
);
```

6. **Load Tilopay Script:** Add to `useEffect`:
```typescript
useEffect(() => {
  // Load Tilopay SDK V2
  const script = document.createElement('script');
  script.src = 'https://app.tilopay.com/sdk/v2/sdk_tpay.min.js';
  script.async = true;
  document.body.appendChild(script);

  return () => {
    document.body.removeChild(script);
  };
}, []);
```

---

### Phase 4: Frontend - Update Upgrade CTAs (30 minutes)

#### A. Dashboard Home (`src/app/dashboard/user/page.tsx`)

**Line ~662-668:** Update Forum unlock CTA:
```typescript
<Link href="/membership" className="...">
  Upgrade Now
</Link>
```

**Line ~745:** Update trial CTA:
```typescript
<Link href="/membership">Start free trial</Link>
<Link href="/membership">View more details</Link>
```

#### B. Billing Settings (`src/app/dashboard/user/settings/billing/page.tsx`)

**Line ~170-172:** Add onClick handler:
```typescript
<button
  onClick={() => router.push('/membership')}
  className="..."
>
  Upgrade plan →
</button>
```

Add to component:
```typescript
'use client';
import { useRouter } from 'next/navigation';

// In component:
const router = useRouter();
```

#### C. User Sidebar (`src/components/dashboard/UserSidebar.tsx`)

**Add after line ~205:** Add upgrade button:
```typescript
{userTier === 'FREE' && (
  <button
    onClick={() => router.push('/membership')}
    style={{
      background: '#7D1A13',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '6px',
      padding: '8px 12px',
      width: '100%',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      marginBottom: '16px',
    }}
  >
    Upgrade Membership
  </button>
)}
```

---

### Phase 5: Backend - Complete Subscription Cancellation (1 hour)

**File:** `backend/app/routers/payments.py`

**Update the cancel subscription endpoint (line ~621-662):**

```python
@router.post("/subscription/cancel")
async def cancel_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Cancel the current user's active subscription."""
    subscription = (
        db.query(Subscription)
        .filter(
            Subscription.user_id == current_user.id,
            Subscription.status == SubscriptionStatus.ACTIVE,
        )
        .order_by(Subscription.created_at.desc())
        .first()
    )

    if not subscription:
        raise HTTPException(status_code=404, detail="No active subscription found")

    # TODO: Call Tilopay API to cancel recurring payment
    # if subscription.tilopay_subscription_id:
    #     cancel_response = await tilopay_service.cancel_subscription(
    #         subscription_id=subscription.tilopay_subscription_id
    #     )
    #     if not cancel_response.get("success"):
    #         raise HTTPException(status_code=500, detail="Failed to cancel recurring payment with Tilopay")

    # Update subscription status
    subscription.status = SubscriptionStatus.CANCELLED
    subscription.auto_renew = False

    # User keeps access until end_date
    # Don't immediately downgrade - they paid for the period

    db.commit()

    logger.info(f"Subscription cancelled for user {current_user.id} - access until {subscription.end_date}")

    return {
        "success": True,
        "message": "Subscription cancelled successfully",
        "access_until": subscription.end_date,
        "tier": subscription.tier,
    }
```

---

### Phase 6: Testing Checklist

#### Backend Testing:
1. ✅ Database migration applied
2. ⏳ Test membership payment creation: `POST /api/payments/membership`
3. ⏳ Test webhook processing with trial metadata
4. ⏳ Test trial subscription creation (status=TRIAL, trial_end_date set)
5. ⏳ Test cron job: `POST /api/cron/process-trials` (with X-Cron-Secret header)
6. ⏳ Test subscription cancellation

#### Frontend Testing:
1. ⏳ Test pricing page buttons navigate to checkout
2. ⏳ Test checkout page loads with correct tier/frequency
3. ⏳ Test Tilopay SDK initialization
4. ⏳ Test payment form submission
5. ⏳ Test webhook grants access and creates TRIAL subscription
6. ⏳ Test all upgrade CTAs navigate correctly

#### End-to-End Testing:
1. ⏳ New user signs up (FREE tier)
2. ⏳ User clicks "Start free trial" on dashboard
3. ⏳ User lands on pricing page
4. ⏳ User clicks Gyani trial button
5. ⏳ User redirected to checkout with tier=gyani&frequency=monthly&trial=true
6. ⏳ User fills billing form
7. ⏳ User proceeds to payment
8. ⏳ Tilopay SDK loads payment form
9. ⏳ User enters card (use test card if available)
10. ⏳ Payment processes successfully
11. ⏳ Webhook fires and grants access
12. ⏳ Subscription created with status=TRIAL
13. ⏳ User redirected to dashboard with GYANI access
14. ⏳ User can access Gyani-locked features
15. ⏳ After 10 days, cron job charges card (manual test)
16. ⏳ If charge succeeds, subscription becomes ACTIVE
17. ⏳ If charge fails, user downgraded to FREE

---

## 🔧 Environment Variables

Add to `.env`:
```bash
# Already exists:
TILOPAY_API_KEY=your_key
TILOPAY_API_USER=your_user
TILOPAY_API_PASSWORD=your_password

# New:
CRON_SECRET_KEY=your-secure-random-string-for-cron-auth
```

---

## 📅 Cron Job Setup

### Option 1: External Cron Service (Recommended)

Use a service like:
- **GitHub Actions** (free)
- **Vercel Cron** (if deployed on Vercel)
- **Render Cron Jobs** (if deployed on Render)
- **EasyCron** or similar

Example cron expression (daily at 2am UTC):
```
0 2 * * *
```

HTTP Request:
```bash
POST https://api.satyoga.com/api/cron/process-trials
Header: X-Cron-Secret: your-secret-key
```

### Option 2: Server Cron (Linux/macOS)

Add to crontab:
```bash
0 2 * * * curl -X POST -H "X-Cron-Secret: your-secret-key" https://api.satyoga.com/api/cron/process-trials
```

---

## ⚠️ Known Limitations & TODOs

### 1. **Tilopay Recurring Billing API Not Implemented**
**Status:** ⚠️ CRITICAL GAP

The subscription_manager.py `charge_trial_subscription()` function has a placeholder for charging stored cards:

```python
# TODO: Implement Tilopay recurring charge
# charge_response = await self.tilopay.charge_subscription(
#     subscription_id=subscription.tilopay_subscription_id,
#     amount=amount,
#     order_id=str(payment.id)
# )
```

**Solution Options:**
1. **Contact Tilopay Support:** Request API documentation for charging stored cards/subscriptions
2. **Manual Workaround:** Send email to user with payment link when trial expires
3. **Alternative:** Use Tilopay's built-in subscription feature (if available) instead of manual trial management

### 2. **Trial End Email Notifications Not Implemented**
**Files to Create:**
- `backend/app/services/sendgrid_service.py` - Add `send_trial_ending_email()` method
- Send 3 days before trial ends
- Send on trial end day if charge fails

### 3. **Webhook Tilopay Subscription ID Not Captured**
The webhook handler needs to capture and store Tilopay's subscription/customer ID for future recurring charges. Check Tilopay webhook payload for this field.

### 4. **No Admin Dashboard for Subscriptions**
Need to add admin views:
- View all subscriptions
- View trial subscriptions ending soon
- View failed charges
- Manually process failed trials

---

## 📚 Reference Files

**Backend (Completed):**
- ✅ `backend/app/models/membership.py` - Updated Subscription model
- ✅ `backend/migrations/022_add_subscription_trial_fields.sql` - Migration
- ✅ `backend/app/services/subscription_manager.py` - Trial management
- ✅ `backend/app/routers/cron.py` - Cron endpoints
- ✅ `backend/app/routers/payments.py` - Updated grant_access function
- ✅ `backend/app/core/config.py` - Added CRON_SECRET_KEY

**Frontend (Needs Work):**
- ⏳ `src/components/membership/Pricing.tsx` - Enable buttons
- ⏳ `src/app/membership/checkout/page.tsx` - Create route
- ⏳ `src/components/membership/MembershipCheckoutClient.tsx` - Implement payment flow
- ⏳ `src/app/dashboard/user/page.tsx` - Update CTAs
- ⏳ `src/app/dashboard/user/settings/billing/page.tsx` - Update upgrade button
- ⏳ `src/components/dashboard/UserSidebar.tsx` - Add upgrade button

**Reference Implementation:**
- 📖 `src/components/courses/CoursePaymentClient.tsx` - Working Tilopay SDK integration

---

## 🎯 Next Immediate Steps

1. **Enable Pricing Page Buttons** (30 min)
2. **Create Checkout Page Route** (1 hour)
3. **Implement Checkout Client** (2-3 hours)
4. **Update All CTAs** (30 min)
5. **Test End-to-End Flow** (1 hour)
6. **Setup Cron Job** (30 min)
7. **Contact Tilopay for Recurring Charge API** (blocking)

**Total Estimated Time Remaining: 6-8 hours**

---

## 📞 Support & Questions

- **Tilopay Support:** sac@tilopay.com
- **Tilopay Docs:** https://tilopay.com/documentacion
- **Project Status:** See PROJECT_STATUS.md

---

**Last Updated:** 2026-01-22
**Status:** Backend Complete (✅) | Frontend In Progress (🚧)
