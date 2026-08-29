"""
NPCI UPI & Bharat QR Payment Gateway Service
Generates standard NPCI compliant UPI dynamic QR codes (upi://pay)
for 10% Margin Capital escrow deposit and NACH e-mandate registration.
"""
import io
import base64
import qrcode
from typing import Dict, Any

class PaymentGatewayService:
    def __init__(self):
        self.default_vpa = "mosje.escrow@sbi"
        self.merchant_name = "MoSJE Concessional Credit Escrow"

    def generate_upi_qr(
        self,
        amount_inr: float,
        beneficiary_name: str,
        transaction_note: str = "Margin Capital Escrow Deposit"
    ) -> Dict[str, Any]:
        """
        Constructs NPCI UPI URI string and encodes to base64 PNG QR code.
        Standard format: upi://pay?pa=...&pn=...&am=...&cu=INR&tn=...
        """
        clean_name = beneficiary_name.replace(" ", "%20")
        clean_note = transaction_note.replace(" ", "%20")
        
        upi_uri = (
            f"upi://pay?pa={self.default_vpa}"
            f"&pn={self.merchant_name.replace(' ', '%20')}"
            f"&am={amount_inr:.2f}"
            f"&cu=INR"
            f"&tn={clean_note}-{clean_name}"
        )

        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=8,
            border=2,
        )
        qr.add_data(upi_uri)
        qr.make(fit=True)

        img = qr.make_image(fill_color="#0F172A", back_color="white")
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        qr_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")

        return {
            "upi_uri": upi_uri,
            "qr_base64": f"data:image/png;base64,{qr_base64}",
            "amount_inr": amount_inr,
            "vpa": self.default_vpa,
            "merchant": self.merchant_name,
            "transaction_note": transaction_note
        }

payment_service = PaymentGatewayService()
