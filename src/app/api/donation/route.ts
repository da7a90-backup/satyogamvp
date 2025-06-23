// app/api/donation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getTilopayToken } from '@/lib/services/tilopay';

// API credentials from environment variables
const API_KEY = process.env.TILOPAY_API_KEY || '';
const TILOPAY_BASE_URL = 'https://app.tilopay.com/api/v1';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const data = await request.json();
    
    if (!data) {
      return NextResponse.json(
        { error: 'Missing payment data' },
        { status: 400 }
      );
    }
    
    // Get the Tilopay token
    const token = await getTilopayToken();
    
    // Process the payment with Tilopay
    const response = await fetch(`${TILOPAY_BASE_URL}/processPayment`, {
      method: 'POST',
      headers: {
        'Authorization': `bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...data,
        key: API_KEY,
        platform: 'satyoga-website',
        capture: '1',
        subscription: '0'
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || 'Failed to process payment' },
        { status: response.status }
      );
    }
    
    // Return the Tilopay response
    const result = await response.json();
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('Error processing donation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process donation' },
      { status: 500 }
    );
  }
}