/**
 * Tilopay API Service
 * 
 * This service handles interactions with Tilopay payment gateway.
 * https://app.tilopay.com/api/v1/
 */

// Tilopay API credentials from environment variables
const API_USER = process.env.NEXT_PUBLIC_TILOPAY_API_USER || '';
const API_PASSWORD = process.env.NEXT_PUBLIC_TILOPAY_API_PASSWORD || '';
const API_KEY = process.env.NEXT_PUBLIC_TILOPAY_API_KEY || '';
const TILOPAY_BASE_URL = 'https://app.tilopay.com/api/v1';

/**
 * Get authentication token from Tilopay
 */
export async function getTilopayToken(): Promise<string> {
  try {
    const response = await fetch(`${TILOPAY_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apiuser: API_USER,
        password: API_PASSWORD
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to get Tilopay token: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting Tilopay token:', error);
    throw error;
  }
}

/**
 * Process payment through Tilopay API
 * This is used for membership payments, which can be one-time or recurring
 */
export async function processPayment(paymentData: any): Promise<any> {
  try {
    // First get authentication token
    const token = await getTilopayToken();
    
    // Determine if we need to handle this as a recurring payment
    const isRecurring = paymentData.subscription === '1' && 
                        (paymentData.frecuency === '3' || paymentData.frecuency === '4');
                        
    // Choose the appropriate endpoint based on whether this is recurring
    const endpoint = isRecurring ? 
      `${TILOPAY_BASE_URL}/processRecurrentPayment` : 
      `${TILOPAY_BASE_URL}/processPayment`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...paymentData,
        key: API_KEY,
        platform: 'satyoga-website'
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to process payment: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
}

/**
 * Process recurring payment through Tilopay API
 * This is used for subscription payments with direct API integration
 */
export async function processRecurrentPayment(paymentData: any, cardData: any): Promise<any> {
    try {
      // First get authentication token
      const token = await getTilopayToken();
      
      // Combine payment data with card information
      const fullPaymentData = {
        ...paymentData,
        // Add card details - these are required for direct API integration
        card: cardData.cardNumber.replace(/\s+/g, ''),
        card_exp: cardData.expiryDate.replace('/', ''),
        card_cvv: cardData.cvv,
        email: paymentData.billToEmail,
        key: API_KEY,
        platform: 'satyoga-website'
      };
      
      const response = await fetch(`${TILOPAY_BASE_URL}/processRecurrentPayment`, {
        method: 'POST',
        headers: {
          'Authorization': `bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fullPaymentData)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Tilopay API error:', errorData);
        throw new Error(errorData.message || 'Failed to process payment');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error processing recurring payment:', error);
      throw error;
    }
  }

/**
 * Format donation data for Tilopay (NEW FUNCTION FOR DONATIONS)
 */
export function formatTilopayDonationData(formData: any, donationDetails: any) {
    // Generate a unique order number for donations
    const orderNumber = `SATYOGA-DONATION-${donationDetails.category.replace(/\s+/g, '-').toUpperCase()}-${Date.now()}`;
    
    // Base URL for redirect
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    
    // Construct the return data to be passed back to our success page
    const returnDataObj = {
      donationType: 'donation',
      donationCategory: donationDetails.category,
      amount: donationDetails.amount,
      donorName: `${formData.firstName} ${formData.lastName}`,
      donorEmail: formData.email,
      message: formData.message
    };
    
    // Encode the return data as base64
    const returnData = btoa(JSON.stringify(returnDataObj));
    
    // Payment data for donations (always one-time payments)
    const paymentData = {
      redirect: `${baseUrl}/donate/success`, // or wherever you want to redirect after donation
      key: API_KEY,
      amount: donationDetails.amount,
      currency: 'USD',
      orderNumber,
      capture: '1',
      billToFirstName: formData.firstName || '',
      billToLastName: formData.lastName || '',
      billToAddress: formData.address || 'N/A',
      billToAddress2: formData.address2 || '',
      billToCity: formData.city || 'N/A',
      billToState: formData.state || 'N/A',
      billToZipPostCode: formData.zipCode || '00000',
      billToCountry: formData.country || 'CR',
      billToTelephone: formData.phone || '00000000',
      billToEmail: formData.email || '',
      // The shipping info is required, but we'll just duplicate billing for donations
      shipToFirstName: formData.firstName || '',
      shipToLastName: formData.lastName || '',
      shipToAddress: formData.address || 'N/A',
      shipToAddress2: formData.address2 || '',
      shipToCity: formData.city || 'N/A',
      shipToState: formData.state || 'N/A',
      shipToZipPostCode: formData.zipCode || '00000',
      shipToCountry: formData.country || 'CR',
      shipToTelephone: formData.phone || '00000000',
      returnData,
      platform: 'satyoga-website',
      hashVersion: 'V2',
      subscription: '0', // Donations are always one-time payments
    };
    
    return paymentData;
}

/**
 * Format the customer data for Tilopay (EXISTING FUNCTION FOR MEMBERSHIPS)
 */
export function formatTilopayData(formData: any, membershipDetails: any) {
    // Generate a unique order number based on timestamp and membership info
    const orderNumber = `MEMBERSHIP-${(membershipDetails.planId || 'UNKNOWN').toUpperCase()}-${Date.now()}`;
    
    // Determine if we should use subscription or one-time payment
    const useSubscription = membershipDetails.billingType === 'monthly';
    
    // Base URL for redirect
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    
    // Determine pricing frequency code based on billing type
    // Tilopay frequency codes: 1=Daily, 2=Weekly, 3=Monthly, 4=Annual, etc.
    const frequencyCode = membershipDetails.billingType === 'monthly' ? '3' : '4'; 
    
    // Construct the return data to be passed back to our success page
    const returnDataObj = {
      membershipPlan: membershipDetails.planName,
      membershipType: membershipDetails.billingType,
      amount: membershipDetails.amount,
      hasTrial: membershipDetails.hasTrial,
      trialDays: membershipDetails.trialDays,
      memberName: `${formData.firstName} ${formData.lastName}`,
      memberEmail: formData.email,
      donationAmount: formData.donationAmount || '0'
    };
    
    // Encode the return data as base64
    const returnData = btoa(JSON.stringify(returnDataObj));
    
    // Common payment data for both one-time and recurring payments
    const paymentData = {
      redirect: `${baseUrl}/membership/success`,
      key: API_KEY,
      amount: membershipDetails.amount,
      currency: 'USD',
      orderNumber,
      capture: '1',
      billToFirstName: formData.firstName || '',
      billToLastName: formData.lastName || '',
      billToAddress: formData.address || 'N/A',
      billToAddress2: '',
      billToCity: formData.city || 'N/A',
      billToState: formData.state || 'N/A',
      billToZipPostCode: formData.postalCode || '00000',
      billToCountry: formData.country || 'CR',
      billToTelephone: '00000000', // Replace with actual phone if collected
      billToEmail: formData.email || '',
      // The shipping info is required, but we'll just duplicate billing for memberships
      shipToFirstName: formData.firstName || '',
      shipToLastName: formData.lastName || '',
      shipToAddress: formData.address || 'N/A',
      shipToAddress2: '',
      shipToCity: formData.city || 'N/A',
      shipToState: formData.state || 'N/A',
      shipToZipPostCode: formData.postalCode || '00000',
      shipToCountry: formData.country || 'CR',
      shipToTelephone: '00000000', // Replace with actual phone if collected
      returnData,
      platform: 'satyoga-website',
      hashVersion: 'V2',
    };
    
    // For zero-dollar transactions, set a minimum amount for Tilopay
    // Some payment processors require a minimum amount (e.g., $0.50)
    if (parseFloat(membershipDetails.amount) === 0) {
      paymentData.amount = '0.50'; // Set a minimum amount
    }
    
    // Additional fields for recurring payments
    if (useSubscription) {
      return {
        ...paymentData,
        subscription: '1',
        frecuency: frequencyCode,
        trial: membershipDetails.hasTrial ? '1' : '0',
        trial_days: membershipDetails.trialDays?.toString() || '0',
        attempts: '3', // Number of retry attempts for failed charges
      };
    } else {
      // For annual plans, we'll use standard payment
      return {
        ...paymentData,
        subscription: '0',
      };
    }
  }

/**
 * Validate a discount code
 */
export async function validateDiscountCode(code: string): Promise<any> {
  try {
    // First get authentication token
    const token = await getTilopayToken();
    
    const response = await fetch(`${TILOPAY_BASE_URL}/getCoupon`, {
      method: 'POST',
      headers: {
        'Authorization': `bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        key: API_KEY,
        id: code
      })
    });

    if (!response.ok) {
      return { isValid: false, message: 'Invalid discount code' };
    }

    const data = await response.json();
    return { 
      isValid: true, 
      discount: data.discount || 0,
      discountType: data.type || 'percentage'
    };
  } catch (error) {
    console.error('Error validating discount code:', error);
    return { isValid: false, message: 'Error validating discount code' };
  }
}