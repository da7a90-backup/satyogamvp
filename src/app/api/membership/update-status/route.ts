// app/api/membership/update-status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

/**
 * API route to update a user's membership status in Strapi
 * This runs after a successful payment via Tilopay
 */
export async function POST(req: NextRequest) {
  try {
    console.log("API route starting");
    
    // Get the payment data from the request
    const paymentData = await req.json();
    console.log("Payment data received:", JSON.stringify(paymentData, null, 2));
    
    // Get the current session to authenticate the request
    const session = await getServerSession(authOptions);
    console.log("Session data:", session ? "Session exists" : "No session");
    
    // If no session, we'll use the email from the payment data (for new users)
    const userEmail = session?.user?.email || paymentData.memberEmail;
    
    if (!userEmail) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }
    
    // Determine the correct membership status based on whether there's a trial
    const membershipStatus = paymentData.hasTrial ? 'TRIALING' : 'ACTIVE';
    // Calculate dates for membership
    const startDate = new Date().toISOString();
    
    // Calculate end date for trial or subscription
    let endDate = new Date();
    if (paymentData.hasTrial && paymentData.trialDays) {
      // If there's a trial, the end date is trialDays from now
      endDate.setDate(endDate.getDate() + parseInt(paymentData.trialDays));
    } else {
      // Otherwise, for monthly plans: 1 month from now, for yearly: 1 year from now
      if (paymentData.membershipType === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }
    }
    
    // Determine membership level based on plan name
    let membershipLevel = 'free';
    if (paymentData.membershipPlan.toLowerCase().includes('gyani')) {
      membershipLevel = 'GYANI';
    } else if (paymentData.membershipPlan.toLowerCase().includes('pragyani+')) {
      membershipLevel = 'PRAGYANIPLUS';
    } else if (paymentData.membershipPlan.toLowerCase().includes('pragyani')) {
      membershipLevel = 'PRAGYANI';
    }
    
    // Use the Strapi API token for authorization
    const strapiToken = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
    
    if (!strapiToken) {
      return NextResponse.json(
        { error: "Missing Strapi API token" },
        { status: 500 }
      );
    }
    
    try {
      // Step 1: Let's check what the available values are for the membership enumeration
      // Make a request to get the content type schema
      const schemaRes = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/users-permissions/content-types`,
        {
          headers: { 
            Authorization: `Bearer ${strapiToken}` 
          },
        }
      );
      
      if (schemaRes.ok) {
        const schemaData = await schemaRes.json();
        console.log("Available membership values:", 
          schemaData.data.find((ct: any) => 
            ct.uid === 'plugin::users-permissions.user'
          )?.schema?.attributes?.membership?.enum || []);
      }
      
      // Get the user ID from Strapi using the email
      const userRes = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/users?filters[email][$eq]=${encodeURIComponent(userEmail)}`,
        {
          headers: { 
            Authorization: `Bearer ${strapiToken}` 
          },
        }
      );
      
      if (!userRes.ok) {
        return NextResponse.json(
          { error: "Failed to find user in Strapi" },
          { status: 404 }
        );
      }
      
      const userData = await userRes.json();
      
      if (!userData || userData.length === 0) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }
      
      const userId = userData[0].id;
      console.log("About to update user in Strapi:", userId);
      
      // Try a simpler update first with just the membership field
      const updateData = {
        membership: membershipLevel
      };
      
      console.log("Update data:", JSON.stringify(updateData, null, 2));
      
      // Update the user with just the membership field first
      const updateRes = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/users/${userId}`,
        {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${strapiToken}` 
          },
          body: JSON.stringify(updateData),
        }
      );
      
      console.log("Update response status:", updateRes.status);
      
      if (!updateRes.ok) {
        console.error("Failed to update membership status in Strapi");
        
        // Get more details about the error
        const errorText = await updateRes.text();
        try {
          const errorData = JSON.parse(errorText);
          console.error("Strapi error response:", errorData);
          
          // Extract the actual validation errors
          if (errorData.error?.details?.errors) {
            console.error("Validation errors:", JSON.stringify(errorData.error.details.errors, null, 2));
          }
        } catch (e) {
          console.error("Strapi error response (text):", errorText);
        }
        
        return NextResponse.json(
          { error: "Failed to update membership status" },
          { status: 500 }
        );
      }
      
      // Now update the dates in a separate request
      const datesUpdateData = {
        membershipstartdate: startDate,
        membershipenddate: endDate.toISOString(),
        membershipstatus: membershipStatus
      };
      
      console.log("Dates update data:", JSON.stringify(datesUpdateData, null, 2));
      
      const datesUpdateRes = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/users/${userId}`,
        {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${strapiToken}` 
          },
          body: JSON.stringify(datesUpdateData),
        }
      );
      
      console.log("Dates update response status:", datesUpdateRes.status);
      
      if (!datesUpdateRes.ok) {
        console.error("Failed to update membership dates in Strapi");
        
        // Get more details about the error
        const errorText = await datesUpdateRes.text();
        try {
          const errorData = JSON.parse(errorText);
          console.error("Strapi dates error response:", errorData);
          
          // Extract the actual validation errors
          if (errorData.error?.details?.errors) {
            console.error("Validation errors:", JSON.stringify(errorData.error.details.errors, null, 2));
          }
        } catch (e) {
          console.error("Strapi dates error response (text):", errorText);
        }
        
        // Still return success since at least the membership level was updated
        return NextResponse.json({ 
          success: true,
          warning: "Membership level was updated but dates could not be updated"
        });
      }
      
      console.log("API route completing successfully");
      return NextResponse.json({ success: true });
      
    } catch (strapiError: any) {
      console.error("Error communicating with Strapi:", strapiError.message);
      return NextResponse.json(
        { error: "Error communicating with Strapi" },
        { status: 500 }
      );
    }
    
  } catch (error: any) {
    console.error("Error updating membership status:", error.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}