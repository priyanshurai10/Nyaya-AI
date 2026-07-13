'use client';

import Link from 'next/link';
import { 
  FileText, ArrowRight, ShieldAlert, BadgeCheck, FileSignature, 
  HelpCircle, Scale, AlertCircle, Sparkles, Send, Mail
} from 'lucide-react';

interface DocumentTemplate {
  id: string;
  title: string;
  statute: string;
  cost: string;
  timeLimit: string;
  dispatchMethod: string;
  description: string;
  steps: string[];
  link: string;
  iconColor: string;
  bgColor: string;
}

const templates: DocumentTemplate[] = [
  {
    id: 'legal_notice',
    title: 'Formal Legal Notice',
    statute: 'Section 80 of Code of Civil Procedure (CPC) / Indian Contract Act',
    cost: 'Free to draft on Nyaya AI (Private lawyer notice fees range ₹1,500 - ₹10,000)',
    timeLimit: 'Typically gives 15 to 30 days for recipient to respond',
    dispatchMethod: 'Registered Post with Acknowledgement Due (RPAD) or Speed Post',
    description: 'A formal legal notice is a warning statement served to a respondent before filing a civil lawsuit. It sets out the facts, grievances, and demands.',
    steps: [
      'Fill out the notice generator with recipient details and specific facts',
      'Print the generated draft on a clean white paper',
      'Sign the document at the bottom of each page',
      'Send via Registered Post AD and secure the postal receipt code'
    ],
    link: '/drafts?template=legal_notice',
    iconColor: 'text-[#FF9933]',
    bgColor: 'bg-[#FF9933]/5 border-[#FF9933]/15'
  },
  {
    id: 'rti',
    title: 'Right to Information (RTI) Request',
    statute: 'Section 6(1) of the Right to Information Act, 2005',
    cost: '₹10 standard application fee (Free for BPL category applicants)',
    timeLimit: 'PIO must reply within 30 days (48 hours if life and liberty is involved)',
    dispatchMethod: 'Speed Post or hand delivery to Public Information Officer (PIO)',
    description: 'An RTI application allows any citizen of India to request official records, survey reports, or progress information from public authorities and government departments.',
    steps: [
      'State the precise details of information you require',
      'Enclose a ₹10 Indian Postal Order (IPO) or Court Fee stamp',
      'Send the petition to the PIO of the target department',
      'If reply is not received in 30 days, file the First Appeal'
    ],
    link: '/drafts?template=rti',
    iconColor: 'text-[#138808]',
    bgColor: 'bg-[#138808]/5 border-[#138808]/15'
  },
  {
    id: 'consumer_complaint',
    title: 'Consumer Court Complaint',
    statute: 'Section 35 of the Consumer Protection Act, 2019',
    cost: 'Free for claims up to ₹5 Lakhs; nominal slab fee for higher claims',
    timeLimit: 'Must be filed within 2 years of the defect or dispute date',
    dispatchMethod: 'File online via e-Daakhil portal or submit in-person in triplicate',
    description: 'File a formal petition before the Consumer Disputes Redressal Commission for defective products, service deficiencies, or unfair trade practices.',
    steps: [
      'Draft the complaint including purchase invoices and defect reports',
      'State the compensation amount and refund requested clearly',
      'Upload file details onto the e-Daakhil website (edaakhil.nic.in)',
      'Serve copies to the opposite parties via registered post'
    ],
    link: '/drafts?template=consumer_complaint',
    iconColor: 'text-[#00d2ff]',
    bgColor: 'bg-[#00d2ff]/5 border-[#00d2ff]/15'
  },
  {
    id: 'police_complaint',
    title: 'Police Incident Report / Complaint',
    statute: 'Section 173 of Bharatiya Nagarik Suraksha Sanhita (BNSS) / CrPC',
    cost: 'Absolutely free of charge',
    timeLimit: 'File immediately after the incident to ensure evidence preservation',
    dispatchMethod: 'Submit in duplicate at the local Police Station or Cyber Cell',
    description: 'A formal letter reporting criminal offenses (theft, assault, cyber scams) to local police authorities. Used to request the registration of an FIR.',
    steps: [
      'Draft the chronology of events, date, time, and suspect details',
      'Submit the report at the police station desk',
      'Obtain a signed copy of the complaint with the official police stamp (GD Entry)',
      'Request a free copy of the First Information Report (FIR) if registered'
    ],
    link: '/drafts?template=police_complaint',
    iconColor: 'text-purple-400',
    bgColor: 'bg-purple-500/5 border-purple-500/15'
  }
];

export default function DocumentGeneratorPage() {
  return (
    <div className="min-h-screen bg-[#020813] text-white p-6 space-y-8 font-sans relative">
      
      {/* Background glow auror */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[#138808]/5 blur-[120px] -top-32 -left-32 pointer-events-none" />

      {/* Header */}
      <div className="border-b border-white/5 pb-4 space-y-2">
        <div className="flex items-center gap-2 text-xs font-black uppercase text-[#FF9933]">
          <Sparkles size={14} className="animate-pulse" />
          <span>Statutory Templates Console</span>
        </div>
        <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-[#FF9933] via-white to-[#138808] bg-clip-text text-transparent">
          Document Generator & Drafting Hub
        </h1>
        <p className="text-xs text-white/50 max-w-3xl">
          Create legally compliant notice drafts, RTI requests, and complaints structured according to Indian codes and statutes.
        </p>
      </div>

      {/* Templates grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {templates.map(tpl => (
          <div 
            key={tpl.id}
            className={`p-6 rounded-3xl border flex flex-col justify-between gap-6 backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] ${tpl.bgColor}`}
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-base font-black text-white">{tpl.title}</h2>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">{tpl.statute}</p>
                </div>
                <div className={`p-2.5 rounded-2xl bg-white dark:bg-[#111827]/5 shrink-0 ${tpl.iconColor}`}>
                  <FileText size={20} />
                </div>
              </div>

              <p className="text-xs text-white/70 leading-relaxed font-semibold">
                {tpl.description}
              </p>

              {/* Statutory details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px] text-white/50 bg-white dark:bg-[#111827]/[0.01] border border-white/5 p-4 rounded-2xl">
                <div className="space-y-0.5">
                  <span className="block text-white/35 font-bold uppercase">Estimated Fee</span>
                  <span className="font-semibold text-white/80">{tpl.cost}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="block text-white/35 font-bold uppercase">Time Limit</span>
                  <span className="font-semibold text-white/80">{tpl.timeLimit}</span>
                </div>
                <div className="space-y-0.5 sm:col-span-2 pt-2 border-t border-white/5">
                  <span className="block text-white/35 font-bold uppercase">Dispatch Method</span>
                  <span className="font-semibold text-white/80 flex items-center gap-1">
                    <Send size={10} className="text-[#00d2ff]" />
                    {tpl.dispatchMethod}
                  </span>
                </div>
              </div>

              {/* Action Steps */}
              <div className="space-y-2 pt-2">
                <h4 className="text-[10px] uppercase font-black text-white/40 tracking-wider">Dispatch Checklist Guidelines</h4>
                <ol className="space-y-2">
                  {tpl.steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-[11px] text-white/60">
                      <span className="w-4 h-4 rounded-full bg-white dark:bg-[#111827]/5 text-white/40 border border-white/10 flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href={tpl.link}
                className="w-full py-3 bg-white dark:bg-[#111827]/5 hover:bg-white dark:bg-[#111827]/10 border border-white/10 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all group"
              >
                <span>Generate Interactive Draft</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Advisory Alert notice */}
      <div className="p-5 rounded-3xl bg-amber-500/5 border border-amber-500/15 flex gap-4 max-w-4xl">
        <AlertCircle size={20} className="text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-amber-400">Disclaimer & Statutory Advisory</h4>
          <p className="text-[10px] text-white/50 leading-relaxed">
            The document generator logs template outlines based on standard Indian legal procedures. These drafts do not constitute formal legal advice. For high-stakes litigation, we strongly recommend consulting a verified advocate through our <strong>Advocate Discovery</strong> portal.
          </p>
        </div>
      </div>

    </div>
  );
}
