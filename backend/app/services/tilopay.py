"""
Tilopay Payment Gateway Integration for Next.js/FastAPI.

Based on Tilopay's jQuery integration adapted for server-side processing.
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

    async def create_payment(
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
        Create a payment order with Tilopay.

        Args:
            amount: Payment amount
            currency: Currency code (USD, CRC, etc.)
            order_id: Your internal order ID
            description: Payment description
            customer_email: Customer email
            customer_name: Customer name
            metadata: Additional metadata

        Returns:
            Dict with payment URL and order details
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
