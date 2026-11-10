'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calculator,
  Car,
  FileCheck2,
  Building2,
  Briefcase,
  Scale,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  Copy,
  Check,
  Printer,
  ArrowRight,
  Sparkles,
  HelpCircle,
  FileText,
  Clock,
  Coins,
  ChevronRight
} from 'lucide-react';

// ── TRAFFIC OFFENCE DATA ────────────────────────────────────────────────────────
interface TrafficOffence {
  id: string;
  name: string;
  section: string;
  baseFine: number;
  maxFine: number;
  jailTerm?: string;
  isCompoundable: boolean;
  category: 'Safety' | 'Documents' | 'Conduct' | 'Severe';
  notes: string;
}

const trafficOffences: TrafficOffence[] = [
  {
    id: 'helmet',
    name: 'Riding without Helmet (Driver or Pillion)',
    section: 'Section 194D MV Act',
    baseFine: 1000,
    maxFine: 1000,
    isCompoundable: true,
    category: 'Safety',
    notes: 'Plus 3-month driving licence disqualification under statutory rules.'
  },
  {
    id: 'seatbelt',
    name: 'Driving without Seatbelt',
    section: 'Section 194B MV Act',
    baseFine: 1000,
    maxFine: 1000,
    isCompoundable: true,
    category: 'Safety',
    notes: 'Applicable to driver and front-seat / designated passengers.'
  },
  {
    id: 'signal',
    name: 'Jumping Red Light / Stop Sign',
    section: 'Section 184 MV Act',
    baseFine: 1000,
    maxFine: 5000,
    jailTerm: '6 to 12 months',
    isCompoundable: true,
    category: 'Conduct',
    notes: 'Treated as driving dangerously under Section 184.'
  },
  {
    id: 'drunk',
    name: 'Drunk Driving / Driving Under Influence (DUI)',
    section: 'Section 185 MV Act',
    baseFine: 10000,
    maxFine: 15000,
    jailTerm: '6 months (1st offence) / up to 2 years (2nd offence)',
    isCompoundable: false,
    category: 'Severe',
    notes: 'Non-compoundable. Requires court trial. Alcohol level >30mg per 100ml blood.'
  },
  {
    id: 'insurance',
    name: 'Driving without Valid Motor Insurance',
    section: 'Section 196 MV Act',
    baseFine: 2000,
    maxFine: 4000,
    jailTerm: 'Up to 3 months',
    isCompoundable: true,
    category: 'Documents',
    notes: '₹2,000 for first offence; ₹4,000 for subsequent offences.'
  },
  {
    id: 'puc',
    name: 'Expired / Missing Pollution (PUC) Certificate',
    section: 'Section 190(2) MV Act',
    baseFine: 10000,
    maxFine: 10000,
    jailTerm: 'Up to 3 months',
    isCompoundable: true,
    category: 'Documents',
    notes: 'Penalty enhanced under 2019 amendment. 3-month licence suspension possible.'
  },
  {
    id: 'overspeed',
    name: 'Over-speeding (Light Motor Vehicle)',
    section: 'Section 183(1) MV Act',
    baseFine: 1000,
    maxFine: 2000,
    isCompoundable: true,
    category: 'Conduct',
    notes: '₹1,000 to ₹2,000 for LMV; ₹2,000 to ₹4,000 for Medium/Heavy goods/passenger vehicles.'
  },
  {
    id: 'mobile',
    name: 'Using Handheld Mobile Phone while Driving',
    section: 'Section 184(c) MV Act',
    baseFine: 1000,
    maxFine: 5000,
    jailTerm: 'Up to 1 year',
    isCompoundable: true,
    category: 'Conduct',
    notes: 'Navigation usage allowed if hands-free and mounted on dashboard.'
  },
  {
    id: 'emergency',
    name: 'Blocking Emergency Vehicles (Ambulance / Fire Brigade)',
    section: 'Section 194E MV Act',
    baseFine: 10000,
    maxFine: 10000,
    jailTerm: 'Up to 6 months',
    isCompoundable: false,
    category: 'Severe',
    notes: 'Strict non-compoundable statutory penalty to protect emergency services.'
  },
  {
    id: 'minor',
    name: 'Underage / Minor Driving Vehicle',
    section: 'Section 199A MV Act',
    baseFine: 25000,
    maxFine: 25000,
    jailTerm: 'Up to 3 years (for parent/guardian)',
    isCompoundable: false,
    category: 'Severe',
    notes: 'Vehicle registration cancelled for 1 year. Minor ineligible for DL until age 25.'
  }
];

export default function NyayaCalculatorPage() {
  const [activeTab, setActiveTab] = useState<'traffic' | 'cheque' | 'rera' | 'gratuity' | 'maintenance'>('traffic');
  const [copied, setCopied] = useState(false);

  // ── TRAFFIC STATE ─────────────────────────────────────────────────────────────
  const [selectedOffences, setSelectedOffences] = useState<string[]>(['helmet']);

  const toggleOffence = (id: string) => {
    setSelectedOffences(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const totalMinTrafficFine = selectedOffences.reduce((sum, id) => {
    const off = trafficOffences.find(o => o.id === id);
    return sum + (off ? off.baseFine : 0);
  }, 0);

  const totalMaxTrafficFine = selectedOffences.reduce((sum, id) => {
    const off = trafficOffences.find(o => o.id === id);
    return sum + (off ? off.maxFine : 0);
  }, 0);

  const hasNonCompoundable = selectedOffences.some(id => {
    const off = trafficOffences.find(o => o.id === id);
    return off && !off.isCompoundable;
  });

  // ── CHEQUE BOUNCE STATE ───────────────────────────────────────────────────────
  const [chequeAmount, setChequeAmount] = useState<number>(100000);
  const [memoDate, setMemoDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [noticeServedDate, setNoticeServedDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });

  const getChequeDates = () => {
    const noticeDate = new Date(noticeServedDate || memoDate);
    
    // 15 days cure period
    const cureDeadline = new Date(noticeDate);
    cureDeadline.setDate(cureDeadline.getDate() + 15);

    // 30 days filing deadline after 15-day expiry
    const filingDeadline = new Date(cureDeadline);
    filingDeadline.setDate(filingDeadline.getDate() + 30);

    return {
      cureDateStr: cureDeadline.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      filingDateStr: filingDeadline.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      maxFine: chequeAmount * 2,
      interimComp: Math.round(chequeAmount * 0.20)
    };
  };

  const chequeData = getChequeDates();

  // ── RERA DELAY STATE ──────────────────────────────────────────────────────────
  const [propertyPaidAmount, setPropertyPaidAmount] = useState<number>(5000000);
  const [delayMonths, setDelayMonths] = useState<number>(18);
  const [reraInterestRate, setReraInterestRate] = useState<number>(10.75); // SBI MCLR + 2%

  const monthlyReraCompensation = Math.round((propertyPaidAmount * (reraInterestRate / 100)) / 12);
  const totalReraCompensation = Math.round(monthlyReraCompensation * delayMonths);

  // ── GRATUITY STATE ────────────────────────────────────────────────────────────
  const [basicSalary, setBasicSalary] = useState<number>(45000);
  const [yearsWorked, setYearsWorked] = useState<number>(6);
  const [extraMonths, setExtraMonths] = useState<number>(7);

  const roundedYears = extraMonths >= 6 ? yearsWorked + 1 : yearsWorked;
  const isGratuityEligible = yearsWorked >= 5;
  const calculatedGratuity = isGratuityEligible
    ? Math.round((15 * basicSalary * roundedYears) / 26)
    : 0;
  const taxFreeExemptionLimit = 2000000; // ₹20 Lakhs

  // ── MAINTENANCE STATE ─────────────────────────────────────────────────────────
  const [spouseNetSalary, setSpouseNetSalary] = useState<number>(80000);
  const [numChildren, setNumChildren] = useState<number>(1);
  const [claimantIncome, setClaimantIncome] = useState<number>(0);

  // Supreme Court 25% benchmark (Kalyan Dey Chowdhury v. Rita Dey Chowdhury)
  const baseBenchmarkPct = 25;
  const childPct = numChildren * 10;
  const totalPct = Math.min(50, baseBenchmarkPct + childPct);
  const estimatedMaintenance = Math.max(0, Math.round((spouseNetSalary * (totalPct / 100)) - (claimantIncome * 0.5)));

  // ── COPY SUMMARY HANDLER ──────────────────────────────────────────────────────
  const handleCopySummary = () => {
    let text = `=== NYAYA AI LEGAL CALCULATION REPORT ===\n`;
    text += `Date: ${new Date().toLocaleDateString('en-IN')}\n\n`;

    if (activeTab === 'traffic') {
      text += `MODULE: MOTOR VEHICLE TRAFFIC CHALLAN ESTIMATE (MVA 2019)\n`;
      text += `Total Selected Violations: ${selectedOffences.length}\n`;
      text += `Estimated Statutory Fine: ₹${totalMinTrafficFine.toLocaleString('en-IN')} to ₹${totalMaxTrafficFine.toLocaleString('en-IN')}\n`;
      text += `Compoundable: ${hasNonCompoundable ? 'No (Contains offences requiring Court appearance)' : 'Yes (Can be paid at Traffic Police / Online Portal)'}\n\n`;
      text += `Violations Breakdown:\n`;
      selectedOffences.forEach(id => {
        const o = trafficOffences.find(x => x.id === id);
        if (o) text += `• ${o.name} [${o.section}]: ₹${o.baseFine}\n`;
      });
      text += `\nCitizen Shield Rule: DigiLocker/mParivahan is 100% valid under Rule 139A CMVR. Police cannot seize physical keys.\n`;
    } else if (activeTab === 'cheque') {
      text += `MODULE: CHEQUE BOUNCE RECOVERY & DEADLINES (SEC 138 NI ACT)\n`;
      text += `Cheque Face Value: ₹${chequeAmount.toLocaleString('en-IN')}\n`;
      text += `15-Day Cure Payment Deadline: ${chequeData.cureDateStr}\n`;
      text += `30-Day Court Filing Deadline: ${chequeData.filingDateStr}\n`;
      text += `Maximum Criminal Fine Penalty: ₹${chequeData.maxFine.toLocaleString('en-IN')} (Twice Cheque Amount)\n`;
      text += `Maximum Imprisonment Term: Up to 2 Years\n`;
      text += `Section 143A Interim Deposit Relief: ₹${chequeData.interimComp.toLocaleString('en-IN')} (Up to 20%)\n`;
    } else if (activeTab === 'rera') {
      text += `MODULE: BUILDER POSSESSION DELAY COMPENSATION (SEC 18 RERA ACT)\n`;
      text += `Total Amount Paid to Builder: ₹${propertyPaidAmount.toLocaleString('en-IN')}\n`;
      text += `Delay Period: ${delayMonths} Months\n`;
      text += `Applicable RERA Interest Rate: ${reraInterestRate}% p.a. (SBI Highest MCLR + 2%)\n`;
      text += `Monthly Compensation Owed: ₹${monthlyReraCompensation.toLocaleString('en-IN')}/month\n`;
      text += `Total Accumulated Compensation: ₹${totalReraCompensation.toLocaleString('en-IN')}\n`;
    } else if (activeTab === 'gratuity') {
      text += `MODULE: STATUTORY GRATUITY ESTIMATOR (PAYMENT OF GRATUITY ACT 1972)\n`;
      text += `Last Drawn Basic + DA: ₹${basicSalary.toLocaleString('en-IN')}\n`;
      text += `Total Qualifying Service: ${roundedYears} Years (${yearsWorked}y + ${extraMonths}m)\n`;
      text += `5-Year Eligibility Met: ${isGratuityEligible ? 'YES' : 'NO (Must complete 5 continuous years)'}\n`;
      text += `Formula Applied: (15 × Last Basic × Years) ÷ 26\n`;
      text += `Gratuity Amount: ₹${calculatedGratuity.toLocaleString('en-IN')}\n`;
      text += `Tax-Free Limit: Up to ₹20,00,000 under Sec 10(10)\n`;
    } else if (activeTab === 'maintenance') {
      text += `MODULE: MAINTENANCE & ALIMONY BENCHMARK (SEC 125 CrPC / SEC 144 BNSS)\n`;
      text += `Spouse Net Monthly Income: ₹${spouseNetSalary.toLocaleString('en-IN')}\n`;
      text += `Dependent Children: ${numChildren}\n`;
      text += `Supreme Court Benchmark (Kalyan Dey Chowdhury): 25% base + child support\n`;
      text += `Estimated Monthly Interim Maintenance: ₹${estimatedMaintenance.toLocaleString('en-IN')}/month\n`;
    }

    text += `\nDisclaimer: Generated for informational purposes via Nyaya AI. Cites applicable Indian statutory provisions.\n`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] pb-16">
      {/* ── Top Header Hero ── */}
      <div className="relative border-b border-[var(--border)] bg-gradient-to-b from-[#FF9933]/10 via-transparent to-transparent pt-8 pb-10 px-4 md:px-8">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FF9933]/15 text-[#FF9933] border border-[#FF9933]/30 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Statutory Indian Legal Suite
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Updated 2026
                </span>
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight flex items-center gap-3">
                <Calculator className="w-8 h-8 text-[#FF9933]" />
                Nyaya Legal Calculator
                <span className="text-sm md:text-lg font-normal text-[var(--text-muted)]">
                  (न्याय कैलकुलेटर)
                </span>
              </h1>
              <p className="text-sm md:text-base text-[var(--text-muted)] max-w-3xl leading-relaxed">
                Instant statutory calculation engine for Indian citizens, advocates, and consumers. Calculate exact fines, statutory deadlines, delay interests, and compensations backed by codified Indian Acts.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySummary}
                className="px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-sm font-semibold flex items-center gap-2 shadow-sm transition-all"
                title="Copy Calculation Summary"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-[#FF9933]" />}
                <span>{copied ? 'Copied Summary!' : 'Copy Summary'}</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-sm font-semibold hidden sm:flex items-center gap-2 transition-all"
                title="Print Legal Report"
              >
                <Printer className="w-4 h-4 text-slate-400" />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* Module Selection Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pt-4 scrollbar-none border-t border-[var(--border)]/60">
            <button
              onClick={() => setActiveTab('traffic')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm whitespace-nowrap flex items-center gap-2 transition-all ${
                activeTab === 'traffic'
                  ? 'bg-[#FF9933] text-white shadow-md shadow-[#FF9933]/20'
                  : 'bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--text-muted)] border border-[var(--border)]'
              }`}
            >
              <Car className="w-4 h-4" />
              Traffic Challans (MVA 2019)
            </button>

            <button
              onClick={() => setActiveTab('cheque')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm whitespace-nowrap flex items-center gap-2 transition-all ${
                activeTab === 'cheque'
                  ? 'bg-[#FF9933] text-white shadow-md shadow-[#FF9933]/20'
                  : 'bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--text-muted)] border border-[var(--border)]'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              Cheque Bounce (Sec 138)
            </button>

            <button
              onClick={() => setActiveTab('rera')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm whitespace-nowrap flex items-center gap-2 transition-all ${
                activeTab === 'rera'
                  ? 'bg-[#FF9933] text-white shadow-md shadow-[#FF9933]/20'
                  : 'bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--text-muted)] border border-[var(--border)]'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Builder Delay (RERA Sec 18)
            </button>

            <button
              onClick={() => setActiveTab('gratuity')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm whitespace-nowrap flex items-center gap-2 transition-all ${
                activeTab === 'gratuity'
                  ? 'bg-[#FF9933] text-white shadow-md shadow-[#FF9933]/20'
                  : 'bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--text-muted)] border border-[var(--border)]'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Gratuity Settlement (1972 Act)
            </button>

            <button
              onClick={() => setActiveTab('maintenance')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm whitespace-nowrap flex items-center gap-2 transition-all ${
                activeTab === 'maintenance'
                  ? 'bg-[#FF9933] text-white shadow-md shadow-[#FF9933]/20'
                  : 'bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--text-muted)] border border-[var(--border)]'
              }`}
            >
              <Scale className="w-4 h-4" />
              Maintenance Benchmark (Sec 144 BNSS)
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Content Container ── */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 mt-8">
        {/* ========================================================================= */}
        {/* TAB 1: TRAFFIC CHALLAN CALCULATOR                                         */}
        {/* ========================================================================= */}
        {activeTab === 'traffic' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-[var(--text-primary)]">Select Traffic Offences</h2>
                    <p className="text-xs text-[var(--text-muted)]">Check all applicable violations under Motor Vehicles Amendment Act 2019.</p>
                  </div>
                  <button
                    onClick={() => setSelectedOffences([])}
                    className="text-xs font-semibold text-[#FF9933] hover:underline"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-3">
                  {trafficOffences.map(off => {
                    const isSelected = selectedOffences.includes(off.id);
                    return (
                      <div
                        key={off.id}
                        onClick={() => toggleOffence(off.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 select-none ${
                          isSelected
                            ? 'bg-[#FF9933]/10 border-[#FF9933]/50 shadow-sm'
                            : 'bg-[var(--background)] border-[var(--border)] hover:border-slate-600'
                        }`}
                      >
                        <div className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-[#FF9933] border-[#FF9933] text-white' : 'border-slate-500'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-sm font-bold text-[var(--text-primary)]">{off.name}</span>
                            <span className="text-xs font-mono font-bold text-[#FF9933] bg-[#FF9933]/15 px-2 py-0.5 rounded-md">
                              ₹{off.baseFine.toLocaleString('en-IN')}{off.maxFine > off.baseFine ? ` - ₹${off.maxFine.toLocaleString('en-IN')}` : ''}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                            <span className="font-semibold text-slate-400">{off.section}</span>
                            <span>•</span>
                            <span className={off.isCompoundable ? 'text-emerald-400' : 'text-red-400 font-semibold'}>
                              {off.isCompoundable ? 'Compoundable (On Spot / Online)' : 'Non-Compoundable (Court Appearance)'}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--text-muted)] leading-relaxed pt-0.5">{off.notes}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Citizen Rights Shield Box */}
              <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-3xl p-6 space-y-3">
                <div className="flex items-center gap-2.5 text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                  <h3 className="font-bold text-sm">Your Legal Rights During Traffic Stop</h3>
                </div>
                <ul className="text-xs text-[var(--text-muted)] space-y-2 list-disc list-inside leading-relaxed">
                  <li><strong>DigiLocker Validity:</strong> Digital Driving Licence and RC presented on DigiLocker / mParivahan are 100% legally recognized under Rule 139A of the Central Motor Vehicles Rules. Physical documents cannot be demanded.</li>
                  <li><strong>Key Confiscation Prohibited:</strong> Traffic police officers CANNOT legally confiscate or pull out your car/motorcycle ignition key. Doing so violates police conduct codes.</li>
                  <li><strong>Officer Rank Rule:</strong> Head Constables and Constables cannot issue challans exceeding ₹100 in many states; only an officer of Sub-Inspector (SI) rank or above carries statutory challan receipt authority.</li>
                  <li><strong>No Instant Towing:</strong> Your vehicle cannot be towed away if you or any passenger is sitting inside it.</li>
                </ul>
              </div>
            </div>

            {/* Right Summary Column */}
            <div className="space-y-6">
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 shadow-sm sticky top-24 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                  <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Statutory Calculation</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-[#FF9933]/15 text-[#FF9933] font-bold">MVA 2019</span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[var(--text-muted)]">Violations Checked:</span>
                    <span className="font-bold text-[var(--text-primary)]">{selectedOffences.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[var(--text-muted)]">Compoundable Status:</span>
                    <span className={`font-bold text-xs ${hasNonCompoundable ? 'text-red-400' : 'text-emerald-400'}`}>
                      {hasNonCompoundable ? 'Court Trial Required' : 'Online / Spot Payable'}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-[var(--border)] flex justify-between items-baseline">
                    <span className="text-sm font-bold text-[var(--text-primary)]">Total Estimated Fine:</span>
                    <div className="text-right">
                      <span className="text-2xl font-black text-[#FF9933]">
                        ₹{totalMinTrafficFine.toLocaleString('en-IN')}
                      </span>
                      {totalMaxTrafficFine > totalMinTrafficFine && (
                        <span className="text-xs text-[var(--text-muted)] block">
                          up to ₹{totalMaxTrafficFine.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {hasNonCompoundable && (
                  <div className="p-3 bg-red-950/30 border border-red-800/40 rounded-xl text-xs text-red-300 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>One or more selected offences (e.g. Drunk Driving or Minor Driving) are non-compoundable. You will receive a summons from the Judicial Magistrate Court.</span>
                  </div>
                )}

                <div className="pt-2 space-y-2">
                  <button
                    onClick={handleCopySummary}
                    className="w-full py-3 bg-[#FF9933] hover:bg-orange-600 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <Copy className="w-4 h-4" /> Copy Official Fine Report
                  </button>
                  <Link
                    href="/chat"
                    className="w-full py-2.5 bg-[var(--background)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-primary)] font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    Ask AI: How to dispute a wrong challan? <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: CHEQUE BOUNCE CALCULATOR (SEC 138 NI ACT)                          */}
        {/* ========================================================================= */}
        {activeTab === 'cheque' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">Cheque Dishonour Parameters</h2>
                  <p className="text-xs text-[var(--text-muted)]">Under Section 138 of the Negotiable Instruments Act 1881.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-[var(--text-muted)] block">Cheque Face Value (₹)</label>
                    <input
                      type="number"
                      value={chequeAmount}
                      onChange={e => setChequeAmount(Math.max(1, Number(e.target.value)))}
                      className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-lg font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                      placeholder="e.g. 100000"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-muted)] block">Bank Return Memo Date</label>
                    <input
                      type="date"
                      value={memoDate}
                      onChange={e => setMemoDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                    />
                    <p className="text-[11px] text-[var(--text-muted)]">Legal notice must be sent within 30 days of this date.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-muted)] block">Legal Notice Delivery Date</label>
                    <input
                      type="date"
                      value={noticeServedDate}
                      onChange={e => setNoticeServedDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                    />
                    <p className="text-[11px] text-[var(--text-muted)]">The 15-day cure clock begins upon receipt of notice.</p>
                  </div>
                </div>
              </div>

              {/* Procedural Timelines Roadmap */}
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FF9933]" /> Mandatory Statutory Timeline Windows
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl border border-amber-800/40 bg-amber-950/20 space-y-1">
                    <span className="text-xs font-bold text-amber-400">Step 1: 15-Day Cure Window</span>
                    <p className="text-lg font-black text-[var(--text-primary)]">{chequeData.cureDateStr}</p>
                    <p className="text-xs text-[var(--text-muted)]">Drawer must pay before this date. No criminal offence exists until this period expires.</p>
                  </div>

                  <div className="p-4 rounded-2xl border border-red-800/40 bg-red-950/20 space-y-1">
                    <span className="text-xs font-bold text-red-400">Step 2: 30-Day Court Filing Deadline</span>
                    <p className="text-lg font-black text-[var(--text-primary)]">{chequeData.filingDateStr}</p>
                    <p className="text-xs text-[var(--text-muted)]">Criminal complaint under Sec 142 NI Act must be filed before the Magistrate before this deadline.</p>
                  </div>
                </div>
              </div>

              {/* Citizen Information Guide */}
              <div className="bg-blue-950/20 border border-blue-800/40 rounded-3xl p-6 space-y-2 text-xs text-[var(--text-muted)]">
                <h4 className="font-bold text-blue-400 text-sm flex items-center gap-2">
                  <Info className="w-4 h-4" /> Section 143A Interim Compensation Power
                </h4>
                <p className="leading-relaxed">
                  Under Section 143A introduced to the NI Act, the Trial Court is empowered to order the accused drawer to deposit up to <strong>20% of the cheque amount (₹{chequeData.interimComp.toLocaleString('en-IN')})</strong> as interim compensation to the complainant within 60 days of framing charges.
                </p>
              </div>
            </div>

            {/* Right Summary Column */}
            <div className="space-y-6">
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 shadow-sm sticky top-24 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                  <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Statutory Exposure</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-[#FF9933]/15 text-[#FF9933] font-bold">NI Act 1881</span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-muted)]">Cheque Amount:</span>
                    <span className="font-bold text-[var(--text-primary)]">₹{chequeAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-muted)]">Sec 143A Interim Deposit (20%):</span>
                    <span className="font-bold text-amber-400">₹{chequeData.interimComp.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-muted)]">Max Imprisonment Term:</span>
                    <span className="font-bold text-red-400">Up to 2 Years</span>
                  </div>
                  <div className="pt-3 border-t border-[var(--border)] flex justify-between items-baseline">
                    <span className="text-sm font-bold text-[var(--text-primary)]">Max Fine Penalty (2x):</span>
                    <span className="text-2xl font-black text-[#FF9933]">
                      ₹{chequeData.maxFine.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    onClick={handleCopySummary}
                    className="w-full py-3 bg-[#FF9933] hover:bg-orange-600 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <Copy className="w-4 h-4" /> Copy Calculation Summary
                  </button>
                  <Link
                    href="/document-generator"
                    className="w-full py-2.5 bg-[var(--background)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-primary)] font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#FF9933]" /> Draft Cheque Demand Notice <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: RERA DELAY COMPENSATION CALCULATOR                                 */}
        {/* ========================================================================= */}
        {activeTab === 'rera' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">Builder Possession Delay Details</h2>
                  <p className="text-xs text-[var(--text-muted)]">Statutory compensation under Section 18 of Real Estate (Regulation & Development) Act 2016.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-[var(--text-muted)] block">Total Consideration Paid to Builder (₹)</label>
                    <input
                      type="number"
                      value={propertyPaidAmount}
                      onChange={e => setPropertyPaidAmount(Math.max(1000, Number(e.target.value)))}
                      className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-lg font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                      placeholder="e.g. 5000000"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-muted)] block">Months of Possession Delay</label>
                    <input
                      type="number"
                      value={delayMonths}
                      onChange={e => setDelayMonths(Math.max(1, Number(e.target.value)))}
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                    />
                    <p className="text-[11px] text-[var(--text-muted)]">Calculated from promised date in agreement till date.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-muted)] block">Applicable RERA Interest Rate (% p.a.)</label>
                    <input
                      type="number"
                      step="0.25"
                      value={reraInterestRate}
                      onChange={e => setReraInterestRate(Math.max(1, Number(e.target.value)))}
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                    />
                    <p className="text-[11px] text-[var(--text-muted)]">Prescribed as SBI Highest MCLR + 2% (approx 10.75%).</p>
                  </div>
                </div>
              </div>

              {/* RERA Section 18 Rights Card */}
              <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-3xl p-6 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                  <h3 className="font-bold text-sm">Allottee Rights under Section 18 of RERA</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[var(--text-muted)]">
                  <div className="p-3 rounded-xl border border-emerald-800/30 bg-emerald-900/10 space-y-1">
                    <span className="font-bold text-emerald-400 block">Option 1: Continue in Project</span>
                    <p>You are entitled to monthly compensation interest (₹{monthlyReraCompensation.toLocaleString('en-IN')}/mo) for every month of delay until the builder hands over possession with valid Occupancy Certificate (OC).</p>
                  </div>
                  <div className="p-3 rounded-xl border border-emerald-800/30 bg-emerald-900/10 space-y-1">
                    <span className="font-bold text-emerald-400 block">Option 2: Complete Refund & Exit</span>
                    <p>You can withdraw from the project and demand a 100% full refund of all amounts paid (₹{propertyPaidAmount.toLocaleString('en-IN')}) PLUS accumulated interest of ₹{totalReraCompensation.toLocaleString('en-IN')}.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Summary Column */}
            <div className="space-y-6">
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 shadow-sm sticky top-24 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                  <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Compensation Tally</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-[#FF9933]/15 text-[#FF9933] font-bold">RERA Sec 18</span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-muted)]">Principal Paid:</span>
                    <span className="font-bold text-[var(--text-primary)]">₹{propertyPaidAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-muted)]">Delay Period:</span>
                    <span className="font-bold text-[var(--text-primary)]">{delayMonths} Months</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-muted)]">Monthly Delay Penalty:</span>
                    <span className="font-bold text-amber-400">₹{monthlyReraCompensation.toLocaleString('en-IN')}/mo</span>
                  </div>
                  <div className="pt-3 border-t border-[var(--border)] flex justify-between items-baseline">
                    <span className="text-sm font-bold text-[var(--text-primary)]">Total Accumulated Interest:</span>
                    <span className="text-2xl font-black text-[#FF9933]">
                      ₹{totalReraCompensation.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    onClick={handleCopySummary}
                    className="w-full py-3 bg-[#FF9933] hover:bg-orange-600 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <Copy className="w-4 h-4" /> Copy RERA Claim Report
                  </button>
                  <Link
                    href="/chat"
                    className="w-full py-2.5 bg-[var(--background)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-primary)] font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    How to file RERA complaint? <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: GRATUITY SETTLEMENT CALCULATOR                                     */}
        {/* ========================================================================= */}
        {activeTab === 'gratuity' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">Employment & Salary Parameters</h2>
                  <p className="text-xs text-[var(--text-muted)]">Under Section 4(2) of the Payment of Gratuity Act 1972.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5 sm:col-span-3">
                    <label className="text-xs font-bold text-[var(--text-muted)] block">Last Drawn Basic Salary + Dearness Allowance (DA) (₹)</label>
                    <input
                      type="number"
                      value={basicSalary}
                      onChange={e => setBasicSalary(Math.max(100, Number(e.target.value)))}
                      className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-lg font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                      placeholder="e.g. 45000"
                    />
                    <p className="text-[11px] text-[var(--text-muted)]">Note: HRA, special allowances, and bonus are excluded by law.</p>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-[var(--text-muted)] block">Completed Years of Service</label>
                    <input
                      type="number"
                      value={yearsWorked}
                      onChange={e => setYearsWorked(Math.max(0, Number(e.target.value)))}
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-muted)] block">Additional Months</label>
                    <input
                      type="number"
                      max={11}
                      min={0}
                      value={extraMonths}
                      onChange={e => setExtraMonths(Math.min(11, Math.max(0, Number(e.target.value))))}
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                    />
                    <p className="text-[11px] text-[var(--text-muted)]">&ge;6 months counts as 1 full year.</p>
                  </div>
                </div>
              </div>

              {/* Statutory Legal Rules Box */}
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 shadow-sm space-y-3">
                <h3 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[#FF9933]" /> Statutory Gratuity Rules (1972 Act)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[var(--text-muted)]">
                  <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--background)] space-y-1">
                    <span className="font-bold text-[var(--text-primary)] block">5-Year Continuous Service:</span>
                    <p>Mandatory minimum tenure under Section 4(1). Exemption applies only in cases of employee demise or permanent disability.</p>
                  </div>
                  <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--background)] space-y-1">
                    <span className="font-bold text-[var(--text-primary)] block">30-Day Payment Mandate:</span>
                    <p>Under Section 7(3A), if employer fails to disburse gratuity within 30 days of leaving, simple interest at 10% per annum is payable.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Summary Column */}
            <div className="space-y-6">
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 shadow-sm sticky top-24 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                  <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Gratuity Payout</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-[#FF9933]/15 text-[#FF9933] font-bold">1972 Act</span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-muted)]">Eligibility Status:</span>
                    <span className={`font-bold text-xs ${isGratuityEligible ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isGratuityEligible ? 'Eligible (&ge; 5 Years)' : 'Not Eligible (< 5 Years)'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-muted)]">Qualifying Years Counted:</span>
                    <span className="font-bold text-[var(--text-primary)]">{roundedYears} Years</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-muted)]">Statutory Formula:</span>
                    <span className="font-mono text-xs text-[var(--text-muted)]">(15 × {basicSalary} × {roundedYears}) / 26</span>
                  </div>
                  <div className="pt-3 border-t border-[var(--border)] flex justify-between items-baseline">
                    <span className="text-sm font-bold text-[var(--text-primary)]">Total Gratuity Payable:</span>
                    <span className="text-2xl font-black text-[#FF9933]">
                      ₹{calculatedGratuity.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-400/90 pt-1">
                    ✓ 100% Tax-Exempt under Section 10(10) (Exemption limit is ₹20 Lakhs).
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleCopySummary}
                    className="w-full py-3 bg-[#FF9933] hover:bg-orange-600 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <Copy className="w-4 h-4" /> Copy Gratuity Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: MAINTENANCE & ALIMONY BENCHMARK                                   */}
        {/* ========================================================================= */}
        {activeTab === 'maintenance' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">Financial & Dependent Parameters</h2>
                  <p className="text-xs text-[var(--text-muted)]">Based on Supreme Court guidelines under Section 125 CrPC / Section 144 of BNSS 2023.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-[var(--text-muted)] block">Spouse Net Monthly In-Hand Income (₹)</label>
                    <input
                      type="number"
                      value={spouseNetSalary}
                      onChange={e => setSpouseNetSalary(Math.max(1000, Number(e.target.value)))}
                      className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-lg font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                      placeholder="e.g. 80000"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-muted)] block">Number of Dependent Children</label>
                    <select
                      value={numChildren}
                      onChange={e => setNumChildren(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                    >
                      <option value={0}>0 (Spouse only)</option>
                      <option value={1}>1 Child</option>
                      <option value={2}>2 Children</option>
                      <option value={3}>3+ Children</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-muted)] block">Claimant Current Monthly Income (if any) (₹)</label>
                    <input
                      type="number"
                      value={claimantIncome}
                      onChange={e => setClaimantIncome(Math.max(0, Number(e.target.value)))}
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                      placeholder="0 if unemployed"
                    />
                  </div>
                </div>
              </div>

              {/* Landmark Supreme Court Precedent */}
              <div className="bg-purple-950/20 border border-purple-800/40 rounded-3xl p-6 space-y-3">
                <div className="flex items-center gap-2 text-purple-400">
                  <Scale className="w-5 h-5" />
                  <h3 className="font-bold text-sm">Landmark Judicial Precedent</h3>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  In <em>Kalyan Dey Chowdhury v. Rita Dey Chowdhury Nee Dey (2017) 14 SCC 200</em>, the Supreme Court of India upheld that <strong>25% of the husband&apos;s net salary</strong> is a just and proper benchmark amount to be awarded as maintenance to the wife to ensure she maintains a similar standard of living as she enjoyed during marriage.
                </p>
                <div className="text-[11px] text-purple-300 pt-1">
                  Note: Courts consider statutory factors including health, liabilities, standard of living, and educational expenses of minor children.
                </div>
              </div>
            </div>

            {/* Right Summary Column */}
            <div className="space-y-6">
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 shadow-sm sticky top-24 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                  <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Judicial Benchmark</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-[#FF9933]/15 text-[#FF9933] font-bold">BNSS Sec 144</span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-muted)]">Net Salary Evaluated:</span>
                    <span className="font-bold text-[var(--text-primary)]">₹{spouseNetSalary.toLocaleString('en-IN')}/mo</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-muted)]">Benchmark Percentage:</span>
                    <span className="font-bold text-purple-400">{totalPct}% (Base 25% + Children)</span>
                  </div>
                  <div className="pt-3 border-t border-[var(--border)] flex justify-between items-baseline">
                    <span className="text-sm font-bold text-[var(--text-primary)]">Estimated Maintenance:</span>
                    <span className="text-2xl font-black text-[#FF9933]">
                      ₹{estimatedMaintenance.toLocaleString('en-IN')}<span className="text-xs font-normal text-[var(--text-muted)]">/mo</span>
                    </span>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    onClick={handleCopySummary}
                    className="w-full py-3 bg-[#FF9933] hover:bg-orange-600 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <Copy className="w-4 h-4" /> Copy Alimony Summary
                  </button>
                  <Link
                    href="/consultation"
                    className="w-full py-2.5 bg-[var(--background)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-primary)] font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    Consult Senior Matrimonial Specialist <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
