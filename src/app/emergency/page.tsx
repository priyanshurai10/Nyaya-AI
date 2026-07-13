'use client';

import { useState } from 'react';
import Link from 'next/link';

interface EmergencyCategory {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
}

const categories: EmergencyCategory[] = [
  { id: 'women-safety', icon: '🚨', title: 'Women Safety', subtitle: 'Immediate help for women in danger' },
  { id: 'cyber-crime', icon: '💻', title: 'Cyber Crime', subtitle: 'Online fraud, hacking, harassment' },
  { id: 'police-encounter', icon: '👮', title: 'Police Encounter Guide', subtitle: 'Know your rights during police interaction' },
  { id: 'arrest-rights', icon: '⛓', title: 'Arrest Rights Guide', subtitle: 'What to do if arrested' },
  { id: 'senior-citizen', icon: '👴', title: 'Senior Citizen Legal Help', subtitle: 'Legal assistance for elderly' },
];

function WomenSafetyDetail() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Emergency Numbers */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
          📞 Emergency Numbers
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { number: '112', label: 'National Emergency' },
            { number: '1091', label: 'Women Helpline' },
            { number: '181', label: 'Women Helpline (Alt)' },
            { number: '1098', label: 'Child Helpline' },
          ].map((item) => (
            <div key={item.number} className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-red-400">{item.number}</div>
              <div className="text-xs text-gray-400 dark:text-white/40 mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Rights */}
      <div className="bg-white dark:bg-[#111827]/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
        <h3 className="text-lg font-bold text-[#FF9933] mb-4">⚖️ Your Rights</h3>
        <ul className="space-y-3">
          {[
            'Right to Zero FIR — File complaint at any police station regardless of jurisdiction',
            'Right to female police officer during interrogation',
            'Right to free legal aid under Legal Services Authorities Act',
            'Right to privacy — Identity cannot be disclosed publicly',
          ].map((right, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-1 w-5 h-5 rounded-full bg-[#138808]/20 text-[#138808] flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
              <span className="text-gray-300 text-sm">{right}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Immediate Steps */}
      <div className="bg-white dark:bg-[#111827]/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
        <h3 className="text-lg font-bold text-[#FF9933] mb-4">🏃‍♀️ Immediate Steps</h3>
        <ol className="space-y-3">
          {[
            'Move to a safe location immediately',
            'Call 112 or 1091 for emergency help',
            'Share live location with a trusted person',
            'Document injuries with photos if safe to do so',
            'Visit nearest police station to file Zero FIR',
            'Contact a legal aid lawyer (free under NALSA)',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-0.5 w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
              <span className="text-gray-300 text-sm">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Applicable Laws */}
      <div className="bg-white dark:bg-[#111827]/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
        <h3 className="text-lg font-bold text-[#FF9933] mb-4">📜 Applicable Laws</h3>
        <div className="space-y-3">
          {[
            { law: 'POSH Act, 2013', desc: 'Prevention of Sexual Harassment at Workplace' },
            { law: 'DV Act, 2005', desc: 'Protection of Women from Domestic Violence' },
            { law: 'IPC Section 354', desc: 'Assault or use of criminal force against women' },
            { law: 'IPC Section 376', desc: 'Punishment for rape' },
            { law: 'IPC Section 498A', desc: 'Cruelty by husband or relatives' },
          ].map((item) => (
            <div key={item.law} className="flex items-start gap-3 bg-white dark:bg-[#111827]/5 rounded-xl p-3">
              <span className="text-[#FF9933] font-mono text-sm font-bold whitespace-nowrap">{item.law}</span>
              <span className="text-gray-400 dark:text-white/40 text-sm">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Action */}
      <button className="w-full py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg shadow-red-500/20 hover:shadow-red-500/40 active:scale-[0.98]">
        📝 File Zero FIR Guide →
      </button>
    </div>
  );
}

function CyberCrimeDetail() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Report At */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-blue-400 mb-4">🌐 Report Cyber Crime</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
            <div className="text-lg font-bold text-blue-400">cybercrime.gov.in</div>
            <div className="text-xs text-gray-400 dark:text-white/40 mt-1">National Cyber Crime Portal</div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">1930</div>
            <div className="text-xs text-gray-400 dark:text-white/40 mt-1">Cyber Crime Helpline</div>
          </div>
        </div>
      </div>

      {/* Types of Cyber Crime */}
      <div className="bg-white dark:bg-[#111827]/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
        <h3 className="text-lg font-bold text-[#FF9933] mb-4">🔍 Types & Immediate Steps</h3>
        <div className="space-y-4">
          {[
            {
              type: '💳 Financial Fraud',
              steps: ['Call your bank immediately to freeze the account', 'Report on 1930 within 24 hours', 'File complaint on cybercrime.gov.in', 'Save all transaction details and screenshots'],
            },
            {
              type: '📱 Social Media Harassment',
              steps: ['Take screenshots of all harassment', 'Block the harasser', 'Report to platform', 'File FIR under IT Act Section 66A/67'],
            },
            {
              type: '🆔 Identity Theft',
              steps: ['Alert CIBIL and credit agencies', 'Change all passwords immediately', 'File FIR for identity theft', 'Monitor bank statements closely'],
            },
            {
              type: '🔓 Hacking',
              steps: ['Disconnect affected device from internet', 'Change passwords from a different device', 'Enable 2FA on all accounts', 'Report to CERT-IN'],
            },
          ].map((item) => (
            <div key={item.type} className="bg-white dark:bg-[#111827]/5 border border-white/10 rounded-xl p-4">
              <h4 className="font-bold text-white mb-2">{item.type}</h4>
              <ol className="space-y-1">
                {item.steps.map((step, i) => (
                  <li key={i} className="text-gray-400 dark:text-white/40 text-sm flex items-start gap-2">
                    <span className="text-blue-400 font-bold text-xs mt-0.5">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>

      {/* Evidence Preservation */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-amber-400 mb-4">🛡️ Evidence Preservation Guide</h3>
        <ul className="space-y-2">
          {[
            'Screenshot everything — messages, emails, transaction records',
            'Save URLs and web page archives (use archive.org)',
            'Note down IP addresses, phone numbers, email IDs used by perpetrators',
            'Preserve original emails with headers (don\'t forward, save as .eml)',
            'Record timestamps of all incidents',
            'Do NOT delete any communication with the fraudster',
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
              <span className="text-amber-400 mt-0.5">⚡</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PoliceEncounterDetail() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 8 Rights */}
      <div className="bg-white dark:bg-[#111827]/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
        <h3 className="text-lg font-bold text-[#FF9933] mb-4">⚖️ Your 8 Rights During Police Interaction</h3>
        <div className="space-y-3">
          {[
            { title: 'Right to Know', desc: 'Ask the reason for being stopped or detained' },
            { title: 'Right to Silence', desc: 'You cannot be forced to answer questions (Article 20(3))' },
            { title: 'Right to No Torture', desc: 'Police cannot use physical or mental torture' },
            { title: 'Right to Lawyer', desc: 'You can consult a lawyer before answering questions' },
            { title: 'Right to Dignity', desc: 'You must be treated with respect and dignity' },
            { title: 'Right to Medical Exam', desc: 'Request medical examination if injured' },
            { title: 'Right to Inform Family', desc: 'Police must inform your family of your detention' },
            { title: 'Right to Bail', desc: 'For bailable offences, bail is a right, not a privilege' },
          ].map((right, i) => (
            <div key={i} className="flex items-start gap-3 bg-white dark:bg-[#111827]/5 rounded-xl p-4">
              <span className="w-8 h-8 rounded-full bg-[#FF9933]/20 text-[#FF9933] flex items-center justify-center text-sm font-bold flex-shrink-0">{i + 1}</span>
              <div>
                <div className="font-semibold text-white text-sm">{right.title}</div>
                <div className="text-gray-400 dark:text-white/40 text-xs mt-0.5">{right.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Do's and Don'ts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#138808]/10 border border-[#138808]/30 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-[#138808] mb-4">✅ Do&apos;s</h3>
          <ul className="space-y-2">
            {[
              'Stay calm and composed',
              'Ask for officer\'s name & badge number',
              'Cooperate but know your limits',
              'Record the interaction if possible',
              'Ask for a written notice if summoned',
              'Call a lawyer immediately',
            ].map((item, i) => (
              <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                <span className="text-[#138808]">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-red-400 mb-4">❌ Don&apos;ts</h3>
          <ul className="space-y-2">
            {[
              'Don\'t resist physically',
              'Don\'t sign anything without reading',
              'Don\'t give bribes',
              'Don\'t argue or use abusive language',
              'Don\'t allow search without warrant',
              'Don\'t make statements without a lawyer',
            ].map((item, i) => (
              <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                <span className="text-red-400">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="bg-white dark:bg-[#111827]/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
        <h3 className="text-lg font-bold text-[#FF9933] mb-4">📞 Emergency Contacts</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { number: '112', label: 'Police Emergency' },
            { number: '100', label: 'Police Control Room' },
            { number: '15100', label: 'Anti-Corruption' },
            { number: 'NHRC', label: 'nhrc.nic.in' },
          ].map((item) => (
            <div key={item.number} className="bg-white dark:bg-[#111827]/5 border border-white/10 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-[#FF9933]">{item.number}</div>
              <div className="text-xs text-gray-400 dark:text-white/40 mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ArrestRightsDetail() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Constitutional Rights */}
      <div className="bg-[#FF9933]/10 border border-[#FF9933]/30 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-[#FF9933] mb-2">📜 Constitutional Rights — Article 22</h3>
        <p className="text-gray-400 dark:text-white/40 text-sm mb-4">Fundamental rights of every arrested person under the Indian Constitution</p>
        <ul className="space-y-3">
          {[
            'Right to be informed of the grounds of arrest',
            'Right to consult and be defended by a legal practitioner of choice',
            'Right to be produced before a Magistrate within 24 hours',
            'Right against detention beyond 24 hours without Magistrate\'s authority',
            'Right to be examined by a medical practitioner',
            'Right against self-incrimination (Article 20(3))',
          ].map((right, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-0.5 w-6 h-6 rounded-full bg-[#FF9933]/20 text-[#FF9933] flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
              <span className="text-gray-300 text-sm">{right}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Do's and Don'ts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#138808]/10 border border-[#138808]/30 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-[#138808] mb-4">✅ If Arrested — Do</h3>
          <ul className="space-y-2">
            {[
              'Remain calm and do not resist',
              'Ask for the arrest memo/warrant',
              'Demand to contact a lawyer immediately',
              'Ask for grounds of arrest in writing',
              'Request medical examination',
              'Remember you have right to silence',
              'Note the time of arrest',
            ].map((item, i) => (
              <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                <span className="text-[#138808]">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-red-400 mb-4">❌ If Arrested — Don&apos;t</h3>
          <ul className="space-y-2">
            {[
              'Don\'t sign blank papers',
              'Don\'t make any confession',
              'Don\'t agree to any \'settlement\'',
              'Don\'t physically resist arrest',
              'Don\'t provide unnecessary information',
              'Don\'t let police search home without warrant',
              'Don\'t panic or threaten officers',
            ].map((item, i) => (
              <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                <span className="text-red-400">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Family Notification */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-blue-400 mb-4">👨‍👩‍👧‍👦 Family Notification Rights</h3>
        <ul className="space-y-2">
          {[
            'Police MUST inform a family member or friend about the arrest (DK Basu guidelines)',
            'The arrested person has the right to make one phone call',
            'Arrest memo must be shared with a family member',
            'If a woman is arrested, a female officer must be present',
            'Arrest cannot be made after sunset and before sunrise (for women)',
          ].map((item, i) => (
            <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
              <span className="text-blue-400">→</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Bail Information */}
      <div className="bg-white dark:bg-[#111827]/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
        <h3 className="text-lg font-bold text-[#FF9933] mb-4">🔓 Bail Information</h3>
        <div className="space-y-3">
          <div className="bg-[#138808]/10 border border-[#138808]/20 rounded-xl p-4">
            <h4 className="font-semibold text-[#138808] text-sm">Bailable Offences</h4>
            <p className="text-gray-400 dark:text-white/40 text-xs mt-1">Bail is a RIGHT. Police station itself can grant bail. If refused, approach Magistrate.</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <h4 className="font-semibold text-amber-400 text-sm">Non-Bailable Offences</h4>
            <p className="text-gray-400 dark:text-white/40 text-xs mt-1">Bail is at the discretion of the court. Apply to Sessions Court or High Court.</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <h4 className="font-semibold text-blue-400 text-sm">Anticipatory Bail (Section 438 CrPC)</h4>
            <p className="text-gray-400 dark:text-white/40 text-xs mt-1">Apply BEFORE arrest if you apprehend arrest. Approach Sessions Court or High Court.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SeniorCitizenDetail() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Key Law */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-purple-400 mb-2">📜 Maintenance and Welfare of Parents and Senior Citizens Act, 2007</h3>
        <p className="text-gray-400 dark:text-white/40 text-sm mb-4">Key provisions for protection of elderly rights in India</p>
        <ul className="space-y-2">
          {[
            'Children & legal heirs MUST maintain senior citizens',
            'Tribunal can order maintenance up to ₹10,000/month per parent',
            'Senior citizens can revoke property transfers made to children if neglected',
            'Government must set up old age homes in every district',
            'Penalty for abandoning senior citizens',
          ].map((item, i) => (
            <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
              <span className="text-purple-400">⚫</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Helpline */}
      <div className="bg-[#FF9933]/10 border border-[#FF9933]/30 rounded-2xl p-6 text-center">
        <div className="text-4xl font-bold text-[#FF9933]">14567</div>
        <div className="text-gray-400 dark:text-white/40 mt-1">Elder Line — National Helpline for Senior Citizens</div>
        <div className="text-xs text-gray-500 dark:text-white/50 mt-1">Available in 18 languages, 24×7</div>
      </div>

      {/* Property Rights */}
      <div className="bg-white dark:bg-[#111827]/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
        <h3 className="text-lg font-bold text-[#FF9933] mb-4">🏠 Property Rights</h3>
        <ul className="space-y-3">
          {[
            { title: 'Right to Revoke Gift', desc: 'If a senior citizen transfers property to children/relatives who then neglect them, the transfer can be declared void' },
            { title: 'Right to Residence', desc: 'Senior citizens cannot be evicted from their own property by children or relatives' },
            { title: 'Will & Testament', desc: 'Every senior citizen has the right to make a will for their self-acquired property' },
            { title: 'Ancestral Property', desc: 'Rights in ancestral property remain protected under Hindu Succession Act' },
          ].map((item) => (
            <div key={item.title} className="bg-white dark:bg-[#111827]/5 rounded-xl p-4">
              <h4 className="font-semibold text-white text-sm">{item.title}</h4>
              <p className="text-gray-400 dark:text-white/40 text-xs mt-1">{item.desc}</p>
            </div>
          ))}
        </ul>
      </div>

      {/* Common Issues */}
      <div className="bg-white dark:bg-[#111827]/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
        <h3 className="text-lg font-bold text-[#FF9933] mb-4">🔧 Common Issues & Solutions</h3>
        <div className="space-y-3">
          {[
            { issue: 'Children refusing maintenance', solution: 'File application before Maintenance Tribunal. Court can order children to pay up to ₹10,000/month.' },
            { issue: 'Property grabbed by children', solution: 'File complaint under Senior Citizens Act. Property transfer made by fraud/coercion can be revoked.' },
            { issue: 'Physical abuse or neglect', solution: 'File FIR under IPC 323/324. Contact Elder Line 14567 for immediate assistance.' },
            { issue: 'Pension issues', solution: 'Approach District Social Welfare Officer. File RTI for pension status.' },
            { issue: 'Healthcare denial', solution: 'Senior citizens get priority in government hospitals. CGHS/state health schemes available.' },
          ].map((item) => (
            <div key={item.issue} className="bg-white dark:bg-[#111827]/5 rounded-xl p-4">
              <h4 className="font-semibold text-red-400 text-sm">❓ {item.issue}</h4>
              <p className="text-[#138808] text-xs mt-1">✅ {item.solution}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function EmergencyPage() {
  const [selected, setSelected] = useState<string | null>(null);

  const renderDetail = () => {
    switch (selected) {
      case 'women-safety': return <WomenSafetyDetail />;
      case 'cyber-crime': return <CyberCrimeDetail />;
      case 'police-encounter': return <PoliceEncounterDetail />;
      case 'arrest-rights': return <ArrestRightsDetail />;
      case 'senior-citizen': return <SeniorCitizenDetail />;
      default: return null;
    }
  };

  const selectedCategory = categories.find(c => c.id === selected);

  return (
    <div className="min-h-screen bg-[#0A1628] text-white">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-[#0A1628]/90 backdrop-blur-xl border-b border-red-500/20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="w-10 h-10 rounded-xl bg-white dark:bg-[#111827]/10 hover:bg-white dark:bg-[#111827]/20 flex items-center justify-center transition-colors"
          >
            ←
          </Link>
          <h1 className="text-xl font-bold">
            🆘 <span className="text-red-400">Emergency</span> Legal Assistance
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Urgency Banner */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
          <p className="text-sm text-red-300">
            If you are in <strong>immediate danger</strong>, call <strong className="text-red-400">112</strong> right now. Your safety comes first.
          </p>
        </div>

        {!selected ? (
          /* Category Grid */
          <div className="space-y-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelected(cat.id)}
                className="w-full text-left bg-white dark:bg-[#111827]/5 hover:bg-white dark:bg-[#111827]/10 border border-white/10 hover:border-red-500/30 rounded-2xl p-6 backdrop-blur-sm transition-all duration-300 group"
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{cat.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">{cat.title}</h3>
                    <p className="text-sm text-gray-400 dark:text-white/40 mt-0.5">{cat.subtitle}</p>
                  </div>
                  <span className="text-gray-500 dark:text-white/50 group-hover:text-red-400 transition-colors text-xl">→</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* Detail View */
          <div>
            <button
              onClick={() => setSelected(null)}
              className="mb-4 flex items-center gap-2 text-sm text-gray-400 dark:text-white/40 hover:text-white transition-colors"
            >
              ← Back to categories
            </button>
            <div className="mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <span>{selectedCategory?.icon}</span>
                <span className="text-red-400">{selectedCategory?.title}</span>
              </h2>
              <p className="text-gray-400 dark:text-white/40 text-sm mt-1">{selectedCategory?.subtitle}</p>
            </div>
            {renderDetail()}
          </div>
        )}

        {/* PREMIUM SPECIALIST CONSULTATION BANNER */}
        <div className="mt-8 relative overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-r from-[#0b1426] via-[#1b253b] to-[#0b1426] p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                ⭐ Premium Consultation
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse">
                🔥 Limited Offer
              </span>
            </div>
            <h4 className="text-xs font-bold text-white tracking-tight">
              Need Instant Expert Advice? Talk to a Specialist for ₹200 (Original ₹5000)
            </h4>
            <p className="text-[10px] text-white/50 leading-relaxed">
              Get immediate cyber fraud, domestic dispute strategy, and safety roadmaps directly from senior specialists.
            </p>
          </div>
          <Link href="/marketplace" className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#020813] font-extrabold rounded-xl text-[10px] flex items-center justify-center gap-1 transition-all shadow-md shadow-amber-500/10 shrink-0">
            <span>Talk to Specialist</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

