// app/api/tilopay/get-sdk-token/route.ts
import { NextRequest, NextResponse } from 'next/server';

const TILOPAY_BASE_URL = 'https://app.tilopay.com/api/v1';
const API_USER = process.env.NEXT_PUBLIC_TILOPAY_API_USER || '';
const API_PASSWORD = process.env.NEXT_PUBLIC_TILOPAY_API_PASSWORD || '';
const API_KEY = process.env.NEXT_PUBLIC_TILOPAY_API_KEY || '';

export async function POST(request: NextRequest) {
  try {
    console.log('Getting Tilopay SDK token from /loginSdk...');
    
    // Use the correct SDK token endpoint
    const sdkTokenResponse = await fetch(`${TILOPAY_BASE_URL}/loginSdk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apiuser: API_USER,
        password: API_PASSWORD,
        key: API_KEY
      })
    });

    if (!sdkTokenResponse.ok) {
      const errorText = await sdkTokenResponse.text();
      console.error('SDK token response error:', sdkTokenResponse.status, errorText);
      throw new Error(`Failed to get SDK token: ${sdkTokenResponse.statusText}`);
    }

    const sdkData = await sdkTokenResponse.json();
    console.log('Successfully got SDK token');
    
    return NextResponse.json({ 
      token: sdkData.access_token || sdkData.token,
      expires_in: sdkData.expires_in || 86400,
      token_type: sdkData.token_type || 'bearer'
    });

  } catch (error) {
    console.error('Error in get-sdk-token:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get SDK token',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}