# Tilopay Embedded Payment Integration Guide

## 🎯 Overview

This guide shows how to implement **in-page embedded payments** with Tilopay (instead of redirecting to Tilopay's hosted page).

## 🔄 Payment Flow

```
1. User initiates payment
   ↓
2. Frontend calls backend API
   ↓
3. Backend creates payment session
   ↓
4. Backend returns payment data
   ↓
5. Frontend embeds Tilopay form in page
   ↓
6. User completes payment in-page
   ↓
7. Tilopay sends webhook to backend
   ↓
8. Backend grants access automatically
```

## 🛠️ Backend (Already Implemented)

### API Endpoint

```
POST /api/payments/create
```

**Request:**
```json
{
  "amount": 100.00,
  "payment_type": "course",
  "reference_id": "course-uuid",
  "description": "Course Enrollment"
}
```

**Response:**
```json
{
  "payment_id": "payment-uuid",
  "order_id": "ORD-123456",
  "payment_data": {
    "key": "your-tilopay-api-key",
    "amount": "100.00",
    "currency": "USD",
    "description": "Course Enrollment",
    "orderId": "ORD-123456",
    "email": "user@example.com",
    "name": "John Doe",
    "signature": "generated-signature"
  }
}
```

## 💻 Frontend Implementation

### Step 1: Add Tilopay Script to Your Page

In your Next.js page or layout, add the Tilopay JavaScript SDK:

```tsx
// app/payment/page.tsx or similar
import Script from 'next/script';

export default function PaymentPage() {
  return (
    <>
      {/* Tilopay SDK */}
      <Script
        src="https://cdn.tilopay.com/js/tilopay.min.js"
        strategy="afterInteractive"
      />

      {/* Your payment form component */}
      <PaymentForm />
    </>
  );
}
```

### Step 2: Create Payment Form Component

```tsx
// components/payment/TilopayEmbedded.tsx
'use client';

import { useState } from 'react';

interface PaymentData {
  key: string;
  amount: string;
  currency: string;
  description: string;
  orderId: string;
  email: string;
  name: string;
  signature: string;
}

interface TilopayEmbeddedProps {
  amount: number;
  paymentType: 'course' | 'retreat' | 'membership' | 'donation' | 'product';
  referenceId?: string;
  description: string;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
}

export default function TilopayEmbedded({
  amount,
  paymentType,
  referenceId,
  description,
  onSuccess,
  onError,
}: TilopayEmbeddedProps) {
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  const initiatePayment = async () => {
    setLoading(true);

    try {
      // Call your backend API
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          amount,
          payment_type: paymentType,
          reference_id: referenceId,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to create payment');
      }

      // Store payment data
      setPaymentData(data.payment_data);

      // Initialize Tilopay embedded form
      setTimeout(() => {
        initializeTilopayForm(data.payment_data, data.payment_id);
      }, 100);

    } catch (error: any) {
      onError(error.message);
      setLoading(false);
    }
  };

  const initializeTilopayForm = (data: PaymentData, paymentId: string) => {
    // Check if Tilopay SDK is loaded
    if (typeof (window as any).Tilopay === 'undefined') {
      onError('Tilopay SDK not loaded');
      setLoading(false);
      return;
    }

    const Tilopay = (window as any).Tilopay;

    // Initialize embedded payment form
    Tilopay.init({
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      description: data.description,
      orderId: data.orderId,
      email: data.email,
      name: data.name,
      signature: data.signature,
      container: 'tilopay-container', // ID of div to embed form
      onSuccess: (response: any) => {
        setLoading(false);
        onSuccess(paymentId);
      },
      onError: (error: any) => {
        setLoading(false);
        onError(error.message || 'Payment failed');
      },
      onCancel: () => {
        setLoading(false);
        onError('Payment cancelled');
      },
    });
  };

  return (
    <div className="payment-container">
      {!paymentData ? (
        <button
          onClick={initiatePayment}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
        </button>
      ) : (
        <div>
          {/* Tilopay form will be embedded here */}
          <div id="tilopay-container" className="min-h-[400px]"></div>
          {loading && (
            <div className="text-center mt-4">
              <p>Processing payment...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### Step 3: Use the Payment Component

```tsx
// app/courses/[slug]/payment/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import TilopayEmbedded from '@/components/payment/TilopayEmbedded';

export default function CoursePaymentPage({ params }: { params: { slug: string } }) {
  const router = useRouter();

  const handleSuccess = (paymentId: string) => {
    // Show success message
    alert('Payment successful!');

    // Redirect to course page
    router.push(`/dashboard/user/courses/${params.slug}`);
  };

  const handleError = (error: string) => {
    // Show error message
    alert(`Payment failed: ${error}`);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Complete Payment</h1>

      <div className="max-w-2xl mx-auto">
        <TilopayEmbedded
          amount={299.99}
          paymentType="course"
          referenceId={params.slug}
          description="Course Enrollment"
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>
    </div>
  );
}
```

## 🎨 Customization

### Styling the Embedded Form

The Tilopay form inherits your page styles. You can customize:

```css
/* styles/tilopay.css */
#tilopay-container {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* Customize Tilopay form elements */
#tilopay-container input {
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 0.75rem;
}

#tilopay-container button {
  background: #1f2937;
  color: white;
  border-radius: 0.375rem;
  padding: 0.75rem 1.5rem;
}
```

## 🔐 Security

The backend:
- ✅ Generates secure signature
- ✅ Validates webhook signatures
- ✅ Grants access only after confirmed payment
- ✅ Tracks all payment attempts

## 📱 Mobile Responsive

The embedded form is automatically mobile-responsive. Test on:
- iPhone Safari
- Android Chrome
- Tablet devices

## 🧪 Testing

### Test Mode

Use Tilopay test API keys:

```env
TILOPAY_API_KEY=test_your_key
TILOPAY_MERCHANT_KEY=test_your_merchant_key
```

### Test Cards

Check Tilopay documentation for test card numbers.

## ❓ Troubleshooting

### Form Not Showing

```javascript
// Check if SDK loaded
console.log('Tilopay loaded:', typeof window.Tilopay !== 'undefined');
```

### Payment Not Confirming

Check:
1. Webhook URL is accessible
2. Webhook secret matches
3. Payment status in database

## 📞 Support

For Tilopay-specific issues:
- Tilopay Docs: https://docs.tilopay.com/
- Support: support@tilopay.com

---

## 🎯 Next Steps

1. **Share your payment page screenshot** - I'll match your design exactly
2. **Get Tilopay test credentials** - So we can test end-to-end
3. **Test payment flow** - Make sure everything works

**Ready to see your payment page design! Share the screenshot and I'll build it. 📸**
