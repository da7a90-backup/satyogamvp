"""
Tilopay Payment Gateway Integration for Next.js/FastAPI.

Supports both:
1. Embedded payments (in-page with JavaScript SDK)
2. Redirect payments (hosted payment page)

Based on Tilopay's jQuery/JavaScript integration.
"""

import httpx
import hashlib
import json
from typing import Optional, Dict, Any
from datetime import datetime

from ..core.config import settings


class TilopayService:
    """Service for integrating with Tilopay payment gateway."""

    def __init__(self):
        self.api_key = settings.TILOPAY_API_KEY
        self.merchant_key = settings.TILOPAY_MERCHANT_KEY
        self.webhook_secret = settings.TILOPAY_WEBHOOK_SECRET
        self.base_url = settings.TILOPAY_BASE_URL
        self.redirect_url = settings.TILOPAY_REDIRECT_URL
        self.cancel_url = settings.TILOPAY_CANCEL_URL
        self.webhook_url = settings.TILOPAY_WEBHOOK_URL

    def _generate_signature(self, data: Dict[str, Any]) -> str:
        """Generate signature for Tilopay request."""
        # Sort keys alphabetically
        sorted_keys = sorted(data.keys())
        # Concatenate values
        signature_string = "".join([str(data[key]) for key in sorted_keys])
        # Add merchant key
        signature_string += self.merchant_key
        # Generate SHA256 hash
        return hashlib.sha256(signature_string.encode()).hexdigest()

    async def get_sdk_token(self) -> Dict[str, Any]:
        """
        Get SDK token from Tilopay for SDK V2 integration.

        Calls /api/v1/loginSdk with apiuser, password, and key to get the security token.

        Returns:
            Dict with token for SDK initialization
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/loginSdk",
                    json={
                        "apiuser": settings.TILOPAY_API_USER,
                        "password": settings.TILOPAY_API_PASSWORD,
                        "key": self.api_key,
                    },
                    headers={"Content-Type": "application/json"},
                    timeout=30.0,
                )

                response.raise_for_status()
                result = response.json()

                return {
                    "success": True,
                    "token": result.get("access_token"),  # loginSdk returns "access_token" not "token"
                    "data": result,
                }

        except httpx.HTTPError as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to get SDK token",
            }

    async def create_embedded_payment(
        self,
        amount: float,
        currency: str = "USD",
        order_id: str = None,
        description: str = "Sat Yoga Payment",
        customer_email: str = None,
        customer_name: str = None,
        metadata: Dict[str, Any] = None,
    ) -> Dict[str, Any]:
        """
        Create an embedded payment session for in-page payment form.

        This method returns payment data for the frontend to embed
        Tilopay's payment form directly in the page.

        Args:
            amount: Payment amount
            currency: Currency code (USD, CRC, etc.)
            order_id: Your internal order ID
            description: Payment description
            customer_email: Customer email
            customer_name: Customer name
            metadata: Additional metadata

        Returns:
            Dict with payment session data for frontend embedding
        """
        try:
            # Prepare payment data
            payment_data = {
                "key": self.api_key,
                "amount": f"{amount:.2f}",
                "currency": currency,
                "description": description,
                "orderId": order_id or f"ORD-{datetime.utcnow().timestamp()}",
                "callbackUrl": self.webhook_url,  # Add webhook callback URL
            }

            if customer_email:
                payment_data["email"] = customer_email

            if customer_name:
                payment_data["name"] = customer_name

            # Generate signature
            payment_data["signature"] = self._generate_signature(payment_data)

            # For embedded payments, we return the data for frontend
            # The frontend will use Tilopay's JavaScript SDK
            return {
                "success": True,
                "payment_data": {
                    "key": self.api_key,
                    "amount": payment_data["amount"],
                    "currency": currency,
                    "description": description,
                    "orderId": payment_data["orderId"],
                    "email": customer_email,
                    "name": customer_name,
                    "callbackUrl": self.webhook_url,  # Include in returned data
                    "signature": payment_data["signature"],
                },
                "order_id": payment_data["orderId"],
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to create payment session",
            }

    async def create_redirect_payment(
        self,
        amount: float,
        currency: str = "USD",
        order_id: str = None,
        description: str = "Sat Yoga Payment",
        customer_email: str = None,
        customer_name: str = None,
        metadata: Dict[str, Any] = None,
    ) -> Dict[str, Any]:
        """
        Create a redirect payment (hosted payment page).

        This method returns a payment URL to redirect the user to Tilopay's
        hosted payment page.

        Args:
            amount: Payment amount
            currency: Currency code (USD, CRC, etc.)
            order_id: Your internal order ID
            description: Payment description
            customer_email: Customer email
            customer_name: Customer name
            metadata: Additional metadata

        Returns:
            Dict with payment URL for redirect
        """
        try:
            # Prepare payment data
            payment_data = {
                "key": self.api_key,
                "amount": f"{amount:.2f}",
                "currency": currency,
                "description": description,
                "orderId": order_id or f"ORD-{datetime.utcnow().timestamp()}",
                "redirect": self.redirect_url,
                "cancel": self.cancel_url,
            }

            if customer_email:
                payment_data["email"] = customer_email

            if customer_name:
                payment_data["name"] = customer_name

            # Generate signature
            payment_data["signature"] = self._generate_signature(payment_data)

            # Send request to Tilopay
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/orders/create",
                    json=payment_data,
                    headers={"Content-Type": "application/json"},
                    timeout=30.0,
                )

                response.raise_for_status()
                result = response.json()

                return {
                    "success": True,
                    "payment_url": result.get("url"),
                    "order_id": result.get("orderId"),
                    "transaction_id": result.get("transactionId"),
                    "data": result,
                }

        except httpx.HTTPError as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to create payment order",
            }

    async def verify_payment(self, transaction_id: str) -> Dict[str, Any]:
        """
        Verify payment status with Tilopay.

        Args:
            transaction_id: Tilopay transaction ID

        Returns:
            Payment status and details
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/orders/{transaction_id}",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    timeout=30.0,
                )

                response.raise_for_status()
                result = response.json()

                return {
                    "success": True,
                    "status": result.get("status"),
                    "paid": result.get("paid", False),
                    "amount": result.get("amount"),
                    "currency": result.get("currency"),
                    "data": result,
                }

        except httpx.HTTPError as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to verify payment",
            }

    def verify_webhook_signature(self, payload: Dict[str, Any], signature: str) -> bool:
        """
        Verify webhook signature from Tilopay.

        Args:
            payload: Webhook payload
            signature: Signature from webhook header

        Returns:
            True if signature is valid
        """
        calculated_signature = self._generate_signature(payload)
        return calculated_signature == signature

    async def process_webhook(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process Tilopay webhook notification.

        Args:
            payload: Webhook payload from Tilopay

        Returns:
            Processed webhook data
        """
        return {
            "transaction_id": payload.get("transactionId"),
            "order_id": payload.get("orderId"),
            "status": payload.get("status"),
            "paid": payload.get("paid", False),
            "amount": payload.get("amount"),
            "currency": payload.get("currency"),
            "payment_method": payload.get("paymentMethod"),
            "customer_email": payload.get("email"),
            "raw_data": payload,
        }

    async def refund_payment(
        self, transaction_id: str, amount: Optional[float] = None, reason: str = None
    ) -> Dict[str, Any]:
        """
        Refund a payment.

        Args:
            transaction_id: Tilopay transaction ID
            amount: Amount to refund (None for full refund)
            reason: Reason for refund

        Returns:
            Refund status
        """
        try:
            refund_data = {
                "key": self.api_key,
                "transactionId": transaction_id,
            }

            if amount:
                refund_data["amount"] = f"{amount:.2f}"

            if reason:
                refund_data["reason"] = reason

            refund_data["signature"] = self._generate_signature(refund_data)

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/refunds",
                    json=refund_data,
                    headers={"Content-Type": "application/json"},
                    timeout=30.0,
                )

                response.raise_for_status()
                result = response.json()

                return {
                    "success": True,
                    "refund_id": result.get("refundId"),
                    "status": result.get("status"),
                    "data": result,
                }

        except httpx.HTTPError as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to process refund",
            }


# Singleton instance
tilopay_service = TilopayService()
