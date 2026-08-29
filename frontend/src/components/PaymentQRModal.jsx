import React, { useState, useEffect } from 'react';
import { QrCode, X, CheckCircle, ShieldCheck, Copy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import axios from 'axios';

export default function PaymentQRModal({ isOpen, onClose, amount, beneficiaryName }) {
  const [qrData, setQrData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [simulatedPaid, setSimulatedPaid] = useState(false);

  useEffect(() => {
    if (isOpen && amount) {
      setSimulatedPaid(false);
      axios.post('/api/upi/generate-qr', {
        amount_inr: amount,
        beneficiary_name: beneficiaryName || 'Beneficiary'
      })
      .then((res) => setQrData(res.data))
      .catch((err) => console.error(err));
    }
  }, [isOpen, amount, beneficiaryName]);

  if (!isOpen) return null;

  const handleSimulatePayment = () => {
    setSimulatedPaid(true);
    confetti({ particleCount: 80, spread: 60 });
  };

  const handleCopyVPA = () => {
    if (qrData?.vpa) {
      navigator.clipboard.writeText(qrData.vpa);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-slate-900">
            NPCI Bharat QR Escrow Deposit
          </h3>
          <p className="text-xs text-slate-500">
            Scan with any UPI App (GPay, PhonePe, Paytm, BHIM) to lock your 10% Margin Capital.
          </p>
        </div>

        {/* QR Code Container */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center flex flex-col items-center">
          {qrData ? (
            <img
              src={qrData.qr_base64}
              alt="UPI QR Code"
              className="w-48 h-48 rounded-xl border border-slate-300 shadow-sm"
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">
              Generating dynamic NPCI QR...
            </div>
          )}

          <div className="mt-3">
            <span className="text-xs font-bold text-slate-500 block">Amount Payable (10% Equity)</span>
            <span className="text-2xl font-black text-slate-900">₹{amount?.toLocaleString()}</span>
          </div>

          <div className="mt-2 flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-600 font-mono">{qrData?.vpa || 'mosje.escrow@sbi'}</span>
            <button
              type="button"
              onClick={handleCopyVPA}
              className="text-blue-600 font-bold hover:text-blue-800 flex items-center space-x-1"
            >
              <Copy className="w-3 h-3" />
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 space-y-2">
          {simulatedPaid ? (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-center font-bold text-xs flex items-center justify-center space-x-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>₹{amount?.toLocaleString()} Locked in Escrow & SCA Notified!</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSimulatePayment}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Simulate Successful UPI Scan & Pay</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
