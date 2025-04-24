"use client";

import { useState, useEffect } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

const ApiAuthTest = () => {
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenValue, setTokenValue] = useState<string | null>(null);

  // Get and display token (partial)
  useEffect(() => {
    const token =
      process.env.NEXT_PUBLIC_STRAPI_API_TOKEN ||
      process.env.NEXT_PUBLIC_STRAPI_TOKEN;
    if (token) {
      // Only show first 6 and last 4 characters for security
      const maskedToken =
        token.length > 10
          ? `${token.substring(0, 6)}...${token.substring(token.length - 4)}`
          : "******";
      setTokenValue(maskedToken);
    } else {
      setTokenValue("Not found");
    }
  }, []);

  const testApiConnection = async () => {
    setIsLoading(true);
    setError(null);
    setTestResult(null);

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";
      const token =
        process.env.NEXT_PUBLIC_STRAPI_API_TOKEN ||
        process.env.NEXT_PUBLIC_STRAPI_TOKEN;

      // First try to get user info (requires auth)
      const userResponse = await fetch(`${apiUrl}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setTestResult(
          `✅ Authentication successful! Connected as: ${
            userData.username || userData.email || "User"
          }`
        );
      } else {
        setTestResult(
          `❌ Authentication failed with status: ${userResponse.status}`
        );

        // If auth failed, try a public endpoint
        const publicResponse = await fetch(`${apiUrl}/api/i18n/locales`);
        if (publicResponse.ok) {
          setTestResult((prev) => `${prev}\n✅ But public API is accessible.`);
        } else {
          setTestResult(
            (prev) => `${prev}\n❌ Even public API is not accessible.`
          );
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Test file upload specifically
  const testFileUpload = async () => {
    setIsLoading(true);
    setError(null);
    setTestResult(null);

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";
      const token =
        process.env.NEXT_PUBLIC_STRAPI_API_TOKEN ||
        process.env.NEXT_PUBLIC_STRAPI_TOKEN;

      // Create a small test file
      const testBlob = new Blob(["test file content"], { type: "text/plain" });
      const testFile = new File([testBlob], "test-upload.txt", {
        type: "text/plain",
      });

      // Create FormData
      const formData = new FormData();
      formData.append("files", testFile);

      // Make the upload request
      const uploadResponse = await fetch(`${apiUrl}/api/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json();
        setTestResult(
          `✅ File upload successful! Uploaded file ID: ${uploadData[0].id}`
        );
      } else {
        const errorText = await uploadResponse.text();
        setTestResult(
          `❌ File upload failed with status: ${uploadResponse.status}\nError details: ${errorText}`
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">API Authentication Test</h2>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          This tool tests your Strapi API connection and authentication.
        </p>

        <div className="p-3 bg-gray-50 rounded border mb-4">
          <p className="text-sm font-medium">Environment Check:</p>
          <p className="text-sm">
            API URL:{" "}
            {process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337"}
          </p>
          <p className="text-sm">API Token: {tokenValue}</p>
        </div>
      </div>

      <div className="flex space-x-3 mb-4">
        <button
          onClick={testApiConnection}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isLoading ? (
            <>
              <ArrowPathIcon className="inline h-4 w-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            "Test API Connection"
          )}
        </button>

        <button
          onClick={testFileUpload}
          disabled={isLoading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300"
        >
          {isLoading ? (
            <>
              <ArrowPathIcon className="inline h-4 w-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            "Test File Upload"
          )}
        </button>
      </div>

      {testResult && (
        <div className="mt-4 p-4 bg-gray-50 rounded border whitespace-pre-line">
          <h3 className="font-medium mb-2">Test Result:</h3>
          <p className="font-mono text-sm">{testResult}</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded border">
          <h3 className="font-medium mb-2">Error:</h3>
          <p className="font-mono text-sm">{error}</p>
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-50 rounded border">
        <h3 className="font-medium mb-2 text-yellow-800">
          Troubleshooting Tips:
        </h3>
        <ul className="list-disc pl-5 text-sm space-y-1 text-yellow-800">
          <li>Ensure your API token has upload permissions in Strapi</li>
          <li>
            Check that the environment variable is correctly set in .env.local
          </li>
          <li>Verify that the variable name is NEXT_PUBLIC_STRAPI_API_TOKEN</li>
          <li>Make sure you're using an API token, not a user JWT token</li>
          <li>Try restarting your Next.js development server</li>
        </ul>
      </div>
    </div>
  );
};

export default ApiAuthTest;
