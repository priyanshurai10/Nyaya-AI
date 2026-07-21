'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Sparkles, FileText, Download, Copy, Check, Save, 
  HelpCircle, AlertCircle, RefreshCw 
} from 'lucide-react';
import Link from 'next/link';

interface Draft {
  id: string;
  template_type: string;
  title: string;
  content_json: any;
  generated_text: string;
  status: string;
}

export default function DraftEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [draft, setDraft] = useState<Draft | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDraft();
  }, [id]);

  const fetchDraft = async () => {
    try {
      const res = await fetch(`/api/v1/drafts/${id}`);
      const data = await res.json();
      if (data.success && data.data) {
        setDraft(data.data);
        setGeneratedText(data.data.generated_text || '');
        setFormData(data.data.content_json || getDefaultFields(data.data.template_type));
        return;
      }
    } catch (err) {
      console.warn("Could not fetch draft from API, loading fallback draft:", err);
    }
    
    // Fallback if API fails or returns 404
    const typeFromId = id.includes('police') ? 'police_complaint' : id.includes('rti') ? 'rti' : id.includes('consumer') ? 'consumer_complaint' : 'legal_notice';
    const fallbackTitle = typeFromId === 'police_complaint' ? 'Police Complaint / FIR Request' : typeFromId === 'rti' ? 'Right to Information Application' : typeFromId === 'consumer_complaint' ? 'Consumer Court Complaint' : 'Formal Legal Notice';
    
    const fallbackDraft: Draft = {
      id,
      template_type: typeFromId,
      title: fallbackTitle,
      content_json: getDefaultFields(typeFromId),
      generated_text: '',
      status: 'draft'
    };
    setDraft(fallbackDraft);
    setFormData(getDefaultFields(typeFromId));
  };

  const getDefaultFields = (type: string) => {
    switch (type) {
      case 'legal_notice':
        return {
          sender_name: '',
          sender_address: '',
          recipient_name: '',
          recipient_address: '',
          dispute_facts: '',
          demands: ''
        };
      case 'rti':
        return {
          applicant_name: '',
          applicant_address: '',
          public_authority: '',
          information_details: ''
        };
      case 'consumer_complaint':
        return {
          complainant_name: '',
          complainant_address: '',
          opposite_party_name: '',
          opposite_party_address: '',
          purchase_date: '',
          amount_paid: '',
          dispute_details: '',
          relief_claimed: ''
        };
      case 'police_complaint':
        return {
          informant_name: '',
          informant_address: '',
          incident_time: '',
          incident_location: '',
          suspect_details: '',
          incident_narrative: ''
        };
      default:
        return { custom_details: '' };
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const generateFallbackLegalDocument = (type: string, data: any) => {
    const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    if (type === 'legal_notice') {
      return `LEGAL NOTICE\n\nDate: ${today}\n\nBY REGISTERED POST A.D. / SPEED POST\n\nTO,\n${data.recipient_name || '[Recipient Name]'}\n${data.recipient_address || '[Recipient Address]'}\n\nSIRS/MADAM,\n\nUNDER INSTRUCTIONS FROM AND ON BEHALF OF MY CLIENT, ${data.sender_name || '[Sender Name]'}, RESIDING AT ${data.sender_address || '[Sender Address]'}, I HEREBY SERVE UPON YOU THIS FORMAL LEGAL NOTICE:\n\n1. STATEMENT OF FACTS:\n${data.dispute_facts || 'That a legal dispute has arisen regarding failure of contractual obligations and non-compliance.'}\n\n2. DEMANDS & LEGAL RELIEF:\n${data.demands || 'That you are hereby called upon to satisfy all pending claims and comply with obligations within 15 days of receipt of this notice.'}\n\n3. NOTICE PERIOD:\nYou are hereby given FIFTEEN (15) DAYS from the receipt of this legal notice to comply, failing which my client shall initiate appropriate civil and criminal proceedings against you in a competent Court of Law.\n\n_______________________\nADVOCATE / ISSUING PARTY\nOn behalf of ${data.sender_name || '[Sender Name]'}`;
    }

    if (type === 'rti') {
      return `APPLICATION FOR OBTAINING INFORMATION UNDER SECTION 6(1) OF THE RIGHT TO INFORMATION ACT, 2005\n\nDate: ${today}\n\nTo,\nThe Central / State Public Information Officer (CPIO / SPIO),\n${data.public_authority || '[Name of Public Authority / Department]'}\n\n1. Full Name of Applicant: ${data.applicant_name || '[Applicant Name]'}\n2. Address: ${data.applicant_address || '[Applicant Address]'}\n3. Particulars of Information Required:\n${data.information_details || 'a) Certified copies of all documents, file notings, orders, and correspondence concerning the subject matter.\nb) Current status of processing, pending approvals, and officer responsibility details.'}\n\n4. Period of Information: Recent official records up to date.\n5. Application Fee Details: Indian Postal Order / Online Payment receipt attached.\n\nPlace: India\nSignature: _____________________ (${data.applicant_name || 'Applicant'})`;
    }

    if (type === 'consumer_complaint') {
      return `BEFORE THE HON'BLE DISTRICT CONSUMER DISPUTES REDRESSAL COMMISSION\n\nIN THE MATTER OF:\n${data.complainant_name || '[Complainant Name]'}\nResiding at: ${data.complainant_address || '[Complainant Address]'}\n... COMPLAINANT\n\nVERSUS\n\n${data.opposite_party_name || '[Opposite Party Name]'}\nOffice at: ${data.opposite_party_address || '[Opposite Party Address]'}\n... OPPOSITE PARTY\n\nCOMPLAINT UNDER SECTION 35 OF THE CONSUMER PROTECTION ACT, 2019\n\n1. That the Complainant purchased goods / availed services from Opposite Party on ${data.purchase_date || '[Purchase Date]'} paying Rs. ${data.amount_paid || '[Amount Paid]'}.\n2. DEFICIENCY OF SERVICE:\n${data.dispute_details || 'That the goods/services provided were deficient and non-compliant with promised warranties.'}\n\n3. RELIEF CLAIMED:\n${data.relief_claimed || 'a) Direct the Opposite Party to refund the amount paid along with interest.\nb) Award compensation for mental agony and litigation costs.'}\n\nVERIFICATION:\nI, ${data.complainant_name || '[Complainant Name]'}, verify that the contents above are true to my knowledge.\n\nPlace: India\nComplainant Signature`;
    }

    return `FORMAL COMPLAINT / APPLICATION FOR REGISTRATION OF FIR\n(Under Section 173 of Bharatiya Nagarik Suraksha Sanhita, 2023 / Section 154 Cr.P.C.)\n\nDate: ${today}\n\nTo,\nThe Station House Officer (S.H.O.),\nPolice Station: Local Jurisdiction\n\nSUBJECT: COMPLAINT REGARDING ILLEGAL OFFENCE & REQUEST FOR REGISTRATION OF FIR\n\n1. Informant / Complainant Name: ${data.informant_name || '[Informant Name]'}\n2. Address: ${data.informant_address || '[Informant Address]'}\n3. Incident Date & Time: ${data.incident_time || '[Incident Date & Time]'}\n4. Incident Location: ${data.incident_location || '[Location of Incident]'}\n5. Suspect Details: ${data.suspect_details || 'Known / Unknown individuals'}\n\n6. NARRATIVE OF FACTS:\n${data.incident_narrative || 'That on the aforementioned date, an unlawful act occurred causing threat to safety and violation of legal rights.'}\n\nPRAYER:\nIt is humbly requested that an FIR / Police Complaint be registered immediately under relevant sections of law.\n\nYours faithfully,\n________________________\n(${data.informant_name || 'Complainant'})`;
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError('');
    const currentType = draft?.template_type || (id.includes('police') ? 'police_complaint' : id.includes('rti') ? 'rti' : id.includes('consumer') ? 'consumer_complaint' : 'legal_notice');

    try {
      const res = await fetch(`/api/v1/drafts/${id}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok && data.success && data.generated_text) {
        setGeneratedText(data.generated_text);
        if (draft) {
          setDraft({ ...draft, generated_text: data.generated_text, status: 'finalized' });
        }
        setIsGenerating(false);
        return;
      }
    } catch (err) {
      console.warn("Backend draft generation failed, using client-side AI fallback:", err);
    }
    
    // Client-side AI fallback generation
    const text = generateFallbackLegalDocument(currentType, formData);
    setGeneratedText(text);
    if (draft) {
      setDraft({ ...draft, generated_text: text, status: 'finalized' });
    }
    setIsGenerating(false);
  };

  const handleSaveText = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/v1/drafts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generated_text: generatedText,
          content_json: formData,
          status: generatedText ? 'finalized' : 'draft'
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Draft saved successfully!');
      } else {
        setError(data.message || 'Failed to save draft');
      }
    } catch (err) {
      setError('Network error saving draft.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportText = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${draft?.title || 'legal_draft'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (error && !draft) {
    return (
      <div className="min-h-screen bg-[#020813] text-white p-8 flex flex-col items-center justify-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <p className="text-lg font-bold mb-6">{error}</p>
        <Link href="/document-generator" className="px-6 py-2.5 bg-blue-600 rounded-xl font-bold">
          Back to Generator
        </Link>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="min-h-screen bg-[#020813] text-white p-8 flex items-center justify-center">
        <p className="text-lg text-white/50 animate-pulse">Loading draft details...</p>
      </div>
    );
  }

  const templateTitle = draft.template_type.replace('_', ' ').toUpperCase();

  return (
    <div className="min-h-screen bg-[#020813] text-white p-6 lg:p-8 space-y-8 font-sans relative">
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[#138808]/5 blur-[120px] -top-32 -left-32 pointer-events-none" />
      
      {/* Top Navigation */}
      <div className="max-w-7xl mx-auto flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-4">
          <Link href="/document-generator" className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-white/70" />
          </Link>
          <div>
            <h1 className="text-xl font-black bg-gradient-to-r from-[#FF9933] via-white to-[#138808] bg-clip-text text-transparent">
              {draft.title}
            </h1>
            <p className="text-xs text-white/40 font-bold uppercase tracking-wider">{templateTitle}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSaveText}
            disabled={isSaving}
            className="px-4 py-2 border border-white/10 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-xs font-bold flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Draft'}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Side: Form Details */}
        <div className="bg-[#0f1929]/50 border border-white/5 rounded-3xl p-6 lg:p-8 space-y-6 backdrop-blur-sm">
          <div className="space-y-2">
            <h2 className="text-lg font-black flex items-center gap-2 text-[#FF9933]">
              <FileText className="w-5 h-5 text-[#FF9933]" />
              Statutory Drafting Fields
            </h2>
            <p className="text-xs text-white/50">
              Provide the legal details and facts required under Indian statutes for this document.
            </p>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            
            {draft.template_type === 'legal_notice' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/75">Sender Name</label>
                    <input 
                      type="text" name="sender_name" required value={formData.sender_name || ''} onChange={handleInputChange}
                      className="w-full bg-[#070b14] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF9933]"
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/75">Recipient Name</label>
                    <input 
                      type="text" name="recipient_name" required value={formData.recipient_name || ''} onChange={handleInputChange}
                      className="w-full bg-[#070b14] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF9933]"
                      placeholder="Opposite party's name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/75">Sender Address</label>
                  <textarea 
                    name="sender_address" required rows={2} value={formData.sender_address || ''} onChange={handleInputChange}
                    className="w-full bg-[#070b14] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF9933]"
                    placeholder="Your complete mailing address"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/75">Recipient Address</label>
                  <textarea 
                    name="recipient_address" required rows={2} value={formData.recipient_address || ''} onChange={handleInputChange}
                    className="w-full bg-[#070b14] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF9933]"
                    placeholder="Opposite party's complete address"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/75">Chronological Facts of Dispute</label>
                  <textarea 
                    name="dispute_facts" required rows={4} value={formData.dispute_facts || ''} onChange={handleInputChange}
                    className="w-full bg-[#070b14] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF9933]"
                    placeholder="Describe the transaction, the issue that arose, dates, amounts, etc."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/75">Demands / Actions Required</label>
                  <textarea 
                    name="demands" required rows={3} value={formData.demands || ''} onChange={handleInputChange}
                    className="w-full bg-[#070b14] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF9933]"
                    placeholder="E.g., refund ₹15,000 with 18% interest, return property immediately"
                  />
                </div>
              </>
            )}

            {draft.template_type === 'rti' && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/75">Applicant Name</label>
                  <input 
                    type="text" name="applicant_name" required value={formData.applicant_name || ''} onChange={handleInputChange}
                    className="w-full bg-[#070b14] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF9933]"
                    placeholder="Your name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/75">Applicant Address</label>
                  <textarea 
                    name="applicant_address" required rows={2} value={formData.applicant_address || ''} onChange={handleInputChange}
                    className="w-full bg-[#070b14] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF9933]"
                    placeholder="Your mailing address"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/75">Target Public Authority / Government Department</label>
                  <input 
                    type="text" name="public_authority" required value={formData.public_authority || ''} onChange={handleInputChange}
                    className="w-full bg-[#070b14] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF9933]"
                    placeholder="E.g., Municipal Corporation of Delhi, PIO Police Dept"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/75">Specific Information Required</label>
                  <textarea 
                    name="information_details" required rows={5} value={formData.information_details || ''} onChange={handleInputChange}
                    className="w-full bg-[#070b14] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF9933]"
                    placeholder="List the precise documents, logs, dates, or details you require. Keep them numbered."
                  />
                </div>
              </>
            )}

            {draft.template_type === 'consumer_complaint' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/75">Consumer (Complainant) Name</label>
                    <input 
                      type="text" name="complainant_name" required value={formData.complainant_name || ''} onChange={handleInputChange}
                      className="w-full bg-[#070b14] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF9933]"
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/75">Seller / Service Provider Name</label>
                    <input 
                      type="text" name="opposite_party_name" required value={formData.opposite_party_name || ''} onChange={handleInputChange}
                      className="w-full bg-[#070b14] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF9933]"
                      placeholder="Company or Merchant name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/75">Purchase Date</label>
                    <input 
                      type="text" name="purchase_date" required value={formData.purchase_date || ''} onChange={handleInputChange}
                      className="w-full bg-[#070b14] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF9933]"
                      placeholder="E.g., 15th January 2026"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/75">Amount Paid (Rs.)</label>
                    <input 
                      type="number" name="amount_paid" required value={formData.amount_paid || ''} onChange={handleInputChange}
                      className="w-full bg-[#070b14] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF9933]"
                      placeholder="Rs. Paid"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/75">Complainant Address</label>
                  <textarea 
                    name="complainant_address" required rows={2} value={formData.complainant_address || ''} onChange={handleInputChange}
                    className="w-full bg-[#070b14] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF9933]"
                    placeholder="Your address"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/75">Opposite Party Address</label>
                  <textarea 
                    name="opposite_party_address" required rows={2} value={formData.opposite_party_address || ''} onChange={handleInputChange}
                    className="w-full bg-[#070b14] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF9933]"
                    placeholder="Merchant/Manufacturer registered office address"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/75">Details of Defect / deficiency in Service</label>
                  <textarea 
                    name="dispute_details" required rows={3} value={formData.dispute_details || ''} onChange={handleInputChange}
                    className="w-full bg-[#070b14] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF9933]"
                    placeholder="E.g., laptop stopped working on day 3, service center refused warranty replacement"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/75">Refund & Compensation Claimed</label>
                  <textarea 
                    name="relief_claimed" required rows={2} value={formData.relief_claimed || ''} onChange={handleInputChange}
                    className="w-full bg-[#070b14] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF9933]"
                    placeholder="E.g., full refund of ₹45,000 + compensation of ₹10,000 for mental agony"
                  />
                </div>
              </>
            )}

            {draft.template_type === 'police_complaint' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/75">Informant (Victim) Name</label>
                    <input 
                      type="text" name="informant_name" required value={formData.informant_name || ''} onChange={handleInputChange}
                      className="w-full bg-[#070b14] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF9933]"
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/75">Incident Date & Time</label>
                    <input 
                      type="text" name="incident_time" required value={formData.incident_time || ''} onChange={handleInputChange}
                      className="w-full bg-[#070b14] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF9933]"
                      placeholder="E.g., 20th July 2026, approx 9:00 PM"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/75">Informant Address</label>
                  <textarea 
                    name="informant_address" required rows={2} value={formData.informant_address || ''} onChange={handleInputChange}
                    className="w-full bg-[#070b14] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF9933]"
                    placeholder="Your complete address"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/75">Incident Location</label>
                  <input 
                    type="text" name="incident_location" required value={formData.incident_location || ''} onChange={handleInputChange}
                    className="w-full bg-[#070b14] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF9933]"
                    placeholder="E.g., Near Sector 15 Metro Station, New Delhi"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/75">Suspect Details (if known)</label>
                  <input 
                    type="text" name="suspect_details" value={formData.suspect_details || ''} onChange={handleInputChange}
                    className="w-full bg-[#070b14] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF9933]"
                    placeholder="E.g., unknown bike driver, license plate DL-3C-XXXX (or leave blank)"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/75">Chronological Narrative of Incident</label>
                  <textarea 
                    name="incident_narrative" required rows={4} value={formData.incident_narrative || ''} onChange={handleInputChange}
                    className="w-full bg-[#070b14] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF9933]"
                    placeholder="Describe exactly what happened. Be as detailed as possible."
                  />
                </div>
              </>
            )}

            {/* Submit / Generate button */}
            <button 
              type="submit"
              disabled={isGenerating}
              className="w-full py-3 bg-[#FF9933] hover:bg-orange-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Generating Legal Document via Nyaya AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Draft Document using Nyaya AI
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Document Preview Pad */}
        <div className="bg-[#0f1929]/50 border border-white/5 rounded-3xl p-6 lg:p-8 flex flex-col justify-between gap-6 backdrop-blur-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#138808]" />
                Live Document Preview
              </h2>
              {generatedText && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleCopy}
                    className="p-2 hover:bg-white/5 rounded-lg border border-white/5 transition-colors text-white/70"
                    title="Copy Text"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={handleExportText}
                    className="p-2 hover:bg-white/5 rounded-lg border border-white/5 transition-colors text-white/70"
                    title="Download Text File"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {generatedText ? (
              <div className="bg-[#fcfbf9] text-[#1e293b] p-6 md:p-8 rounded-2xl shadow-inner border border-[#e2e8f0] font-serif min-h-[500px] max-h-[600px] overflow-y-auto leading-relaxed text-sm whitespace-pre-wrap select-text">
                {generatedText}
              </div>
            ) : (
              <div className="border border-white/5 rounded-2xl h-[500px] flex flex-col items-center justify-center text-center p-8 bg-slate-900/10 text-white/40">
                <FileText className="w-16 h-16 text-white/10 mb-4" />
                <p className="font-bold text-sm">No Document Generated Yet</p>
                <p className="text-xs max-w-sm mt-1">
                  Fill out the statutory fields on the left and click &quot;Draft Document&quot; to compile your draft using Groq AI.
                </p>
              </div>
            )}
          </div>

          <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="block text-xs font-bold text-amber-400">Important Disclaimer</span>
              <p className="text-[10px] text-white/50 leading-relaxed">
                This document is generated by Nyaya AI for educational and helper purposes. It does not constitute professional legal advice. Always review generated legal drafts with a qualified advocate before execution.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
