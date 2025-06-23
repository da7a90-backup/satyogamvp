'use client';

import { useState, useEffect, FormEvent } from 'react';
import { formatTilopayDonationData, processPayment } from '@/lib/services/tilopay';

// TypeScript definitions for Tilopay SDK
declare global {
  interface Window {
    Tilopay: {
      Init: (params: any) => Promise<any>;
      startPayment: () => Promise<any>;
      getCardType: () => Promise<string>;
      updateOptions: (params: any) => Promise<any>;
    };
  }
}

// Define the donation category type for type safety
type DonationCategory = 'Broadcasting' | 'Solarization' | 'Greenhouse & Seedbank' | 'Off-Grid' | 'Custom';

interface DonationPaymentFormProps {
  amount: string;
  category: DonationCategory;
  onCancel: () => void;
}

export const DonationPaymentForm: React.FC<DonationPaymentFormProps> = ({
  amount,
  category,
  onCancel,
}) => {
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('CR');
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // SDK-specific state
  const [useSDK, setUseSDK] = useState(false);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isSDKInitialized, setIsSDKInitialized] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [selectedSavedCard, setSelectedSavedCard] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardType, setCardType] = useState('');

  // Load Tilopay SDK when user chooses to use it
  useEffect(() => {
    if (useSDK && !isSDKLoaded) {
      const loadSDK = async () => {
        try {
          // Check if SDK is already loaded
          if (window.Tilopay) {
            setIsSDKLoaded(true);
            return;
          }

          // Create script element
          const script = document.createElement('script');
          script.src = `https://app.tilopay.com/sdk/v2/sdk_tpay.min.js?v=${Date.now()}`;
          script.async = true;
          
          script.onload = () => {
            setTimeout(() => {
              if (window.Tilopay) {
                setIsSDKLoaded(true);
                console.log('Tilopay SDK loaded successfully');
              } else {
                setError('Failed to load payment system');
              }
            }, 500);
          };
          
          script.onerror = () => {
            console.error('Failed to load Tilopay SDK');
            setError('Failed to load payment system');
          };

          document.head.appendChild(script);
        } catch (error) {
          console.error('Error loading SDK:', error);
          setError('Failed to load payment system');
        }
      };

      loadSDK();
    }
  }, [useSDK, isSDKLoaded]);

  // Initialize SDK when it's loaded and form is valid
  const initializeSDK = async () => {
    if (!isSDKLoaded || !window.Tilopay) {
      setError('Payment system not ready');
      return false;
    }

    try {
      setIsProcessing(true);
      setError('');

      console.log('Getting SDK token...');
      // Get SDK token from your backend
      const tokenResponse = await fetch('/api/tilopay/get-sdk-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        throw new Error(errorData.details || 'Failed to get payment token');
      }

      const tokenData = await tokenResponse.json();
      console.log('Got SDK token, initializing...');

      // Initialize Tilopay SDK with exact parameters from documentation
      const initResponse = await window.Tilopay.Init({
        token: tokenData.token,
        currency: 'USD',
        language: 'en',
        amount: parseFloat(amount),
        billToEmail: email,
        orderNumber: `SATYOGA-DONATION-${category.replace(/\s+/g, '-').toUpperCase()}-${Date.now()}`,
        billToFirstName: firstName,
        billToLastName: lastName,
        billToAddress: address || 'N/A',
        billToAddress2: address2 || '',
        billToCity: city || 'N/A',
        billToState: state || 'N/A',
        billToZipPostCode: zipCode || '00000',
        billToCountry: country || 'CR',
        billToTelephone: phone || '00000000',
        capture: 1,
        redirect: `${window.location.origin}/donate/success`,
        subscription: 0,
        hashVersion: 'V2',
        returnData: btoa(JSON.stringify({
          donationType: 'donation',
          donationCategory: category,
          amount: amount,
          donorName: `${firstName} ${lastName}`,
          donorEmail: email,
          message: message
        }))
      });

      console.log('SDK Init response:', initResponse);

      if (initResponse.error) {
        throw new Error(initResponse.error);
      }

      setPaymentMethods(initResponse.methods || []);
      setSavedCards(initResponse.cards || []);
      setIsSDKInitialized(true);
      
      // Auto-populate hidden form fields
      setTimeout(() => {
        const methodSelect = document.getElementById('tlpy_payment_method') as HTMLSelectElement;
        const cardSelect = document.getElementById('tlpy_saved_cards') as HTMLSelectElement;
        
        if (methodSelect && initResponse.methods?.length > 0) {
          initResponse.methods.forEach((method: any) => {
            const option = document.createElement('option');
            option.value = method.id;
            option.text = method.name;
            methodSelect.appendChild(option);
          });
        }
        
        if (cardSelect && initResponse.cards?.length > 0) {
          initResponse.cards.forEach((card: any) => {
            const option = document.createElement('option');
            option.value = card.id;
            option.text = card.name;
            cardSelect.appendChild(option);
          });
        }
      }, 100);

      return true;

    } catch (error) {
      console.error('Error initializing payment:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize payment');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle card number change to detect card type
  const handleCardNumberChange = async (value: string) => {
    const formatted = value.replace(/\D/g, '').slice(0, 16);
    setCardNumber(formatted);
    
    // Update the SDK form field
    const cardInput = document.getElementById('tlpy_cc_number') as HTMLInputElement;
    if (cardInput) {
      cardInput.value = formatted;
    }

    // Get card type if we have enough digits
    if (formatted.length >= 6 && window.Tilopay && isSDKInitialized) {
      try {
        const typeResponse: any = await window.Tilopay.getCardType();
        console.log('Card type response:', typeResponse);
        
        // Handle different response formats
        let cardTypeName = '';
        if (typeof typeResponse === 'string') {
          cardTypeName = typeResponse;
        } else if (typeResponse && typeof typeResponse === 'object') {
          cardTypeName = typeResponse.message || typeResponse.type || typeResponse.cardType || '';
        }
        
        setCardType(cardTypeName);
      } catch (error) {
        console.error('Error getting card type:', error);
        setCardType('');
      }
    } else if (formatted.length < 6) {
      setCardType('');
    }
  };

  // Handle expiry date formatting
  const handleExpiryChange = (value: string) => {
    let formatted = value.replace(/\D/g, '');
    if (formatted.length >= 2) {
      formatted = formatted.slice(0, 2) + '/' + formatted.slice(2, 4);
    }
    setExpiryDate(formatted);
    
    const expiryInput = document.getElementById('tlpy_cc_expiration_date') as HTMLInputElement;
    if (expiryInput) {
      expiryInput.value = formatted;
    }
  };

  // Handle CVV change
  const handleCvvChange = (value: string) => {
    const formatted = value.replace(/\D/g, '').slice(0, 4);
    setCvv(formatted);
    
    const cvvInput = document.getElementById('tlpy_cvv') as HTMLInputElement;
    if (cvvInput) {
      cvvInput.value = formatted;
    }
  };

  // Validation function
  const validateForm = () => {
    const requiredFields = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      zipCode: zipCode.trim(),
      country: country.trim(),
      message: message.trim(),
      amount: amount?.trim()
    };

    // Check for empty required fields
    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value) {
        throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required and cannot be empty`);
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(requiredFields.email)) {
      throw new Error('Please enter a valid email address');
    }

    // Validate amount is a valid number
    const numericAmount = parseFloat(requiredFields.amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      throw new Error('Please enter a valid donation amount');
    }

    return requiredFields;
  };

  // Process payment via SDK
  const processSDKPayment = async () => {
    if (!window.Tilopay || !isSDKInitialized) {
      setError('Payment system not ready');
      return;
    }

    try {
      setIsProcessing(true);
      setError('');

      // Validate payment form
      if (!selectedPaymentMethod) {
        throw new Error('Please select a payment method');
      }

      if (!selectedSavedCard && (!cardNumber || !expiryDate || !cvv)) {
        throw new Error('Please enter your card details');
      }

      console.log('Processing SDK payment...');
      
      // Process the payment
      const result = await window.Tilopay.startPayment();
      console.log('SDK Payment result:', result);
      
      if (result.error) {
        throw new Error(result.error);
      }

      // Payment successful - redirect to success page
      window.location.href = `/donate/success?result=${encodeURIComponent(JSON.stringify(result))}`;

    } catch (error) {
      console.error('Payment error:', error);
      setError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Original form submission (redirect to Tilopay)
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate form first
    try {
      validateForm();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Please fill in all required fields');
      return;
    }

    // If using SDK and it's initialized, process payment directly
    if (useSDK && isSDKInitialized) {
      await processSDKPayment();
      return;
    }

    // If user wants to use SDK but it's not initialized yet
    if (useSDK && !isSDKInitialized) {
      const initialized = await initializeSDK();
      if (!initialized) {
        return; // Error already set in initializeSDK
      }
      return; // User needs to click submit again after initialization
    }

    // Original redirect flow
    setIsProcessing(true);
    setError('');

    try {
      // Validate form data first
      const validatedFields = validateForm();
      
      // Collect form data with validated and trimmed values
      const formData = {
        firstName: validatedFields.firstName,
        lastName: validatedFields.lastName,
        email: validatedFields.email,
        phone: validatedFields.phone,
        address: validatedFields.address,
        address2: address2.trim(), // Optional field
        city: validatedFields.city,
        state: validatedFields.state,
        zipCode: validatedFields.zipCode,
        country: validatedFields.country,
        message: validatedFields.message
      };

      const donationDetails = {
        amount: validatedFields.amount,
        category
      };

      console.log('Form data being sent:', formData);
      console.log('Donation details:', donationDetails);
      
      // Format data for Tilopay using the DONATION-SPECIFIC function
      const tilopayData = formatTilopayDonationData(formData, donationDetails);
      console.log('Tilopay formatted data:', tilopayData);
      
      // Process payment through Tilopay
      const result = await processPayment(tilopayData);
      console.log('Payment result:', result);
      
      // Redirect to Tilopay payment form
      if (result && result.url) {
        window.location.href = result.url;
      } else {
        throw new Error('No payment URL received from Tilopay');
      }
    } catch (error) {
      console.error('Payment error:', error);
      
      // More detailed error handling
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('There was an error processing your payment. Please try again.');
      }
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Hidden Tilopay form structure required by SDK */}
      {useSDK && (
        <div className="payFormTilopay" style={{ display: 'none' }}>
          <select name="tlpy_payment_method" id="tlpy_payment_method">
            <option value="">Select payment method</option>
          </select>
          
          <div id="tlpy_card_payment_div">
            <select name="tlpy_saved_cards" id="tlpy_saved_cards">
              <option value="">Select card</option>
            </select>
            <input type="text" id="tlpy_cc_number" name="tlpy_cc_number" />
            <input type="text" id="tlpy_cc_expiration_date" name="tlpy_cc_expiration_date" />
            <input type="text" id="tlpy_cvv" name="tlpy_cvv" />
          </div>
          
          <div id="tlpy_phone_number_div" style={{ display: 'none' }}>
            <input type="text" id="tlpy_phone_number" name="tlpy_phone_number" />
          </div>
        </div>
      )}

      <div id="responseTilopay"></div>

      <div className="flex flex-col md:flex-row">
        {/* Left column - Form */}
        <div className="md:w-1/2 p-8">
          <h2 className="text-xl font-bold mb-4">Donate</h2>
          <p className="text-gray-700 mb-6">
            If you recognize the urgency to create a more spiritual and ecological culture, and if you want to be part of the process of human and planetary rebirth, please support this unique and vital project. Enter your donation amount:
          </p>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Payment Method Selection */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose Payment Method:
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="paymentType"
                  value="redirect"
                  checked={!useSDK}
                  onChange={() => setUseSDK(false)}
                  className="mr-2"
                />
                <span className="text-sm">Secure Hosted Payment (Recommended)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="paymentType"
                  value="sdk"
                  checked={useSDK}
                  onChange={() => setUseSDK(true)}
                  className="mr-2"
                />
                <span className="text-sm">Direct Card Payment (Stay on this page)</span>
              </label>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="amount">
                Insert amount <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                <div className="inline-flex items-center px-3 border border-r-0 border-gray-300 rounded-l-md bg-white">
                  <select 
                    className="h-full bg-transparent border-none focus:outline-none py-0"
                    defaultValue="USD"
                  >
                    <option value="USD">USD</option>
                  </select>
                </div>
                <input
                  type="text"
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-r-md focus:outline-none"
                  value={amount}
                  disabled
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="firstName">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="lastName">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2" htmlFor="email">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="phone">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Your phone number"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="address">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="address2">
                Address Line 2
              </label>
              <input
                id="address2"
                type="text"
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
                placeholder="Apartment, suite, etc. (optional)"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="city">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="state">
                  State/Province <span className="text-red-500">*</span>
                </label>
                <input
                  id="state"
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State/Province"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="zipCode">
                  Postal Code <span className="text-red-500">*</span>
                </label>
                <input
                  id="zipCode"
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="Postal code"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="country">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
                  required
                >
                  <option value="CR">Costa Rica</option>
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="MX">Mexico</option>
                  <option value="GT">Guatemala</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="message">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Leave us a message..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none h-32"
                required
              />
            </div>

            {/* SDK Payment Fields */}
            {useSDK && isSDKInitialized && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-medium">Payment Details</h3>
                
                {/* Payment Method Selection */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedPaymentMethod}
                    onChange={(e) => {
                      setSelectedPaymentMethod(e.target.value);
                      const hiddenSelect = document.getElementById('tlpy_payment_method') as HTMLSelectElement;
                      if (hiddenSelect) hiddenSelect.value = e.target.value;
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
                    required
                  >
                    <option value="">Select payment method</option>
                    {paymentMethods.map((method) => (
                      <option key={method.id} value={method.id}>
                        {method.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Saved Cards */}
                {savedCards.length > 0 && (
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Saved Cards
                    </label>
                    <select
                      value={selectedSavedCard}
                      onChange={(e) => {
                        setSelectedSavedCard(e.target.value);
                        const hiddenSelect = document.getElementById('tlpy_saved_cards') as HTMLSelectElement;
                        if (hiddenSelect) hiddenSelect.value = e.target.value;
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
                    >
                      <option value="">Use new card</option>
                      {savedCards.map((card) => (
                        <option key={card.id} value={card.id}>
                          {card.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* New Card Details */}
                {!selectedSavedCard && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 mb-2">
                        Card Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => handleCardNumberChange(e.target.value)}
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
                          required
                        />
                        {cardType && (
                          <span className="absolute right-3 top-2 text-sm text-gray-500">
                            {cardType}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 mb-2">
                          Expiry Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={expiryDate}
                          onChange={(e) => handleExpiryChange(e.target.value)}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-2">
                          CVV <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={cvv}
                          onChange={(e) => handleCvvChange(e.target.value)}
                          placeholder="123"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* CVV for saved cards */}
                {selectedSavedCard && (
                  <div>
                    <label className="block text-gray-700 mb-2">
                      CVV <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={cvv}
                      onChange={(e) => handleCvvChange(e.target.value)}
                      placeholder="123"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
                      required
                    />
                  </div>
                )}
              </div>
            )}
            
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2 bg-white border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gray-900 text-white rounded-md font-medium hover:bg-gray-800 disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 
                 useSDK && isSDKInitialized ? `Pay $${amount}` : 
                 useSDK && !isSDKInitialized ? 'Initialize Payment' :
                 'Continue to Payment'}
              </button>
            </div>
          </form>
        </div>
        
        {/* Right column - Donation summary */}
        <div className="md:w-1/2 bg-gray-50 p-8">
          <h3 className="text-lg font-medium mb-4">Products</h3>
          <div className="flex items-center justify-between py-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="bg-gray-200 w-12 h-12 mr-4 flex items-center justify-center rounded">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-medium">Donation - {category}</span>
            </div>
            <span className="font-medium">${parseFloat(amount).toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center py-4">
            <span className="font-medium text-lg">Subtotal</span>
            <span className="font-medium">${parseFloat(amount).toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center pt-4 pb-6 mb-6 border-b border-gray-200">
            <h3 className="text-xl font-bold">Total</h3>
            <span className="text-xl font-bold">${parseFloat(amount).toFixed(2)}</span>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
            <p className="text-sm text-gray-700">
              <span className="font-bold">Note:</span> {
                useSDK 
                  ? 'Your payment will be processed securely on this page.'
                  : 'After clicking "Continue to Payment", you will be redirected to our secure payment processor to enter your card details.'
              }
            </p>
          </div>

          {useSDK && (
            <div className="mt-4 p-4 bg-green-50 rounded border border-green-200">
              <p className="text-sm text-green-800">
                <span className="font-bold">Secure:</span> Your payment information is encrypted and processed securely. We never store your card details.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};