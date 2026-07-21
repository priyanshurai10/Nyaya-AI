"use client";

import React, { useState, useRef } from "react";
import { Phone, Clock, FileText, CheckCircle2, AlertCircle, ChevronRight, User, Upload, QrCode } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function TalkToSeniorSpecialistPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    language: "English",
    time: "ASAP",
    category: "General Legal",
    summary: "",
    utr: ""
  });
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookingRef, setBookingRef] = useState("");
  const [paymentOption, setPaymentOption] = useState<"upi" | "qr" | null>(null);
  const [copied, setCopied] = useState(false);

  const copyUpiId = () => {
    navigator.clipboard.writeText("priyanshurai121111@oksbi");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.name || !formData.mobile) {
        setError("Please fill in required fields.");
        return;
      }
      setError("");
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshot(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.utr || !screenshot) {
      setError("Please provide UTR number and payment screenshot.");
      return;
    }

    setIsLoading(true);
    setError("");
    
    try {
      // Step 1: Submit payment request to initiate transaction and create request
      const submitData = new FormData();
      submitData.append("service_name", "Talk to Senior Legal Specialist");
      submitData.append("amount", "200");
      submitData.append("payment_method", "upi");
      submitData.append("full_name", formData.name);
      submitData.append("mobile_number", formData.mobile);
      submitData.append("preferred_language", formData.language);
      submitData.append("legal_issue_type", formData.category);
      submitData.append("description", formData.summary);

      const submitRes = await fetch("/api/v1/consultation/payment/submit", {
        method: "POST",
        body: submitData
      });
      
      const submitResult = await submitRes.json();
      if (!submitRes.ok || !submitResult.success) {
        if (submitRes.status === 401) {
          setError("You must be logged in to book a consultation.");
        } else {
          setError(submitResult.message || "Failed to initiate consultation request.");
        }
        return;
      }

      const txId = submitResult.transaction_id;
      const displayId = submitResult.display_id || submitResult.consultation_id;

      // Step 2: Verify payment by uploading UTR and screenshot
      const verifyData = new FormData();
      verifyData.append("utr_number", formData.utr);
      verifyData.append("screenshot", screenshot);

      const verifyRes = await fetch(`/api/v1/consultation/payment/verify/${txId}`, {
        method: "POST",
        body: verifyData
      });

      const verifyResult = await verifyRes.json();
      if (verifyRes.ok && verifyResult.success) {
        setBookingRef(displayId);
        setStep(4); // Success Step
      } else {
        setError(verifyResult.message || "Failed to submit payment verification.");
      }
    } catch (err) {
      setError("Network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 4) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1220] p-6 lg:p-12 flex items-center justify-center">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 max-w-xl text-center border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Payment Verification Pending</h2>
          <p className="text-slate-600 dark:text-slate-400 dark:text-slate-500 text-lg mb-8">
            Your consultation request and payment details have been submitted. Once verified by our team, a senior legal specialist will call you at the scheduled time.
          </p>
          
          <div className="bg-slate-50 dark:bg-[#0B1220] rounded-2xl p-6 mb-8 text-left border border-slate-100 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Booking Reference: <span className="font-bold text-slate-900 dark:text-white">{bookingRef}</span></p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Service: <span className="font-medium text-slate-900 dark:text-white">Talk to Senior Legal Specialist</span></p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Status: <span className="font-medium text-amber-500">Awaiting Payment Verification</span></p>
          </div>

          <Link href="/marketplace" className="inline-block px-8 py-3 bg-slate-900 dark:bg-[#111827] text-white dark:text-slate-900 dark:text-white font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 dark:bg-[#1F2937] transition-colors">
            Return to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1220] p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/marketplace" className="inline-flex items-center text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-[#FF9933] mb-6 transition-colors">
          <ChevronRight className="w-4 h-4 rotate-180" /> Back to Marketplace
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Side */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-[#FF9933] text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>1</div>
                <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-[#FF9933]' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-[#FF9933] text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>2</div>
                <div className={`h-1 flex-1 rounded-full ${step >= 3 ? 'bg-[#FF9933]' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 3 ? 'bg-[#FF9933] text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>3</div>
              </div>
              
              <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 mb-2">
                <Phone className="w-8 h-8 text-[#FF9933]" /> Talk to Senior Specialist
              </h1>
              <p className="text-slate-600 dark:text-slate-400 dark:text-slate-500">
                {step === 1 && "Step 1: Fill out the details below to request a callback from a verified senior advocate."}
                {step === 2 && "Step 2: Complete the payment of ₹200 using the QR code below."}
                {step === 3 && "Step 3: Upload the payment screenshot and provide the UTR number for verification."}
              </p>
            </div>

            {error && (
              <div className="m-8 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 flex items-center gap-3 font-medium">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            <div className="p-8">
              {step === 1 && (
                <form onSubmit={handleNextStep} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                        <input required type="text" placeholder="John Doe" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1220] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF9933]" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Mobile Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                        <input required type="tel" pattern="[6-9][0-9]{9}" title="Please enter a valid 10-digit Indian mobile number" placeholder="9876543210" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1220] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF9933]" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value.replace(/\D/g, '').slice(0, 10)})} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Preferred Language</label>
                      <select className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1220] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF9933]" value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})}>
                        <option>English</option>
                        <option>Hindi</option>
                        <option>Marathi</option>
                        <option>Tamil</option>
                        <option>Telugu</option>
                        <option>Bengali</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Callback Time</label>
                      <select className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1220] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF9933]" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})}>
                        <option>ASAP (Within 2 hours)</option>
                        <option>Today Evening</option>
                        <option>Tomorrow Morning</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Legal Category</label>
                    <select className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1220] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF9933]" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                      <option>Property Dispute</option>
                      <option>Family / Divorce Law</option>
                      <option>Criminal Defense</option>
                      <option>Corporate / Startup Law</option>
                      <option>Employment Dispute</option>
                      <option>General Legal Advice</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Brief Case Summary (Optional)</label>
                    <textarea 
                      rows={4}
                      placeholder="Briefly describe your legal issue so the specialist can prepare..." 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1220] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF9933]" 
                      value={formData.summary} 
                      onChange={e => setFormData({...formData, summary: e.target.value})} 
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                    <button type="submit" className="w-full py-4 bg-[#FF9933] hover:bg-orange-600 text-white font-bold text-lg rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2">
                      Proceed to Payment <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              )}

              {step === 2 && (
                <div className="space-y-6 w-full">
                  <div className="text-center space-y-1">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Pay ₹200</h2>
                    <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 text-sm">Choose your preferred payment method</p>
                  </div>

                  {/* Two Option Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Option 1: UPI ID */}
                    <button
                      type="button"
                      onClick={() => setPaymentOption(paymentOption === "upi" ? null : "upi")}
                      className={`w-full text-left rounded-2xl border-2 p-5 transition-all ${ paymentOption === "upi" ? "border-[#FF9933] bg-orange-50 dark:bg-orange-900/10" : "border-slate-200 dark:border-slate-700 hover:border-[#FF9933]/50 bg-white dark:bg-slate-900 dark:bg-[#111827]" }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl font-black ${ paymentOption === "upi" ? "bg-[#FF9933] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400" }`}>①</div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">Pay via UPI ID</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Copy & paste in any UPI app</p>
                        </div>
                      </div>
                    </button>

                    {/* Option 2: QR Code */}
                    <button
                      type="button"
                      onClick={() => setPaymentOption(paymentOption === "qr" ? null : "qr")}
                      className={`w-full text-left rounded-2xl border-2 p-5 transition-all ${ paymentOption === "qr" ? "border-[#138808] bg-green-50 dark:bg-green-900/10" : "border-slate-200 dark:border-slate-700 hover:border-[#138808]/50 bg-white dark:bg-slate-900 dark:bg-[#111827]" }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl font-black ${ paymentOption === "qr" ? "bg-[#138808] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400" }`}>②</div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">Pay via QR Code</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Scan with GPay, PhonePe, Paytm</p>
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* UPI ID Panel */}
                  {paymentOption === "upi" && (
                    <div className="bg-orange-50 dark:bg-orange-900/10 border-2 border-[#FF9933] rounded-2xl p-6 flex flex-col items-center gap-4 animate-fade-in">
                      <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">Send ₹200 to this UPI ID:</p>
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-6 py-4 font-mono text-xl font-bold text-slate-900 dark:text-white tracking-wide select-all">
                        priyanshurai121111@oksbi
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Account Name: <span className="font-semibold text-slate-700 dark:text-slate-300">Priyanshu Rai</span></p>
                      <button
                        type="button"
                        onClick={copyUpiId}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${ copied ? "bg-emerald-500 text-white" : "bg-[#FF9933] hover:bg-orange-600" }`}
                      >
                        {copied ? (
                          <><CheckCircle2 className="w-4 h-4" /> Copied!</>
                        ) : (
                          <>📋 Copy UPI ID</>
                        )}
                      </button>
                    </div>
                  )}

                  {/* QR Code Panel */}
                  {paymentOption === "qr" && (
                    <div className="bg-green-50 dark:bg-green-900/10 border-2 border-[#138808] rounded-2xl p-6 flex flex-col items-center gap-4 animate-fade-in">
                      <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">Scan with any UPI app to pay ₹200</p>
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-lg">
                        <img
                          src="https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=upi://pay?pa=priyanshurai121111%40oksbi%26am=200%26cu=INR%26tn=Nyaya+Consultation"
                          alt="UPI QR Code – priyanshurai121111@oksbi"
                          className="w-56 h-56 object-contain"
                        />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">UPI ID: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">priyanshurai121111@oksbi</span></p>
                    </div>
                  )}

                  <div className="w-full pt-4 border-t border-slate-200 dark:border-slate-800 flex gap-4">
                    <button type="button" onClick={() => setStep(1)} className="px-6 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-lg rounded-xl transition-all w-1/3">
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      disabled={!paymentOption}
                      className="w-2/3 py-4 bg-[#FF9933] hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      I have Paid <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block">1. Upload Payment Screenshot</label>
                    <div 
                      className={`w-full h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors ${screenshot ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:bg-[#0B1220] dark:hover:bg-slate-800/50'}`}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {screenshot ? (
                        <>
                          <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2" />
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">{screenshot.name}</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-slate-400 dark:text-slate-500 mb-2" />
                          <span className="font-medium text-slate-600 dark:text-slate-400 dark:text-slate-500">Click to upload screenshot</span>
                          <span className="text-xs text-slate-400 dark:text-slate-500 mt-1">PNG, JPG up to 5MB</span>
                        </>
                      )}
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept="image/*"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">2. Enter UTR / Reference Number</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="e.g., 301234567890" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1220] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF9933] font-mono" 
                      value={formData.utr} 
                      onChange={e => setFormData({...formData, utr: e.target.value})} 
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">You can find this 12-digit number in your UPI app&apos;s transaction history.</p>
                  </div>

                  <div className="w-full pt-4 border-t border-slate-200 dark:border-slate-800 flex gap-4">
                    <button type="button" onClick={() => setStep(2)} className="px-6 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-lg rounded-xl transition-all w-1/3">
                      Back
                    </button>
                    <button type="submit" disabled={isLoading || !screenshot || !formData.utr} className="w-2/3 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-lg rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
                      {isLoading ? 'Submitting...' : 'Submit Verification'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-slate-900 dark:bg-[#111827] rounded-3xl p-6 text-white border border-slate-800 shadow-xl">
              <h3 className="text-xl font-bold mb-6">What&apos;s Included?</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#FF9933] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">30 Minute Call</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500">Dedicated time with a senior legal expert.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-[#FF9933] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Case Review</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500">The lawyer will read your summary beforehand.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#FF9933] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Immediate Resolution</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500">Clear next steps and legal options provided.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-amber-50 dark:bg-amber-500/10 rounded-2xl p-6 border border-amber-200 dark:border-amber-900/30">
              <div className="flex gap-3">
                <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-amber-800 dark:text-amber-400 mb-1">Confidentiality Guarantee</h4>
                  <p className="text-sm text-amber-700/80 dark:text-amber-400/80">
                    Nyaya AI operates under strict attorney-client privilege. Your information is never shared with third parties.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
