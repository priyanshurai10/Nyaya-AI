"use client";

import React, { useState, useRef } from "react";
import { 
  Store, 
  Phone, 
  FileText, 
  Search, 
  Shield, 
  ChevronRight, 
  CheckCircle2, 
  X, 
  User, 
  Mail,
  Upload, 
  AlertCircle,
  Copy,
  QrCode,
  Sparkles
} from "lucide-react";
import Link from "next/link";

interface ServiceItem {
  id: string;
  title: string;
  desc: string;
  price: string; // e.g. "₹499"
  amountNum: number; // e.g. 499
  duration: string;
  category: string;
  icon: any;
  color: string;
  featured?: boolean;
}

export default function LegalMarketplacePage() {
  const [activeTab, setActiveTab] = useState("all");
  
  // Selected service for modal checkout
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    notes: "",
    utr: ""
  });
  
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [paymentOption, setPaymentOption] = useState<"upi" | "qr" | null>("qr");
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderRef, setOrderRef] = useState("");
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { id: "all", label: "All Services" },
    { id: "consultation", label: "Consultation" },
    { id: "drafting", label: "Legal Drafting" },
    { id: "registration", label: "Registrations" }
  ];

  const services: ServiceItem[] = [
    {
      id: "srv-1",
      title: "Talk to Senior Legal Specialist",
      desc: "Get an immediate callback from a verified senior advocate for expert advice on your specific legal issue.",
      price: "₹200",
      amountNum: 200,
      duration: "30 mins",
      category: "consultation",
      icon: Phone,
      color: "bg-blue-500",
      featured: true
    },
    {
      id: "srv-2",
      title: "Draft Legal Notice",
      desc: "Professional drafting of a legal notice for recovery of money, property disputes, or defamation.",
      price: "₹499",
      amountNum: 499,
      duration: "48 hours",
      category: "drafting",
      icon: FileText,
      color: "bg-emerald-500",
      featured: false
    },
    {
      id: "srv-3",
      title: "Review Rental Agreement",
      desc: "Have an expert review your rent agreement to identify risks and unfair clauses before you sign.",
      price: "₹1,499",
      amountNum: 1499,
      duration: "24 hours",
      category: "drafting",
      icon: Search,
      color: "bg-amber-500",
      featured: false
    },
    {
      id: "srv-4",
      title: "Consumer Complaint Filing",
      desc: "End-to-end assistance in drafting and filing a complaint in the Consumer Forum.",
      price: "₹1,499",
      amountNum: 1499,
      duration: "72 hours",
      category: "registration",
      icon: Shield,
      color: "bg-purple-500",
      featured: false
    }
  ];

  const filtered = services.filter(s => activeTab === "all" || s.category === activeTab);

  const handleOpenOrder = (srv: ServiceItem) => {
    setSelectedService(srv);
    setStep(1);
    setError("");
    setFormData({ name: "", mobile: "", email: "", notes: "", utr: "" });
    setScreenshot(null);
    setPaymentOption("qr");
  };

  const handleCloseModal = () => {
    setSelectedService(null);
    setStep(1);
    setError("");
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText("priyanshurai121111@oksbi");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshot(e.target.files[0]);
    }
  };

  const handleNextToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.mobile.trim() || !formData.email.trim()) {
      setError("Please fill in your Name, Mobile Number, and Email ID.");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.utr || !screenshot) {
      setError("Please upload your payment screenshot and enter the UTR / reference number.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    setTimeout(() => {
      const generatedRef = `NYAYA-SRV-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderRef(generatedRef);
      setIsSubmitting(false);
      setStep(4); // Success screen
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3">
              <Store className="w-8 h-8 text-[#FF9933]" />
              Legal Services Marketplace
            </h1>
            <p className="text-[var(--text-muted)] mt-2">
              Book consultations, order legal drafts, and get verified professional legal help at transparent prices.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Featured Section: Talk to Senior Specialist */}
        <div className="mb-12">
          <div className="bg-gradient-to-br from-[#0B1220] to-[#1a2942] dark:from-[#111827] dark:to-[#1a2942] rounded-3xl overflow-hidden border border-slate-800 shadow-xl relative">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Phone className="w-48 h-48 text-white" />
            </div>
            <div className="relative p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center justify-between z-10">
              <div className="text-white max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF9933]/20 text-[#FF9933] border border-[#FF9933]/30 rounded-full text-sm font-bold mb-4">
                  <StarIcon className="w-4 h-4" /> Top Requested Service
                </div>
                <h2 className="text-3xl md:text-4xl font-black mb-4">Talk to Senior Legal Specialist</h2>
                <p className="text-slate-300 text-lg mb-6 leading-relaxed">
                  Get a dedicated 30-minute consultation call with a verified senior advocate. Available in multiple languages. They will review your case summary and guide your next steps.
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> 100% Confidential</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> Bar Council Verified</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> Direct QR & UPI Payment</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> Fixed Price</span>
                </div>
              </div>
              <div className="bg-[var(--card)] p-6 rounded-2xl w-full md:w-80 shrink-0 shadow-lg text-center border border-slate-200 dark:border-slate-800">
                <p className="text-[var(--text-muted)] font-medium mb-1">Fixed Price</p>
                <div className="text-4xl font-black text-[var(--text-primary)] mb-6">₹200</div>
                <button
                  onClick={() => handleOpenOrder(services[0])}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#FF9933] hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                  <Phone className="w-5 h-5" /> Book Consultation
                </button>
                <p className="text-xs text-[var(--text-muted)] mt-4">Callback within 2 hours</p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto pb-4 mb-8 gap-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${ activeTab === cat.id ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm" : "bg-[var(--card)] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-[#1F2937] dark:hover:bg-[var(--card-elevated)] border border-slate-200 dark:border-slate-800" }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(srv => (
            <div key={srv.id} className="bg-[var(--card)] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col hover:border-[#FF9933]/50 transition-colors group">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${srv.color} text-white shadow-sm`}>
                  <srv.icon className="w-6 h-6" />
                </div>
                <span className="font-black text-2xl text-[var(--text-primary)]">{srv.price}</span>
              </div>
              
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 group-hover:text-[#FF9933] transition-colors">
                {srv.title}
              </h3>
              <p className="text-sm text-[var(--text-muted)] mb-6 flex-1">
                {srv.desc}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-medium text-[var(--text-muted)] bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                  {srv.duration}
                </span>
                
                <button
                  onClick={() => handleOpenOrder(srv)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#FF9933] hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow active:scale-95"
                >
                  Order Service <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── INTERACTIVE ORDER & PAYMENT MODAL ────────────────────────────────────── */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur z-10">
              <div>
                <span className="text-xs font-bold text-[#FF9933] uppercase tracking-wider block mb-0.5">
                  Order Legal Service
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  {selectedService.title}
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Header */}
            {step < 4 && (
              <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-500">
                <span className={step >= 1 ? "text-[#FF9933]" : ""}>1. Details</span>
                <span>→</span>
                <span className={step >= 2 ? "text-[#FF9933]" : ""}>2. Payment (QR / UPI)</span>
                <span>→</span>
                <span className={step >= 3 ? "text-[#FF9933]" : ""}>3. Verification</span>
              </div>
            )}

            {error && (
              <div className="mx-6 mt-4 p-3.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 flex items-center gap-2 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Modal Body */}
            <div className="p-6">
              
              {/* STEP 1: Details */}
              {step === 1 && (
                <form onSubmit={handleNextToPayment} className="space-y-4">
                  <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Total payable amount</p>
                      <p className="text-2xl font-black text-slate-900 dark:text-white">{selectedService.price}</p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 bg-[#FF9933]/10 text-[#FF9933] border border-[#FF9933]/20 rounded-lg">
                      Delivery in {selectedService.duration}
                    </span>
                  </div>

                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Your Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        required
                        type="text"
                        placeholder="Advocate / Client Full Name"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Contact Number (For Call & Updates) *</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        required
                        type="tel"
                        placeholder="10-digit mobile number"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                        value={formData.mobile}
                        onChange={e => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      />
                    </div>
                  </div>

                  {/* Email ID */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email ID (For Receiving Legal Drafts & Updates) *</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        required
                        type="email"
                        placeholder="yourname@example.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Case Notes / Instructions */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Case Notes / Instructions (Optional)</label>
                    <textarea
                      rows={3}
                      placeholder="Brief details or specific requirements..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                      value={formData.notes}
                      onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#FF9933] hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-4"
                  >
                    Proceed to Payment ({selectedService.price}) <ChevronRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* STEP 2: Payment Selection (QR / UPI) */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Step 2 of 3</p>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                      Pay <span className="text-[#FF9933] font-black">{selectedService.price}</span> for {selectedService.title}
                    </h4>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentOption("qr")}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col gap-1 ${ paymentOption === "qr" ? "border-[#138808] bg-emerald-50/50 dark:bg-emerald-950/20" : "border-slate-200 dark:border-slate-700 hover:border-slate-300" }`}
                    >
                      <div className="flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-[#138808]" />
                        <span className="font-bold text-xs text-slate-900 dark:text-white">Pay via QR Code</span>
                      </div>
                      <span className="text-[10px] text-slate-500">Scan with GPay / PhonePe</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentOption("upi")}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col gap-1 ${ paymentOption === "upi" ? "border-[#FF9933] bg-orange-50/50 dark:bg-orange-950/20" : "border-slate-200 dark:border-slate-700 hover:border-slate-300" }`}
                    >
                      <div className="flex items-center gap-2">
                        <Copy className="w-4 h-4 text-[#FF9933]" />
                        <span className="font-bold text-xs text-slate-900 dark:text-white">Pay via UPI ID</span>
                      </div>
                      <span className="text-[10px] text-slate-500">Copy UPI ID directly</span>
                    </button>
                  </div>

                  {/* QR Code Panel */}
                  {paymentOption === "qr" && (
                    <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border-2 border-[#138808] rounded-2xl p-5 flex flex-col items-center gap-3 animate-fade-in text-center">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Scan QR code with any UPI App (GPay, PhonePe, Paytm):
                      </p>
                      <div className="bg-white p-2.5 rounded-2xl shadow-md border border-slate-200">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=upi://pay?pa=priyanshurai121111%40oksbi%26am=${selectedService.amountNum}%26cu=INR%26tn=Nyaya+${encodeURIComponent(selectedService.title)}`}
                          alt={`UPI QR Code - ${selectedService.title}`}
                          className="w-48 h-48 object-contain"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs text-slate-500">UPI ID: <span className="font-mono font-bold text-slate-900 dark:text-white select-all">priyanshurai121111@oksbi</span></p>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">Verified Merchant: Priyanshu Rai</p>
                      </div>
                    </div>
                  )}

                  {/* UPI ID Panel */}
                  {paymentOption === "upi" && (
                    <div className="bg-orange-50/50 dark:bg-orange-950/20 border-2 border-[#FF9933] rounded-2xl p-5 flex flex-col items-center gap-3 animate-fade-in text-center">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Transfer exact amount <span className="font-bold text-slate-900 dark:text-white">{selectedService.price}</span> to:
                      </p>
                      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3 font-mono text-base font-bold text-slate-900 dark:text-white tracking-wide select-all">
                        priyanshurai121111@oksbi
                      </div>
                      <p className="text-xs text-slate-500">Account Name: <span className="font-semibold text-slate-800 dark:text-slate-200">Priyanshu Rai</span></p>
                      <button
                        type="button"
                        onClick={copyUpiId}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${ copied ? "bg-emerald-500 text-white" : "bg-[#FF9933] hover:bg-orange-600 text-white" }`}
                      >
                        {copied ? (
                          <><CheckCircle2 className="w-4 h-4" /> Copied UPI ID!</>
                        ) : (
                          <><Copy className="w-4 h-4" /> Copy UPI ID</>
                        )}
                      </button>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-1/3 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="w-2/3 py-3 bg-[#FF9933] hover:bg-orange-600 text-white font-bold text-xs rounded-xl transition-all shadow flex items-center justify-center gap-1.5"
                    >
                      I Have Completed Payment <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Verification */}
              {step === 3 && (
                <form onSubmit={handleSubmitOrder} className="space-y-4">
                  <div className="text-center mb-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Step 3 of 3</p>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">Verify Payment Details</h4>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">1. Upload Payment Screenshot</label>
                    <div
                      className={`w-full h-36 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors ${ screenshot ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20' : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40' }`}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {screenshot ? (
                        <>
                          <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-1" />
                          <span className="font-semibold text-xs text-emerald-600 dark:text-emerald-400">{screenshot.name}</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-slate-400 mb-1" />
                          <span className="font-bold text-xs text-slate-600 dark:text-slate-300">Click to upload payment screenshot</span>
                          <span className="text-[10px] text-slate-400">PNG, JPG up to 5MB</span>
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

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">2. Enter 12-Digit UTR / Reference Number</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g., 301234567890"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                      value={formData.utr}
                      onChange={e => setFormData({ ...formData, utr: e.target.value })}
                    />
                    <p className="text-[10px] text-slate-400">Available in your GPay / PhonePe / Paytm transaction history.</p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-1/3 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !screenshot || !formData.utr}
                      className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow flex items-center justify-center gap-1.5"
                    >
                      {isSubmitting ? 'Verifying...' : 'Submit Order & Verification'}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 4: Success Confirmation */}
              {step === 4 && (
                <div className="py-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                    Order Submitted Successfully!
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    Your service order for <span className="font-bold text-slate-900 dark:text-white">{selectedService.title}</span> has been received and is pending payment verification.
                  </p>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-left text-xs space-y-1.5 border border-slate-100 dark:border-slate-700">
                    <p className="text-slate-500">Order Reference: <span className="font-mono font-bold text-slate-900 dark:text-white">{orderRef}</span></p>
                    <p className="text-slate-500">Name: <span className="font-bold text-slate-900 dark:text-white">{formData.name}</span></p>
                    <p className="text-slate-500">Contact Number: <span className="font-bold text-slate-900 dark:text-white">{formData.mobile}</span></p>
                    <p className="text-slate-500">Email ID: <span className="font-bold text-slate-900 dark:text-white">{formData.email}</span></p>
                    <p className="text-slate-500">Service: <span className="font-bold text-slate-900 dark:text-white">{selectedService.title}</span></p>
                    <p className="text-slate-500">Amount Paid: <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedService.price}</span></p>
                    <p className="text-slate-500">Status: <span className="font-bold text-amber-500">Awaiting Verification</span></p>
                  </div>

                  <button
                    onClick={handleCloseModal}
                    className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors"
                  >
                    Done
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function StarIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}
