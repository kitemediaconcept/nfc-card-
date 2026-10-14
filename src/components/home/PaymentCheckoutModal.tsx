'use client';

import React, { useState, useEffect } from 'react';
import { SelectedPlanState } from '@/types/pricing';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { ShieldCheck, CheckCircle2, Lock, Smartphone, CreditCard, Building, ArrowRight, X } from 'lucide-react';

interface PaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: SelectedPlanState;
  onPaymentSuccess: (details: {
    transactionId: string;
    amount: number;
    planName: string;
    method: string;
  }) => void;
}

export default function PaymentCheckoutModal({
  isOpen,
  onClose,
  selectedPlan,
  onPaymentSuccess,
}: PaymentCheckoutModalProps) {
  const [tab, setTab] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('user@okhdfcbank');
  const [upiQrUrl, setUpiQrUrl] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  const price = selectedPlan.tier.discountedPrice;
  const originalPrice = selectedPlan.tier.originalPrice;
  const planName = selectedPlan.tier.name;

  // Generate UPI QR code data url
  useEffect(() => {
    if (isOpen) {
      const upiUri = `upi://pay?pa=nfccard@upi&pn=NFC%20Card&am=${price}&cu=INR&tn=${encodeURIComponent(
        planName
      )}`;
      QRCode.toDataURL(upiUri, {
        width: 300,
        margin: 1,
        color: { dark: '#111111', light: '#ffffff' },
      }).then(setUpiQrUrl);

      // Generate a mock txn ID
      setTransactionId(`TXN-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`);
      setSuccess(false);
      setProcessing(false);
    }
  }, [isOpen, price, planName]);

  if (!isOpen) return null;

  const handlePay = () => {
    setProcessing(true);

    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.5 },
        });
      } catch {
        // Ignored
      }

      setTimeout(() => {
        onPaymentSuccess({
          transactionId,
          amount: price,
          planName,
          method: tab.toUpperCase(),
        });
      }, 1200);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-[480px] bg-white rounded-[28px] border border-neutral-200 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-neutral-900 text-white grid place-items-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 m-0">Secure Checkout</h3>
              <p className="text-xs text-neutral-500 m-0">256-bit encrypted transaction</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-neutral-200 grid place-items-center text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success View */}
        {success ? (
          <div className="p-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto grid place-items-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-neutral-900 m-0">Payment Successful!</h4>
              <p className="text-sm text-neutral-600 mt-1">
                Transaction ID: <span className="font-mono font-semibold">{transactionId}</span>
              </p>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-neutral-500">Membership:</span>
                <span className="font-semibold text-neutral-900">{planName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Amount Paid:</span>
                <span className="font-semibold text-neutral-900">
                  <span className="currency-sym">र</span>{price.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">NFC Profile Setup:</span>
                <span className="font-semibold text-emerald-600">Unlocked &amp; Opening...</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Order Summary Card */}
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  Order Summary
                </span>
                <h4 className="text-sm font-bold text-neutral-900 mt-0.5">
                  NFC Smart Card · {planName}
                </h4>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Free contactless NFC chip encoding &amp; QR
                </p>
              </div>

              <div className="text-right">
                <del className="text-xs text-neutral-400 block">
                  <span className="currency-sym">र</span>{originalPrice.toLocaleString()}
                </del>
                <strong className="text-lg font-bold text-neutral-900">
                  <span className="currency-sym">र</span>{price.toLocaleString()}
                </strong>
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div>
              <div className="flex gap-2 p-1 bg-neutral-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTab('upi')}
                  className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    tab === 'upi' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTab('card')}
                  className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    tab === 'card' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTab('netbanking')}
                  className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    tab === 'netbanking' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <Building className="w-3.5 h-3.5" />
                  <span>NetBanking</span>
                </button>
              </div>
            </div>

            {/* Tab Contents */}
            {tab === 'upi' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-neutral-200 bg-white">
                  {upiQrUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={upiQrUrl}
                      alt="UPI QR Code"
                      className="w-28 h-28 rounded-lg border border-neutral-100 p-1"
                    />
                  ) : (
                    <div className="w-28 h-28 bg-neutral-100 rounded-lg animate-pulse" />
                  )}

                  <div className="space-y-1 text-center sm:text-left">
                    <p className="text-xs font-semibold text-neutral-900">
                      Scan with any UPI App
                    </p>
                    <p className="text-[11px] text-neutral-500 leading-relaxed">
                      Google Pay, PhonePe, Paytm, BHIM, or CRED.
                    </p>
                    <div className="flex gap-2 justify-center sm:justify-start pt-1">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600">
                        GPay
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600">
                        PhonePe
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600">
                        Paytm
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Or pay via UPI ID
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="mobile@upi / username@okhdfcbank"
                    className="w-full border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 outline-none focus:border-neutral-900"
                  />
                </div>
              </div>
            )}

            {tab === 'card' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    defaultValue="4532 •••• •••• 8821"
                    placeholder="Card Number"
                    className="w-full border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 outline-none focus:border-neutral-900 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                      Valid Thru
                    </label>
                    <input
                      type="text"
                      defaultValue="08/28"
                      placeholder="MM/YY"
                      className="w-full border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 outline-none focus:border-neutral-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                      CVV
                    </label>
                    <input
                      type="password"
                      defaultValue="•••"
                      maxLength={4}
                      placeholder="CVV"
                      className="w-full border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 outline-none focus:border-neutral-900 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {tab === 'netbanking' && (
              <div className="space-y-2">
                <label className="block text-[11px] font-medium text-neutral-600">
                  Select Popular Bank
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'].map((bank, i) => (
                    <label
                      key={bank}
                      className="flex items-center gap-2 p-2.5 border border-neutral-200 rounded-xl cursor-pointer hover:bg-neutral-50"
                    >
                      <input
                        type="radio"
                        name="bank"
                        defaultChecked={i === 0}
                        className="accent-neutral-900"
                      />
                      <span className="font-medium text-neutral-800">{bank}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Pay Button */}
            <button
              type="button"
              disabled={processing}
              onClick={handlePay}
              className="w-full bg-[#111] hover:bg-[#333] text-white rounded-xl py-3.5 text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg disabled:opacity-50"
            >
              {processing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Payment...</span>
                </>
              ) : (
                <>
                  <span>
                    Pay <span className="currency-sym">र</span>{price.toLocaleString()} &amp; Open Profile
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Security Footer Note */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Instant Verification · Unlock profile creator immediately</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
